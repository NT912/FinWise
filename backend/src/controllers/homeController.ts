import { Request, Response } from "express";
import { getHomeDataService } from "../services/homeService";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

export const getHomeData = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized - User ID is missing" });
      return;
    }

    const homeData = await getHomeDataService(userId);

    res.json(homeData);
  } catch (error) {
    console.error("🚨 Lỗi lấy dữ liệu Home:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};
