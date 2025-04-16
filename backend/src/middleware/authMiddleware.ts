import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// ✅ Định nghĩa kiểu mở rộng cho Request
export interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

// ✅ Middleware xác thực JWT
export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      res.status(401).json({ message: "Unauthorized - No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized - Invalid token format" });
      return;
    }

    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string;
    };

    if (!decoded) {
      res.status(401).json({ message: "Unauthorized - Invalid token" });
      return;
    }

    // Find user in DB
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "Unauthorized - User not found" });
      return;
    }

    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res
      .status(401)
      .json({ message: "Unauthorized - Token verification failed" });
  }
};
