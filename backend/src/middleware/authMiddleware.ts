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
      return; // ✅ Fix lỗi bằng cách return sau khi gửi response
    }

    const token = authHeader.split(" ")[1]; // ✅ Lấy token từ "Bearer <token>"

    if (!token) {
      res.status(401).json({ message: "Unauthorized - Invalid token format" });
      return; // ✅ Fix lỗi bằng cách return sau khi gửi response
    }

    // ✅ Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    if (!decoded) {
      res.status(401).json({ message: "Unauthorized - Invalid token" });
      return; // ✅ Fix lỗi bằng cách return sau khi gửi response
    }

    // ✅ Tìm user trong DB
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "Unauthorized - User not found" });
      return; // ✅ Fix lỗi bằng cách return sau khi gửi response
    }

    req.user = { id: decoded.userId }; // ✅ Gán user vào request
    next(); // ✅ Nếu hợp lệ, tiếp tục xử lý request
  } catch (error) {
    console.error("JWT Auth Error:", error);
    res
      .status(401)
      .json({ message: "Unauthorized - Token verification failed" });
    return; // ✅ Fix lỗi bằng cách return sau khi gửi response
  }
};
