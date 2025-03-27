import { Response } from "express";
import {
  getUserCategories,
  getCategoriesByType,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import { ApiError } from "../utils/ApiError";
import { handleApiError } from "../utils/errorHandler";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// Get all categories for the current user
export const getAllCategories = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const categories = await getUserCategories(userId);
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    return handleApiError(error, res);
  }
};

// Get categories by type (income/expense)
export const getCategoriesForType = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const { type } = req.params;
    if (type !== "income" && type !== "expense") {
      throw new ApiError(
        400,
        "Invalid category type. Must be 'income' or 'expense'"
      );
    }

    const categories = await getCategoriesByType(userId, type);
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    return handleApiError(error, res);
  }
};

// Create a new category
export const addCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const { name, icon, color, type } = req.body;

    // Validate required fields
    if (!name || !icon || !color || !type) {
      throw new ApiError(400, "Name, icon, color, and type are required");
    }

    // Validate type
    if (type !== "income" && type !== "expense") {
      throw new ApiError(400, "Type must be 'income' or 'expense'");
    }

    const newCategory = await createCategory(
      { name, icon, color, type },
      userId
    );
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    return handleApiError(error, res);
  }
};

// Update an existing category
export const modifyCategory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const { categoryId } = req.params;
    const { name, icon, color } = req.body;

    // Validate that at least one field to update is provided
    if (!name && !icon && !color) {
      throw new ApiError(400, "At least one field to update is required");
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (icon) updateData.icon = icon;
    if (color) updateData.color = color;

    const updatedCategory = await updateCategory(
      categoryId,
      updateData,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    return handleApiError(error, res);
  }
};

// Delete a category
export const removeCategory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const { categoryId } = req.params;

    await deleteCategory(categoryId, userId);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, res);
  }
};
