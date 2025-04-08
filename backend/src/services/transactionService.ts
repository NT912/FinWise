import Transaction, { ITransaction } from "../models/Transaction";
import {
  incrementTransactionCount,
  decrementTransactionCount,
} from "../controllers/categoryController";
import mongoose from "mongoose";

/**
 * Lấy tất cả giao dịch của một người dùng
 */
export const getAllTransactions = async (userId: string) => {
  try {
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .populate({
        path: "category",
        select: "name icon color type",
      });
    return transactions;
  } catch (error) {
    console.error("Error in getAllTransactions service:", error);
    throw error;
  }
};

/**
 * Lấy giao dịch theo danh mục
 */
export const getTransactionsByCategory = async (
  userId: string,
  categoryId: string
) => {
  try {
    const transactions = await Transaction.find({
      userId,
      category: categoryId,
    })
      .sort({ date: -1 })
      .populate({
        path: "category",
        select: "name icon color type",
      });
    return transactions;
  } catch (error) {
    console.error("Error in getTransactionsByCategory service:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết một giao dịch
 */
export const getTransactionById = async (
  userId: string,
  transactionId: string
) => {
  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
    }).populate({
      path: "category",
      select: "name icon color type",
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return transaction;
  } catch (error) {
    console.error("Error in getTransactionById service:", error);
    throw error;
  }
};

/**
 * Tạo giao dịch mới
 */
export const createTransaction = async (
  userId: string,
  transactionData: Partial<ITransaction>
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newTransaction = new Transaction({
      ...transactionData,
      userId,
    });

    await newTransaction.save({ session });

    // Tăng số lượng giao dịch trong danh mục và thêm transaction vào mảng transactions
    if (transactionData.category) {
      const categoryId = transactionData.category.toString();
      await incrementTransactionCount(categoryId);

      // Thêm transaction vào mảng transactions của category
      await mongoose
        .model("Category")
        .findByIdAndUpdate(
          categoryId,
          { $push: { transactions: newTransaction._id } },
          { session }
        );
    }

    await session.commitTransaction();
    return newTransaction;
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in createTransaction service:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Cập nhật giao dịch
 */
export const updateTransaction = async (
  userId: string,
  transactionId: string,
  updateData: Partial<ITransaction>
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Nếu danh mục thay đổi, cập nhật số lượng giao dịch trong danh mục cũ và mới
    const oldCategoryId = transaction.category.toString();
    const newCategoryId = updateData.category?.toString();

    if (newCategoryId && oldCategoryId !== newCategoryId) {
      await decrementTransactionCount(oldCategoryId);
      await incrementTransactionCount(newCategoryId);
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { $set: updateData },
      { new: true, runValidators: true, session }
    ).populate({
      path: "category",
      select: "name icon color type",
    });

    await session.commitTransaction();
    return updatedTransaction;
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in updateTransaction service:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Xóa giao dịch
 */
export const deleteTransaction = async (
  userId: string,
  transactionId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Lưu categoryId trước khi xóa transaction
    const categoryId = transaction.category.toString();

    // Xóa transaction
    await Transaction.deleteOne({ _id: transactionId }, { session });

    // Giảm số lượng giao dịch trong danh mục và xóa transaction khỏi mảng transactions
    await decrementTransactionCount(categoryId);

    // Xóa transaction khỏi mảng transactions của category
    await mongoose
      .model("Category")
      .findByIdAndUpdate(
        categoryId,
        { $pull: { transactions: transactionId } },
        { session }
      );

    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in deleteTransaction service:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Lấy giao dịch theo khoảng thời gian
 */
export const getTransactionsByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: -1 })
      .populate({
        path: "category",
        select: "name icon color type",
      });
    return transactions;
  } catch (error) {
    console.error("Error in getTransactionsByDateRange service:", error);
    throw error;
  }
};
