import express, { RequestHandler } from "express";
import { authenticateJWT } from "../middleware/authMiddleware";
import {
  getTotalBudget,
  updateTotalBudget,
  getSavingsSummary,
  createSavingGoal,
  updateSavingGoal,
  setSavingAmount,
  setTargetSavingAmount,
  getSimpleSavingsInfo,
  updateSavingAmountFromTransactions,
} from "../controllers/savingsController";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Total budget routes
router.get("/total-budget", getTotalBudget as RequestHandler);
router.put("/total-budget", updateTotalBudget as RequestHandler);

// Savings summary route
router.get("/summary", getSavingsSummary as RequestHandler);

// Create saving goal
router.post("/create-goal", createSavingGoal as RequestHandler);

// Update saving goal
router.put("/update-goal/:goalId", updateSavingGoal as RequestHandler);

// Simple saving management routes
router.get("/simple-info", getSimpleSavingsInfo as RequestHandler);
router.post("/saving-amount", setSavingAmount as RequestHandler);
router.post("/target-amount", setTargetSavingAmount as RequestHandler);
router.get(
  "/calculate-from-transactions",
  updateSavingAmountFromTransactions as RequestHandler
);

export default router;
