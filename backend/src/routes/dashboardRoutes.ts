import express from "express";
import { getDashboardData } from "../controllers/dashboardController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/dashboard", authenticateJWT, getDashboardData);

export default router;
