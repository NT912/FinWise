import { Response } from "express";
import { getChartDataService } from "../services/chartService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const getChartData = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chartData = await getChartDataService(req.user.id);
    res.json(chartData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ message: "Server error" });
  }
};
