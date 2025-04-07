import api from "./apiService";
import { Category } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Fetch all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    console.log("📊 Fetching all categories...");
    const response = await api.get("/api/categories");
    console.log(
      "✅ Categories fetched successfully:",
      response.data.length,
      "items"
    );
    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching categories:", error.message);
    console.error("📝 Error details:", {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Fetch categories by type (income/expense)
export const getCategoriesByType = async (
  type: string
): Promise<Category[]> => {
  try {
    console.log(`📊 Fetching ${type} categories...`);
    const response = await api.get(`/api/categories/type/${type}`);
    console.log(
      `✅ ${type} categories fetched successfully:`,
      response.data.categories.length,
      "items"
    );
    return response.data.categories;
  } catch (error: any) {
    console.error(`❌ Error fetching ${type} categories:`, error.message);
    console.error("📝 Error details:", {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Create a new category
export const createCategory = async (
  category: Omit<Category, "_id">
): Promise<Category> => {
  try {
    console.log("📝 Creating new category:", category.name);
    const response = await api.post("/api/categories", category);
    console.log("✅ Response thành công:", {
      method: response.config.method,
      status: response.status,
      url: response.config.url,
    });

    // Check if response.data exists and has the expected structure
    if (response.data && response.data.category) {
      console.log(
        "✅ Category created successfully:",
        response.data.category._id
      );
      return response.data.category;
    } else {
      // If response.data doesn't have the expected structure, but the request was successful
      // we can assume the category was created and return a minimal category object
      console.log(
        "⚠️ Response structure unexpected, but request was successful"
      );
      return {
        _id: "temp-id", // This will be replaced when we fetch the categories
        ...category,
      } as Category;
    }
  } catch (error: any) {
    console.error("❌ Error creating category:", error.message);
    console.error("📝 Error details:", {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Update an existing category
export const updateCategory = async (
  id: string,
  category: {
    name?: string;
    icon?: string;
    color?: string;
    budget?: number;
    rules?: { keyword: string; isEnabled: boolean }[];
  }
): Promise<Category> => {
  try {
    console.log(`📝 Updating category ${id}:`, category);
    const response = await api.put(`/api/categories/${id}`, category);
    console.log(
      "✅ Category updated successfully:",
      response.data.category._id
    );
    return response.data.category;
  } catch (error: any) {
    console.error("❌ Error updating category:", error.message);
    console.error("📝 Error details:", {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    console.log(`🗑️ Deleting category ${id}...`);
    await api.delete(`/api/categories/${id}`);
    console.log(`✅ Category ${id} deleted successfully`);
    return true;
  } catch (error: any) {
    console.error("❌ Error deleting category:", error.message);
    console.error("📝 Error details:", {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Lấy thông tin danh mục theo ID
export const getCategoryById = async (
  categoryId: string
): Promise<Category> => {
  try {
    const response = await api.get(`/api/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error);
    throw error;
  }
};

export default {
  getAllCategories,
  getCategoriesByType,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
};
