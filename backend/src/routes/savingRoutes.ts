import express, { RequestHandler } from "express";
import {
  createSavingGoal,
  getSavingGoals,
  updateSavingGoal,
  getSavingsSummary,
} from "../controllers/savingController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

// Apply authentication middleware to all saving routes
router.use(authenticateJWT);

// Get savings summary
router.get("/summary", getSavingsSummary as RequestHandler);

// Get all saving goals
router.get("/goals", getSavingGoals as RequestHandler);

// Create a new saving goal
router.post("/goals", createSavingGoal as RequestHandler);

// Update a saving goal
router.put("/goals/:goalId", updateSavingGoal as RequestHandler);

export default router;
