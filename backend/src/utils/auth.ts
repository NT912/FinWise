import jwt from "jsonwebtoken";
import { Request } from "express";

export const getUserIdFromToken = async (req: Request): Promise<string> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new Error("No token provided");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key"
  ) as { userId: string };
  return decoded.userId;
};
