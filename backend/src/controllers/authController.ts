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
import { validateEmail } from "../utils/validation";

// �� Đăng ký tài khoản
const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, phoneNumber, dateOfBirth } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with all fields
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Return success response with token and user data (excluding password)
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      avatar: user.avatar,
      notifications: user.notifications,
      accountStatus: user.accountStatus,
    };

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: userResponse,
    });
  } catch (error: any) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((err: any) => err.message),
      });
    }

    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration",
    });
  }
};

// 📌 Đăng nhập tài khoản
const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log("👤 Login attempt for email:", email);

    // Validate input
    if (!email || !password) {
      console.log("❌ Missing credentials");
      res.status(400).json({
        message: "Please provide email and password",
        success: false,
      });
      return;
    }

    // Find user with detailed logging
    console.log("🔍 Searching for user in database...");
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found in database for email:", email);
      console.log("📝 Request body:", req.body);
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
const googleLogin = async (req: Request, res: Response): Promise<void> => {
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
      error:
        error instanceof Error ? error.message : "Google authentication failed",
    });
  }
};

// 📌 Đăng nhập bằng Facebook
const facebookLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessToken } = req.body;
    const token = await loginWithFacebook(accessToken);
    res.json({ token });
  } catch (error) {
    console.error("❌ Facebook login error:", error);
    res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : "Facebook authentication failed",
    });
  }
};

// 📌 Quên mật khẩu
const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    await sendResetPasswordEmail(email);
    res.json({ message: "Reset password email sent" });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to send reset password email",
    });
  }
};

// 📌 Đặt lại mật khẩu
const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    const result = await resetUserPassword(email, resetCode, newPassword);

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Reset password error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid reset code",
    });
  }
};

// 📌 Xác thực mã reset
const verifyResetCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, resetCode } = req.body;

    console.log("🔍 Verifying reset code for:", email);
    console.log("Reset code:", resetCode);

    // Tìm user với email và mã reset
    const user = await User.findOne({
      email,
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: new Date() },
    });

    console.log("Found user:", user ? "Yes" : "No");

    if (!user) {
      console.log("❌ Invalid or expired reset code");
      res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
      return;
    }

    console.log("✅ Reset code is valid");
    res.json({
      success: true,
      message: "Reset code is valid",
    });
  } catch (error) {
    console.error("❌ Verify reset code error:", error);
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to verify reset code",
    });
  }
};

export {
  register,
  login,
  googleLogin,
  facebookLogin,
  forgotPassword,
  resetPassword,
  verifyResetCode,
};
