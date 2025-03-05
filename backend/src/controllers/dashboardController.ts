import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { getDashboardDataService } from "../services/dashboardService";

export const fetchDashboardData = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const dashboardData = await getDashboardDataService(req.user.id);
    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server error" });
  }
};
