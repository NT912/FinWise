import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import User, { IUser } from "../models/User"; // ✅ Import đúng kiểu IUser
import PasswordReset from "../models/PasswordReset";
import nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 📌 Cấu hình email sender
const transporter: Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// 📌 Tạo JWT token
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// 📌 Đăng ký người dùng
export const registerUser = async (
  fullName: string,
  email: string,
  password: string
) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already exists!");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ fullName, email, password: hashedPassword });

  await newUser.save();
  return generateToken(newUser._id.toHexString());
};

// 📌 Đăng nhập người dùng
export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email does not exist!");

  if (!user.password) {
    throw new Error("This account was created using Google/Facebook login.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Incorrect password!");

  return generateToken(user._id.toHexString());
};

// 📌 Đăng nhập bằng Google
export const loginWithGoogle = async (idToken: string) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new Error("Invalid Google token");

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({
        email: payload.email,
        fullName: payload.name,
        googleId: payload.sub, // ✅ Đảm bảo User Model có `googleId`
        avatar: payload.picture,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    return generateToken(user._id.toString()); // ✅ Ép kiểu _id thành string
  } catch (error) {
    throw new Error("Google authentication failed");
  }
};

// 📌 Đăng nhập bằng Facebook
export const loginWithFacebook = async (accessToken: string) => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    const { id, name, email, picture } = response.data;
    if (!email) throw new Error("Facebook did not provide an email");

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        fullName: name,
        facebookId: id, // ✅ Đảm bảo User Model có `facebookId`
        avatar: picture?.data?.url,
      });
      await user.save();
    } else if (!user.facebookId) {
      user.facebookId = id;
      await user.save();
    }

    return generateToken(user._id.toString()); // ✅ Ép kiểu _id thành string
  } catch (error) {
    throw new Error("Facebook authentication failed");
  }
};

// 📌 Gửi email chứa mã reset mật khẩu
export const sendResetPasswordEmail = async (email: string) => {
  try {
    const resetCode = generateResetToken();

    // ✅ Xóa các mã cũ nếu có
    await PasswordReset.deleteMany({ email });

    // ✅ Lưu resetCode vào DB
    await new PasswordReset({ email, resetCode }).save();
    console.log(`📤 Saved resetCode: ${resetCode} for email: ${email}`);

    // ✅ Gửi email cho user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Reset Code",
      html: `
        <h1>Reset Password</h1>
        <p>Your verification code is:</p>
        <h2 style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px;">
          ${resetCode}
        </h2>
        <p>This code is valid for 1 hour.</p>
      `,
    });

    return { success: true, message: "Reset code sent via email!" };
  } catch (error) {
    console.error("❌ Error sending reset password email:", error);
    throw new Error("Cannot send verification code!");
  }
};

// 📌 Xác nhận mã reset & đặt lại mật khẩu
export const resetUserPassword = async (
  email: string,
  resetCode: string,
  newPassword: string
) => {
  try {
    const resetRecord = await PasswordReset.findOne({ email, resetCode });

    if (!resetRecord) {
      throw new Error("Invalid or expired reset code!");
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      throw new Error("User not found!");
    }

    // ✅ Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // ✅ Xóa reset code sau khi đặt lại thành công
    await PasswordReset.deleteMany({ email });

    return { success: true, message: "Password reset successfully!" };
  } catch (error: any) {
    console.error("❌ Error resetting password:", error);
    throw new Error(error.message || "Unknown error resetting password.");
  }
};

// 📌 Tạo mã xác nhận ngẫu nhiên
export const generateResetToken = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
