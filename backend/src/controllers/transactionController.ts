import { Request, Response } from "express";
import * as transactionService from "../services/transactionService";

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
      return res.status(401).json({ message: "Unauthorized" });
    }

    const transactionData = req.body;
    const newTransaction = await transactionService.createTransaction(
      userId,
      transactionData
    );
    res.status(201).json({
      message: "Transaction created successfully",
      transaction: newTransaction,
    });
  } catch (error: any) {
    console.error("Error in createTransaction controller:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
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
    const updatedTransaction = await transactionService.updateTransaction(
      userId,
      transactionId,
      updateData
    );
    res.status(200).json({
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
    });
  } catch (error: any) {
    console.error("Error in updateTransaction controller:", error);
    if (error.message === "Transaction not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || "Internal server error" });
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
    await transactionService.deleteTransaction(userId, transactionId);
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error: any) {
    console.error("Error in deleteTransaction controller:", error);
    if (error.message === "Transaction not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || "Internal server error" });
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
