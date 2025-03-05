import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  loginWithFacebook,
  sendResetPasswordEmail,
  resetUserPassword,
  generateResetToken,
} from "../services/authService";
import PasswordReset from "../models/PasswordReset";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 📌 Đăng ký tài khoản
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Registration request body:", req.body);
    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      console.log("Missing fields:", { email, password, fullName });
      res.status(400).json({
        message: "Please provide all required fields",
        success: false,
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      res.status(400).json({
        message: "User already exists",
        success: false,
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("Creating new user with data:", {
      email,
      fullName,
      hashedPassword: "hidden",
    });

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      fullName,
    });

    await user.save();
    console.log("User saved successfully:", user._id);

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Detailed registration error:", error);
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Error registering user",
      success: false,
    });
  }
};

// 📌 Đăng nhập tài khoản
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    // Validate input
    if (!email || !password) {
      console.log("Missing credentials");
      res.status(400).json({
        message: "Please provide email and password",
        success: false,
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
      return;
    }

    console.log("User found, checking password");

    // Check password
    if (!user.password) {
      throw new Error("This account was created using Google/Facebook login.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    console.log("Login successful for:", email);

    // Success response with token
    res.json({
      message: "Login successful",
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Login error details:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Error during login",
      success: false,
      error: error instanceof Error ? error.stack : "Unknown error",
    });
  }
};

// 📌 Đăng nhập bằng Google
export const googleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("🔍 Google login request body:", req.body);
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: "Google ID token is required!" });
      return;
    }

    const token = await loginWithGoogle(idToken);
    res.json({ token });
  } catch (error) {
    console.error("❌ Google login error:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Google login failed!",
    });
  }
};

// 📌 Đăng nhập bằng Facebook
export const facebookLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("🔍 Facebook login request body:", req.body);
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: "Facebook ID token is required!" });
      return;
    }

    const token = await loginWithFacebook(idToken);
    res.json({ token });
  } catch (error) {
    console.error("❌ Facebook login error:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Facebook login failed!",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }

    // ✅ Tạo mã reset ngẫu nhiên (Không truyền tham số)
    const resetToken = generateResetToken();

    // ✅ Xóa reset code cũ trước khi tạo mới
    await PasswordReset.deleteMany({ email });

    // ✅ Lưu reset code mới vào database
    await new PasswordReset({
      email,
      resetCode: resetToken,
      createdAt: new Date(),
    }).save();

    console.log(`📤 Reset Code: ${resetToken} for email: ${email}`);

    // ✅ Gửi email chứa mã xác nhận
    await sendResetPasswordEmail(email);

    res.json({
      message: "Verification code has been sent via email!",
      success: true,
    });
  } catch (error) {
    console.error("Lỗi khi gửi ResetPassword", error);
    res.status(500).json({
      message: "Error sending reset code!",
      success: false,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  console.log("🔍 Reset Password API Request Body:", req.body);

  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      console.log("Lỗi: Thiếu thông tin!", {
        email,
        resetCode,
        newPassword,
      });
      return res.status(400).json({
        message: "Missing necessary information!",
        success: false,
      });
    }

    // ✅ Tìm mã reset mới nhất trong bảng PasswordReset
    const resetRecord = await PasswordReset.findOne({ email })
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian mới nhất
      .exec();

    if (!resetRecord) {
      console.log("Không tìm thấy reset code trong DB!");
      return res.status(400).json({
        message: "Reset code not issued yet!",
        success: false,
      });
    }

    console.log(
      "📌 Reset Code trong DB:",
      resetRecord.resetCode,
      "| Reset Code nhận được:",
      resetCode
    );

    // ✅ Kiểm tra reset code có khớp không
    if (resetRecord.resetCode !== resetCode) {
      console.log("Mã xác nhận không hợp lệ!");
      return res.status(400).json({
        message: "Invalid confirmation code!",
        success: false,
      });
    }

    // ✅ Kiểm tra reset code có hết hạn không (Giả sử có thời gian hết hạn)
    if (
      resetRecord.createdAt &&
      Date.now() - resetRecord.createdAt.getTime() > 3600000
    ) {
      console.log("Mã xác nhận đã hết hạn!");
      return res.status(400).json({
        message: "The verification code has expired!",
        success: false,
      });
    }

    // ✅ Cập nhật mật khẩu mới cho user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });

    // ✅ Xóa reset code khỏi DB sau khi sử dụng
    await PasswordReset.deleteMany({ email });

    console.log("Mật khẩu đặt lại thành công cho:", email);

    res.json({
      message: "Password reset successfully!",
      success: true,
    });
  } catch (error: any) {
    console.error("Reset password error:", error);

    res.status(500).json({
      message: error.message || "Error resetting password",
      success: false,
    });
  }
};
