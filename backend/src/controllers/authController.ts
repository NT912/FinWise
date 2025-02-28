import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  loginWithFacebook,
} from "../services/authService";

// 📌 Đăng ký tài khoản
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔍 Register request body:", req.body);
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ error: "All fields are required!" });
      return;
    }

    const token = await registerUser(fullName, email, password);
    res.status(201).json({ token });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

// 📌 Đăng nhập tài khoản
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔍 Login request body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required!" });
      return;
    }

    const token = await loginUser(email, password);
    res.json({ token });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Login failed!",
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
