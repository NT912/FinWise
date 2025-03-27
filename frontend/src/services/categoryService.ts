import api from "./apiService";
import { Category } from "../types";

// Fetch all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    console.log("📊 Fetching all categories...");
    const response = await api.get("/api/categories");
    console.log(
      "✅ Categories fetched successfully:",
      response.data.categories.length,
      "items"
    );
    return response.data.categories;
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
export const createCategory = async (categoryData: {
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
}): Promise<Category> => {
  try {
    console.log("📝 Creating new category:", categoryData.name);
    const response = await api.post("/api/categories", categoryData);
    console.log(
      "✅ Category created successfully:",
      response.data.category._id
    );
    return response.data.category;
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
  categoryId: string,
  updateData: {
    name?: string;
    icon?: string;
    color?: string;
  }
): Promise<Category> => {
  try {
    console.log(`📝 Updating category ${categoryId}:`, updateData);
    const response = await api.put(`/api/categories/${categoryId}`, updateData);
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
export const deleteCategory = async (categoryId: string): Promise<boolean> => {
  try {
    console.log(`🗑️ Deleting category ${categoryId}...`);
    await api.delete(`/api/categories/${categoryId}`);
    console.log(`✅ Category ${categoryId} deleted successfully`);
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

export default {
  getAllCategories,
  getCategoriesByType,
  createCategory,
  updateCategory,
  deleteCategory,
};
