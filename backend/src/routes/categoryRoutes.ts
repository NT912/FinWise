import express, { Request, Response, NextFunction } from "express";
import {
  getAllCategories,
  getCategoriesForType,
  addCategory,
  modifyCategory,
  removeCategory,
} from "../controllers/categoryController";
import { authenticateJWT } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

const router = express.Router();

// Apply authentication middleware to all category routes
router.use(authenticateJWT);

// Giải quyết lỗi TypeScript bằng cách xác định rõ type của handler
type RequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<any> | any;

// Get all categories for the current user
router.get("/", getAllCategories as RequestHandler);

// Get categories by type (income/expense)
router.get("/type/:type", getCategoriesForType as RequestHandler);

// Create a new category
router.post("/", addCategory as RequestHandler);

// Update an existing category
router.put("/:categoryId", modifyCategory as RequestHandler);

// Delete a category
router.delete("/:categoryId", removeCategory as RequestHandler);

export default router;
