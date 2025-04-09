import api from "./apiService";
import { Transaction } from "../types";

const API_URL = "http://192.168.1.8:3002";

/**
 * Fetch all transactions for the current user
 * @returns Array of transactions
 */
export const getAllTransactions = async (): Promise<Transaction[]> => {
  try {
    console.log("🔄 Đang lấy tất cả giao dịch...");
    const response = await api.get("/api/transactions");
    console.log(`✅ Đã lấy ${response.data.length || 0} giao dịch`);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy giao dịch:", error);
    throw error;
  }
};

/**
 * Fetch transactions for a specific category
 * @param categoryId The ID of the category
 * @returns Array of transactions for the category
 */
export const getTransactionsByCategory = async (
  categoryId: string
): Promise<Transaction[]> => {
  try {
    console.log(`🔄 Đang lấy giao dịch cho danh mục: ${categoryId}`);
    const response = await api.get(`/api/transactions/category/${categoryId}`);
    console.log(
      `✅ Đã lấy ${response.data.length || 0} giao dịch cho danh mục`
    );
    return response.data;
  } catch (error) {
    console.error(
      `❌ Lỗi khi lấy giao dịch theo danh mục ${categoryId}:`,
      error
    );
    throw error;
  }
};

/**
 * Fetch a specific transaction by ID
 * @param transactionId The ID of the transaction
 * @returns Transaction details
 */
export const getTransactionById = async (
  transactionId: string
): Promise<Transaction> => {
  try {
    console.log(`🔄 Đang lấy chi tiết giao dịch: ${transactionId}`);
    const response = await api.get(`/api/transactions/${transactionId}`);
    console.log(`✅ Đã lấy chi tiết giao dịch: ${transactionId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Lỗi khi lấy chi tiết giao dịch ${transactionId}:`, error);
    throw error;
  }
};

/**
 * Create a new transaction
 * @param transactionData The data for the new transaction
 * @returns Created transaction
 */
export const createTransaction = async (
  transactionData: any
): Promise<Transaction> => {
  try {
    console.log("🔄 Đang tạo giao dịch mới...", transactionData);
    const response = await api.post("/api/transactions", transactionData);

    // Xử lý phản hồi có thể có cấu trúc khác nhau
    const result = response.data.transaction || response.data;
    console.log("✅ Đã tạo giao dịch mới:", result._id);
    return result;
  } catch (error) {
    console.error("❌ Lỗi khi tạo giao dịch:", error);
    throw error;
  }
};

/**
 * Update an existing transaction
 * @param transactionId The ID of the transaction to update
 * @param transactionData The updated data
 * @returns Updated transaction
 */
export const updateTransaction = async (
  transactionId: string,
  transactionData: Partial<Transaction>
): Promise<Transaction> => {
  try {
    console.log(`🔄 Đang cập nhật giao dịch: ${transactionId}`);
    const response = await api.put(
      `/api/transactions/${transactionId}`,
      transactionData
    );

    // Xử lý phản hồi có thể có cấu trúc khác nhau
    const result = response.data.transaction || response.data;
    console.log(`✅ Đã cập nhật giao dịch: ${transactionId}`);
    return result;
  } catch (error) {
    console.error(`❌ Lỗi khi cập nhật giao dịch ${transactionId}:`, error);
    throw error;
  }
};

/**
 * Delete a transaction
 * @param transactionId The ID of the transaction to delete
 * @returns Success message
 */
export const deleteTransaction = async (
  transactionId: string
): Promise<void> => {
  try {
    console.log(`🔄 Đang xóa giao dịch: ${transactionId}`);
    await api.delete(`/api/transactions/${transactionId}`);
    console.log(`✅ Đã xóa giao dịch: ${transactionId}`);
  } catch (error) {
    console.error(`❌ Lỗi khi xóa giao dịch ${transactionId}:`, error);
    throw error;
  }
};

/**
 * Get transactions by date range
 * @param startDate Start date (ISO string)
 * @param endDate End date (ISO string)
 * @returns Array of transactions within the date range
 */
export const getTransactionsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<Transaction[]> => {
  try {
    console.log(`🔄 Đang lấy giao dịch từ ${startDate} đến ${endDate}`);
    const response = await api.get("/api/transactions/date-range", {
      params: { startDate, endDate },
    });
    console.log(
      `✅ Đã lấy ${response.data.length || 0} giao dịch theo khoảng thời gian`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy giao dịch theo khoảng thời gian:", error);
    throw error;
  }
};

export default {
  getAllTransactions,
  getTransactionsByCategory,
  getTransactionsByDateRange,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionById,
};
