import { Request, Response } from "express";
import * as transactionService from "../services/transactionService";
import mongoose from "mongoose";

// Định nghĩa lại kiểu Request để có thuộc tính user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * Lấy tất cả giao dịch của người dùng
 */
export const getAllTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const transactions = await transactionService.getAllTransactions(userId);
    res.status(200).json(transactions);
  } catch (error: any) {
    console.error("Error in getAllTransactions controller:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/**
 * Lấy giao dịch theo danh mục
 */
export const getTransactionsByCategory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { categoryId } = req.params;
    const transactions = await transactionService.getTransactionsByCategory(
      userId,
      categoryId
    );
    res.status(200).json(transactions);
  } catch (error: any) {
    console.error("Error in getTransactionsByCategory controller:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/**
 * Lấy chi tiết giao dịch
 */
export const getTransactionById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { transactionId } = req.params;
    const transaction = await transactionService.getTransactionById(
      userId,
      transactionId
    );
    res.status(200).json(transaction);
  } catch (error: any) {
    console.error("Error in getTransactionById controller:", error);
    if (error.message === "Transaction not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/**
 * Tạo giao dịch mới
 */
export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, amount, date, category, type, note } = req.body;

    // Validate required fields
    if (!title || !amount || !date || !category || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Đảm bảo category là một string ID
    let categoryId = category;
    if (typeof category === "object" && category._id) {
      categoryId = category._id;
    }

    // Create transaction
    const transaction = await transactionService.createTransaction(userId, {
      title,
      amount,
      date,
      category: categoryId,
      type,
      note,
    });

    // Update user balance
    const amountChange = type === "income" ? amount : -amount;
    await transactionService.updateUserBalance(userId, amountChange);

    // Update category stats
    await transactionService.updateCategoryStats(categoryId, userId, amount);

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error: any) {
    console.error("Error in createTransaction controller:", error);

    // Check for WriteConflict error
    if (error.code === 112 && error.codeName === "WriteConflict") {
      return res.status(500).json({
        error:
          "WriteConflict: Transaction conflict detected. Please try again.",
        retryable: true,
      });
    }

    return res.status(500).json({
      error: error.message || "Failed to create transaction",
    });
  }
};

/**
 * Cập nhật giao dịch
 */
export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { transactionId } = req.params;
    const updateData = req.body;

    console.log(
      "⬇️ updateTransaction request data:",
      JSON.stringify(updateData, null, 2)
    );

    // Validation cơ bản
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }

    // Đảm bảo category là một string nếu có
    if (updateData.category) {
      console.log(
        "🔄 Processing category:",
        typeof updateData.category,
        updateData.category
      );

      if (
        typeof updateData.category === "object" &&
        updateData.category !== null &&
        updateData.category._id
      ) {
        console.log(
          "🔄 Converting category object to ID:",
          updateData.category._id
        );
        updateData.category = updateData.category._id;
      } else if (typeof updateData.category === "string") {
        try {
          // Kiểm tra xem có phải là JSON string không
          if (
            updateData.category.startsWith("{") &&
            updateData.category.endsWith("}")
          ) {
            const catObj = JSON.parse(updateData.category);
            if (catObj && catObj._id) {
              console.log("🔄 Extracted ID from JSON string:", catObj._id);
              updateData.category = catObj._id;
            }
          }
        } catch (e) {
          // Nếu không parse được JSON, giữ nguyên giá trị
          console.log("⚠️ Failed to parse category JSON:", e);
        }
      }
    }

    // Validation dữ liệu đầu vào
    if (updateData.amount !== undefined) {
      const amount = Number(updateData.amount);
      if (isNaN(amount) || amount <= 0) {
        return res
          .status(400)
          .json({ message: "Amount must be a positive number" });
      }
    }

    if (updateData.type && !["income", "expense"].includes(updateData.type)) {
      return res.status(400).json({
        message: "Transaction type must be either 'income' or 'expense'",
      });
    }

    try {
      // Lấy thông tin giao dịch cũ trước khi cập nhật
      const oldTransaction = await transactionService.getTransactionById(
        userId,
        transactionId
      );

      // Cập nhật giao dịch
      const updatedTransaction = await transactionService.updateTransaction(
        userId,
        transactionId,
        updateData
      );

      // Kiểm tra null
      if (!updatedTransaction) {
        return res.status(500).json({
          success: false,
          message: "Failed to update transaction",
        });
      }

      // Tạo biến mới đã được khẳng định rằng không null
      const safeTransaction = updatedTransaction;

      // Tính toán sự thay đổi số dư nếu số tiền hoặc loại giao dịch thay đổi
      if (updateData.amount !== undefined || updateData.type !== undefined) {
        const oldAmount =
          oldTransaction.type === "income"
            ? oldTransaction.amount
            : -oldTransaction.amount;

        const newAmount =
          safeTransaction.type === "income"
            ? safeTransaction.amount
            : -safeTransaction.amount;

        const amountChange = newAmount - oldAmount;

        // Cập nhật số dư người dùng
        if (amountChange !== 0) {
          await transactionService.updateUserBalance(userId, amountChange);
        }
      }

      // Cập nhật thống kê danh mục nếu thay đổi danh mục hoặc số tiền
      if (updateData.category || updateData.amount !== undefined) {
        try {
          // Lấy category ID từ transaction đã cập nhật
          let newCategoryId: string;
          const newCategory = safeTransaction.category;

          if (typeof newCategory === "object" && newCategory !== null) {
            if (newCategory._id) {
              newCategoryId = newCategory._id.toString();
            } else {
              console.warn("⚠️ Category object without _id:", newCategory);
              newCategoryId = String(newCategory);
            }
          } else {
            newCategoryId = String(newCategory);
          }

          // Lấy category ID cũ
          let oldCategoryId: string;
          const oldCategory = oldTransaction.category;

          if (typeof oldCategory === "object" && oldCategory !== null) {
            if (oldCategory._id) {
              oldCategoryId = oldCategory._id.toString();
            } else {
              console.warn("⚠️ Old category object without _id:", oldCategory);
              oldCategoryId = String(oldCategory);
            }
          } else {
            oldCategoryId = String(oldCategory);
          }

          // Xử lý nếu danh mục thay đổi
          if (oldCategoryId !== newCategoryId) {
            console.log(
              `📊 Category changed: ${oldCategoryId} -> ${newCategoryId}`
            );

            // Cập nhật danh mục mới
            await transactionService.updateCategoryStats(
              newCategoryId,
              userId,
              safeTransaction.amount
            );
          }
          // Nếu chỉ thay đổi số tiền, cập nhật thống kê danh mục hiện tại
          else if (updateData.amount !== undefined) {
            console.log(`📊 Amount changed for category ${newCategoryId}`);

            await transactionService.updateCategoryStats(
              newCategoryId,
              userId,
              safeTransaction.amount - oldTransaction.amount
            );
          }
        } catch (error) {
          console.error("❌ Error updating category stats:", error);
          // Không throw lỗi để không ảnh hưởng đến luồng cập nhật transaction
        }
      }

      res.status(200).json({
        success: true,
        message: "Transaction updated successfully",
        transaction: safeTransaction,
      });
    } catch (error: any) {
      // Xử lý các lỗi cụ thể từ service
      if (error.message === "Transaction not found") {
        return res.status(404).json({ message: error.message });
      } else if (
        error.message === "Invalid transaction ID" ||
        error.message === "Invalid category ID" ||
        error.message === "New category not found" ||
        error.message === "Amount must be a positive number" ||
        error.message ===
          "Transaction type must be either 'income' or 'expense'"
      ) {
        return res.status(400).json({ message: error.message });
      }

      throw error; // Ném lỗi để xử lý ở catch bên ngoài
    }
  } catch (error: any) {
    console.error("Error in updateTransaction controller:", error);
    res.status(500).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};

