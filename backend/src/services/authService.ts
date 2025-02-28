import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import admin from "../config/firebase";

// 📌 Tạo JWT token cho người dùng
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// 📌 Xử lý đăng ký người dùng
export const registerUser = async (
  fullName: string,
  email: string,
  password: string
) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email đã tồn tại!");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ fullName, email, password: hashedPassword });
  await newUser.save();

  return generateToken(newUser._id.toString());
};

// 📌 Xử lý đăng nhập người dùng
export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Email không tồn tại!");
  }

  console.log("🔍 Mật khẩu đã nhập:", password);
  console.log("🔍 Mật khẩu trong database:", user.password);

  if (!user.password) {
    throw new Error(
      "Tài khoản này không có mật khẩu. Vui lòng đăng nhập bằng Google/Facebook."
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log("🔍 Kết quả bcrypt.compare():", isMatch);

  if (!isMatch) {
    throw new Error("Mật khẩu không đúng!");
  }

  return jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
};

// 📌 Xử lý đăng nhập bằng Google
export const loginWithGoogle = async (idToken: string) => {
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  if (!decodedToken.email) throw new Error("Google authentication failed");

  let user = await User.findOne({ email: decodedToken.email });

  if (!user) {
    user = new User({
      googleId: decodedToken.uid,
      email: decodedToken.email,
      fullName: decodedToken.name,
      avatar: decodedToken.picture,
    });
    await user.save();
  }

  return generateToken(user._id.toString());
};

// 📌 Xử lý đăng nhập bằng Facebook
export const loginWithFacebook = async (idToken: string) => {
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  if (!decodedToken.email) throw new Error("Facebook authentication failed");

  let user = await User.findOne({ email: decodedToken.email });

  if (!user) {
    user = new User({
      facebookId: decodedToken.uid,
      email: decodedToken.email,
      fullName: decodedToken.name,
      avatar: decodedToken.picture,
    });
    await user.save();
  }

  return generateToken(user._id.toString());
};
