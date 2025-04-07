import { Request, Response } from "express";
import Category, { ICategory } from "../models/Category";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

// Get all categories for a user
export const getCategories = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { type } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const query: any = { userId };

    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error("Error in getCategories:", error);
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

// Get a single category
export const getCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error });
  }
};

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, icon, color, type, budget, rules, isDefault, userId } =
      req.body;

    // Check if category with same name exists for user
    const existingCategory = await Category.findOne({ name, userId });
    if (existingCategory) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const category = new Category({
      name,
      icon,
      color,
      type,
      budget,
      rules,
      isDefault,
      userId,
      transactionCount: 0,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error creating category", error });
  }
};

// Update a category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, icon, color, type, budget, rules } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name,
        userId: category.userId,
      });
      if (existingCategory) {
        return res
          .status(400)
          .json({ message: "Category name already exists" });
      }
    }

    const updates = {
      name: name || category.name,
      icon: icon || category.icon,
      color: color || category.color,
      type: type || category.type,
      budget: budget !== undefined ? budget : category.budget,
      rules: rules || category.rules,
    };

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.isDefault) {
      return res
        .status(400)
        .json({ message: "Cannot delete default category" });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};

// Update category budget
export const updateCategoryBudget = async (req: Request, res: Response) => {
  try {
    const { budget } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.budget = budget;
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Error updating category budget", error });
  }
};

// Update category rules
export const updateCategoryRules = async (req: Request, res: Response) => {
  try {
    const { rules } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.rules = rules;
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Error updating category rules", error });
  }
};

// Increment transaction count for a category
export const incrementTransactionCount = async (categoryId: string) => {
  try {
    await Category.findByIdAndUpdate(categoryId, {
      $inc: { transactionCount: 1 },
    });
  } catch (error) {
    console.error("Error incrementing transaction count:", error);
  }
};

// Decrement transaction count for a category
export const decrementTransactionCount = async (categoryId: string) => {
  try {
    await Category.findByIdAndUpdate(categoryId, {
      $inc: { transactionCount: -1 },
    });
  } catch (error) {
    console.error("Error decrementing transaction count:", error);
  }
};