/**
 * Xóa giao dịch
 */
export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { transactionId } = req.params;

    // Validation cơ bản
    if (!transactionId || !mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({ message: "Invalid transaction ID format" });
    }

    try {
      // Lấy thông tin giao dịch trước khi xóa
      const transaction = await transactionService.getTransactionById(
        userId,
        transactionId
      );

      // Tính toán sự thay đổi số dư
      const amountChange =
        transaction.type === "income"
          ? -transaction.amount
          : transaction.amount;

      // Cập nhật số dư người dùng
      await transactionService.updateUserBalance(userId, amountChange);

      // Xóa giao dịch
      const result = await transactionService.deleteTransaction(
        userId,
        transactionId
      );

      res.status(200).json({
        success: true,
        message: "Transaction deleted successfully",
      });
    } catch (error: any) {
      // Xử lý các lỗi cụ thể từ service
      if (error.message === "Transaction not found") {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      } else if (
        error.message === "Invalid transaction ID" ||
        error.message === "Invalid user ID" ||
        error.message === "Category not found for this transaction"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      } else if (error.message === "Failed to delete transaction") {
        return res.status(500).json({
          success: false,
          message: "Failed to delete transaction. Please try again.",
        });
      }

      throw error; // Ném lỗi để xử lý ở catch bên ngoài
    }
  } catch (error: any) {
    console.error("Error in deleteTransaction controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Lấy giao dịch theo khoảng thời gian
 */
export const getTransactionsByDateRange = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    const transactions = await transactionService.getTransactionsByDateRange(
      userId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.status(200).json(transactions);
  } catch (error: any) {
    console.error("Error in getTransactionsByDateRange controller:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
