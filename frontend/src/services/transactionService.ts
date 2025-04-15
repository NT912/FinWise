import api from "./apiService";
import { Transaction } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.7:3002";
const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // ms

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

// Helper function to wait for a specified time
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to create a new transaction with retry mechanism
export const createTransaction = async (transactionData: any): Promise<any> => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const token = await AsyncStorage.getItem("token");

      console.log("🔄 Đang tạo giao dịch mới...", transactionData);
      console.log("🔄 Request: /api/transactions");

      const response = await api.post("/api/transactions", transactionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Đã tạo giao dịch mới:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Lỗi khi tạo giao dịch:", error);

      // Check if it's a WriteConflict error
      if (
        error.response?.status === 500 &&
        (error.response?.data?.retryable ||
          (error.response?.data?.error &&
            error.response?.data?.error.includes("WriteConflict")))
      ) {
        retries++;
        console.log(
          `⚠️ Lỗi WriteConflict, thử lại lần ${retries}/${MAX_RETRIES}`
        );

        if (retries < MAX_RETRIES) {
          // Wait a bit before retrying (exponential backoff)
          const delay = RETRY_DELAY * Math.pow(2, retries - 1);
          await wait(delay);
          continue;
        }
      }

      // If it's not a WriteConflict error or we've reached max retries, throw the error
      throw error;
    }
  }

  throw new Error("Exceeded maximum retry attempts");
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

    // Xử lý phản hồi có thể cấu trúc khác nhau
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
): Promise<{ success: boolean; message: string }> => {
  let retryCount = 0;
  const maxRetries = 5; // Tăng số lần thử

  const performDelete = async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      // Thêm timeout dài hơn
      const timeout = 15000; // 15 seconds

      console.log(
        `🔄 Đang xóa giao dịch: ${transactionId} (Lần thử ${retryCount + 1}/${
          maxRetries + 1
        })`
      );
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await api.delete(
          `/api/transactions/${transactionId}`,
          {
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        console.log(`✅ Đã xóa giao dịch: ${transactionId}`);

        // Trả về kết quả từ server nếu có
        if (response.data && typeof response.data === "object") {
          return response.data;
        }

        // Nếu server không trả về đúng định dạng, tạo một response chuẩn
        return { success: true, message: "Transaction deleted successfully" };
      } catch (e) {
        clearTimeout(timeoutId);
        throw e; // Re-throw để xử lý ở catch bên ngoài
      }
    } catch (error: any) {
      // Chỉ ghi log lỗi ở lần cuối hoặc khi cần debug
      if (retryCount === maxRetries) {
        console.error(`❌ Lỗi khi xóa giao dịch ${transactionId}:`, error);
      }

      // Xử lý response lỗi từ server
      if (error.response && error.response.data) {
        // Giảm số lượng log
        if (retryCount === maxRetries) {
          console.error("Server error response:", error.response.data);
        }

        // Kiểm tra xem có phải lỗi xung đột ghi không
        const errorMessage = error.response.data.message || "";
        if (
          (errorMessage.includes("Write conflict") ||
            errorMessage.includes("Caused by") ||
            error.response.status === 500) &&
          retryCount < maxRetries
        ) {
          retryCount++;
          // Đợi một khoảng thời gian dài hơn trước khi thử lại
          const delay = Math.floor(Math.random() * 2000) + 1000; // 1000-3000ms
          console.log(
            `⚠️ Xung đột khi lưu, thử lại lần ${retryCount} sau ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return performDelete(); // Thử lại
        }

        throw new Error(errorMessage || "Failed to delete transaction");
      }

      // Xử lý timeout
      if (error.name === "AbortError") {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`⏱️ Hết thời gian chờ, thử lại lần ${retryCount}...`);
          return performDelete(); // Thử lại
        }
        throw new Error("Connection timeout. Please try again later.");
      }

      // Xử lý lỗi network hoặc không có response
      if (error.request) {
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = Math.floor(Math.random() * 1000) + 500;
          console.log(
            `🔄 Lỗi kết nối, thử lại lần ${retryCount} sau ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return performDelete(); // Thử lại
        }
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      }

      throw new Error(error.message || "Failed to delete transaction");
    }
  };

  return performDelete();
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
