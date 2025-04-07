import express, { RequestHandler } from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryBudget,
  updateCategoryRules,
} from "../controllers/categoryController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

// Apply authentication middleware to all category routes
router.use(authenticateJWT);

// Get all categories for a user
router.get("/", getCategories as RequestHandler);

// Get a single category
router.get("/:id", getCategory as RequestHandler);

// Create a new category
router.post("/", createCategory as RequestHandler);

// Update a category
router.put("/:id", updateCategory as RequestHandler);

// Delete a category
router.delete("/:id", deleteCategory as RequestHandler);

// Update category budget
router.put("/:id/budget", updateCategoryBudget as RequestHandler);

// Update category rules
router.put("/:id/rules", updateCategoryRules as RequestHandler);

export default router;
