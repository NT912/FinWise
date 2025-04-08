import { Types } from "mongoose";
import Category, { ICategory } from "../models/Category";
import { ApiError } from "../utils/ApiError";

// Default categories for new users
export const DEFAULT_CATEGORIES = [
  {
    name: "Food & Drink",
    icon: "restaurant",
    color: "#FF6B6B",
    type: "expense",
  },
  {
    name: "Shopping",
    icon: "cart",
    color: "#FB9468",
    type: "expense",
  },
  {
    name: "Transportation",
    icon: "car",
    color: "#4DC0F5",
    type: "expense",
  },
  {
    name: "Housing",
    icon: "home",
    color: "#8D76E8",
    type: "expense",
  },
  {
    name: "Entertainment",
    icon: "film",
    color: "#4EA5D9",
    type: "expense",
  },
  {
    name: "Health",
    icon: "medkit",
    color: "#43AA8B",
    type: "expense",
  },
  {
    name: "Education",
    icon: "book",
    color: "#4D8076",
    type: "expense",
  },
  {
    name: "Personal",
    icon: "person",
    color: "#F78764",
    type: "expense",
  },
  {
    name: "Gifts",
    icon: "gift",
    color: "#F94144",
    type: "expense",
  },
  {
    name: "Salary",
    icon: "cash",
    color: "#4CAF50",
    type: "income",
  },
  {
    name: "Business",
    icon: "briefcase",
    color: "#E6A919",
    type: "income",
  },
  {
    name: "Investment",
    icon: "trending-up",
    color: "#2196F3",
    type: "income",
  },
  {
    name: "Other",
    icon: "ellipsis-horizontal",
    color: "#9c9c9c",
    type: "expense",
  },
];

// Create default categories for a new user
export const createDefaultCategories = async (
  userId: string
): Promise<void> => {
  try {
    const userObjectId = new Types.ObjectId(userId);
    const categoriesToInsert = DEFAULT_CATEGORIES.map((category) => ({
      ...category,
      user: userObjectId,
      isDefault: true,
    }));

    await Category.insertMany(categoriesToInsert);
  } catch (error: any) {
    console.error("Error creating default categories:", error);
    throw new ApiError(500, "Error creating default categories");
  }
};

// Get all categories for a user
export const getUserCategories = async (
  userId: string
): Promise<ICategory[]> => {
  try {
    return await Category.find({ user: new Types.ObjectId(userId) }).sort({
      name: 1,
    });
  } catch (error: any) {
    console.error("Error fetching user categories:", error);
    throw new ApiError(500, "Error fetching categories");
  }
};

// Get categories by type (income/expense)
export const getCategoriesByType = async (
  userId: string,
  type: string
): Promise<ICategory[]> => {
  try {
    return await Category.find({
      user: new Types.ObjectId(userId),
      type,
    }).sort({ name: 1 });
  } catch (error: any) {
    console.error(`Error fetching ${type} categories:`, error);
    throw new ApiError(500, `Error fetching ${type} categories`);
  }
};

// Create a new category
export const createCategory = async (
  categoryData: Partial<ICategory>,
  userId: string
): Promise<ICategory> => {
  try {
    const newCategory = new Category({
      ...categoryData,
      user: new Types.ObjectId(userId),
    });

    return await newCategory.save();
  } catch (error: any) {
    if (error?.code === 11000) {
      // Duplicate key error code
      throw new ApiError(400, "A category with this name already exists");
    }

    console.error("Error creating category:", error);
    throw new ApiError(500, "Error creating category");
  }
};

// Update an existing category
export const updateCategory = async (
  categoryId: string,
  updateData: Partial<ICategory>,
  userId: string
): Promise<ICategory | null> => {
  try {
    const category = await Category.findOne({
      _id: new Types.ObjectId(categoryId),
      user: new Types.ObjectId(userId),
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    if (category.isDefault) {
      throw new ApiError(400, "Default categories cannot be updated");
    }

    // Update category
    return await Category.findByIdAndUpdate(
      categoryId,
      { $set: updateData },
      { new: true }
    );
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error?.code === 11000) {
      throw new ApiError(400, "A category with this name already exists");
    }

    console.error("Error updating category:", error);
    throw new ApiError(500, "Error updating category");
  }
};

// Delete a category
export const deleteCategory = async (
  categoryId: string,
  userId: string
): Promise<boolean> => {
  try {
    const category = await Category.findOne({
      _id: new Types.ObjectId(categoryId),
      user: new Types.ObjectId(userId),
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    if (category.isDefault) {
      throw new ApiError(400, "Default categories cannot be deleted");
    }

    await Category.deleteOne({ _id: new Types.ObjectId(categoryId) });
    return true;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Error deleting category:", error);
    throw new ApiError(500, "Error deleting category");
  }
};
