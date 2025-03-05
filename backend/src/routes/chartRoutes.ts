import express from "express";
import { getChartData } from "../controllers/chartController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/charts", authenticateJWT, async (req, res) => {
  try {
    await getChartData(req, res);
  } catch (error) {
    console.error("Chart route error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
