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
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized - No token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    req.user = { id: decoded.id }; // ✅ Gán user vào request

    next(); // ✅ Gọi `next()` để tiếp tục xử lý request
  } catch (error) {
    next(error); // ✅ Chuyển lỗi tới middleware xử lý lỗi (Express sẽ tự động trả về lỗi)
  }
};
