import { Request, Response } from "express";
import { getHomeDataService } from "../services/homeService";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

export const getHomeData = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const timeFilter = (req.query.timeFilter as string) || "monthly";

    if (!userId) {
      console.warn(
        "🚨 [homeController] Unauthorized request - User ID missing"
      );
      res.status(401).json({ message: "Unauthorized - User ID is missing" });
      return;
    }

    console.log(
      `✅ [homeController] Nhận request lấy dữ liệu Home với userId: ${userId}, timeFilter: ${timeFilter}`
    );

    const homeData = await getHomeDataService(userId, timeFilter);

    console.log(`✅ [homeController] Trả về dữ liệu Home:`, homeData);

    res.json(homeData);
  } catch (error) {
    console.error("🚨 [homeController] Lỗi lấy dữ liệu Home:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
