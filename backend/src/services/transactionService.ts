import Transaction, { ITransaction } from "../models/Transaction";
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
 * Tạo giao dịch mới với cơ chế thử lại khi gặp lỗi WriteConflict
 */
export const createTransaction = async (
  userId: string,
  transactionData: Partial<ITransaction>
) => {
  const MAX_RETRIES = 3;
  let retryCount = 0;
  let lastError: any = null;
  let newTransaction = null;

  // Bước 1: Tạo transaction trước
  while (retryCount < MAX_RETRIES) {
    try {
      // Không sử dụng session ở đây để giảm thiểu xung đột
      const newTransactionDoc = new Transaction({
        ...transactionData,
        userId,
      });

      newTransaction = await newTransactionDoc.save();
      console.log("Transaction created successfully:", newTransaction._id);
      break; // Thoát khỏi vòng lặp nếu thành công
    } catch (error: any) {
      lastError = error;
      retryCount++;
      console.log(
        `Error creating transaction, retry attempt ${retryCount}/${MAX_RETRIES}`
      );

      if (retryCount >= MAX_RETRIES) {
        console.error("Failed to create transaction after max retries");
        throw error;
      }

      // Đợi thời gian ngẫu nhiên trước khi thử lại
      const delay = Math.floor(Math.random() * 500) + 200; // 200-700ms
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  if (!newTransaction) {
    throw new Error("Failed to create transaction");
  }

  // Bước 2: Thêm transaction vào danh mục
  retryCount = 0;
  if (transactionData.category) {
    const categoryId = transactionData.category.toString();
    while (retryCount < MAX_RETRIES) {
      try {
        // Sử dụng $atomic operators thay vì transactions
        await mongoose.model("Category").findByIdAndUpdate(
          categoryId,
          {
            $inc: { transactionCount: 1 },
            $push: { transactions: newTransaction._id },
          },
          { new: true }
        );
        console.log("Category updated successfully");
        break; // Thoát khỏi vòng lặp nếu thành công
      } catch (error: any) {
        retryCount++;
        console.log(
          `Error updating category, retry attempt ${retryCount}/${MAX_RETRIES}`
        );

        if (retryCount >= MAX_RETRIES) {
          console.error("Failed to update category after max retries");
          // Không throw lỗi, chỉ log lỗi để không làm gián đoạn luồng
          console.error("Error details:", error);
        }

        // Đợi trước khi thử lại
        const delay = Math.floor(Math.random() * 500) + 200;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return newTransaction;
};

/**
 * Cập nhật giao dịch
 */
export const updateTransaction = async (
  userId: string,
  transactionId: string,
  updateData: Partial<ITransaction>
) => {
  const MAX_RETRIES = 3;

  if (!transactionId || !mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new Error("Invalid transaction ID");
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    throw new Error("No update data provided");
  }

  // Kiểm tra số tiền nếu được cung cấp
  if (
    updateData.amount !== undefined &&
    (updateData.amount <= 0 || isNaN(updateData.amount))
  ) {
    throw new Error("Amount must be a positive number");
  }

  // Kiểm tra loại giao dịch nếu được cung cấp
  if (updateData.type && !["income", "expense"].includes(updateData.type)) {
    throw new Error("Transaction type must be either 'income' or 'expense'");
  }

  // Bước 1: Lấy thông tin transaction hiện tại
  const transaction = await Transaction.findOne({
    _id: transactionId,
    userId,
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // Lưu thông tin danh mục cũ nếu danh mục sẽ bị thay đổi
  let categoryChanged = false;
  let oldCategoryId = null;
  let newCategoryId = null;

  // Xử lý category nếu có
  if (updateData.category) {
    // Lấy ID của category cũ
    const oldCategoryIdStr = transaction.category.toString();

    // Xử lý giá trị category mới
    let newCategoryIdStr: string;
    const category = updateData.category;

    console.log(
      "👉 Processing category in updateTransaction:",
      JSON.stringify(category)
    );

    try {
      // Nếu category là object
      if (typeof category === "object" && category !== null) {
        if (category._id) {
          newCategoryIdStr = category._id.toString();
          console.log(`🧩 Category from object, ID: ${newCategoryIdStr}`);
        } else {
          console.log(
            "⚠️ Category object without _id:",
            JSON.stringify(category)
          );
          throw new Error("Invalid category object: missing _id");
        }
      }
      // Nếu category là string
      else if (typeof category === "string") {
        const categoryString: string = category; // Ép kiểu rõ ràng
        // Kiểm tra xem có phải là JSON string không
        if (categoryString.startsWith("{") && categoryString.endsWith("}")) {
          try {
            const catObj = JSON.parse(categoryString);
            if (catObj && catObj._id) {
              newCategoryIdStr = catObj._id.toString();
              console.log(
                `🧩 Category from JSON string, ID: ${newCategoryIdStr}`
              );
            } else {
              newCategoryIdStr = categoryString;
              console.log(
                `🧩 Using category string as is (JSON without _id): ${newCategoryIdStr}`
              );
            }
          } catch (e) {
            // Nếu không parse được, giữ nguyên giá trị
            newCategoryIdStr = categoryString;
            console.log(
              `🧩 Using category string as is (invalid JSON): ${newCategoryIdStr}`
            );
          }
        } else {
          newCategoryIdStr = categoryString;
          console.log(`🧩 Using category string as is: ${newCategoryIdStr}`);
        }
      }
      // Các trường hợp khác
      else {
        newCategoryIdStr = String(category);
        console.log(`🧩 Category converted to string: ${newCategoryIdStr}`);
      }

      // So sánh ID của category cũ và mới
      if (oldCategoryIdStr !== newCategoryIdStr) {
        categoryChanged = true;
        oldCategoryId = oldCategoryIdStr;
        newCategoryId = newCategoryIdStr;

        // Kiểm tra xem category ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(newCategoryId)) {
          console.error(`❌ Invalid category ID format: ${newCategoryId}`);
          throw new Error(`Invalid category ID: ${newCategoryId}`);
        }

        // Kiểm tra xem category mới có tồn tại không
        const categoryExists = await mongoose
          .model("Category")
          .findById(newCategoryId);

        if (!categoryExists) {
          console.error(`❌ Category not found with ID: ${newCategoryId}`);
          throw new Error(`New category not found with ID: ${newCategoryId}`);
        }

        console.log(`✅ Category validated: ${newCategoryId}`);

        // Cập nhật category trong updateData bằng ObjectId
        updateData.category = new mongoose.Types.ObjectId(newCategoryId);
      } else {
        console.log(`🔍 Category unchanged: ${oldCategoryIdStr}`);
      }
    } catch (error) {
      console.error(`❌ Error processing category:`, error);
      throw error;
    }
  }

  // Bước 2: Cập nhật transaction
  let retryCount = 0;
  let updatedTransaction = null;

  while (retryCount < MAX_RETRIES) {
    try {
      updatedTransaction = await Transaction.findByIdAndUpdate(
        transactionId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate({
        path: "category",
        select: "name icon color type",
      });

      if (!updatedTransaction) {
        throw new Error("Failed to update transaction");
      }

      console.log("Transaction updated successfully");
      break;
    } catch (error) {
      retryCount++;
      console.log(
        `Error updating transaction, retry attempt ${retryCount}/${MAX_RETRIES}`
      );

      if (retryCount >= MAX_RETRIES) {
        console.error("Failed to update transaction after max retries");
        throw error;
      }

      // Đợi trước khi thử lại
      const delay = Math.floor(Math.random() * 300) + 100; // 100-400ms
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Nếu sau tất cả các lần retry vẫn không cập nhật được
  if (!updatedTransaction) {
    throw new Error("Failed to update transaction after max retries");
  }

  // Bước 3: Cập nhật danh mục nếu có thay đổi
  if (categoryChanged && oldCategoryId && newCategoryId) {
    retryCount = 0;

    // Cập nhật danh mục cũ (giảm transaction count và xóa transaction khỏi mảng)
    while (retryCount < MAX_RETRIES) {
      try {
        await mongoose.model("Category").findByIdAndUpdate(
          oldCategoryId,
          {
            $inc: { transactionCount: -1 },
            $pull: { transactions: transactionId },
          },
          { new: true }
        );
        console.log("Old category updated successfully");
        break;
      } catch (error) {
        retryCount++;
        console.log(
          `Error updating old category, retry attempt ${retryCount}/${MAX_RETRIES}`
        );

        if (retryCount >= MAX_RETRIES) {
          console.error("Failed to update old category after max retries");
          // Chỉ log lỗi, không throw để không làm gián đoạn luồng
          break;
        }

        const delay = Math.floor(Math.random() * 300) + 100;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Cập nhật danh mục mới (tăng transaction count và thêm transaction vào mảng)
    retryCount = 0;
    while (retryCount < MAX_RETRIES) {
      try {
        await mongoose.model("Category").findByIdAndUpdate(
          newCategoryId,
          {
            $inc: { transactionCount: 1 },
            $push: { transactions: transactionId },
          },
          { new: true }
        );
        console.log("New category updated successfully");
        break;
      } catch (error) {
        retryCount++;
        console.log(
          `Error updating new category, retry attempt ${retryCount}/${MAX_RETRIES}`
        );

        if (retryCount >= MAX_RETRIES) {
          console.error("Failed to update new category after max retries");
          // Chỉ log lỗi, không throw
          break;
        }

        const delay = Math.floor(Math.random() * 300) + 100;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return updatedTransaction;
};

/**
 * Xóa giao dịch
 */
export const deleteTransaction = async (
  userId: string,
  transactionId: string
) => {
  const MAX_RETRIES = 3;

  if (!transactionId || !mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new Error("Invalid transaction ID");
  }

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  // Bước 1: Lấy thông tin giao dịch trước khi xóa
  const transaction = await Transaction.findOne({
    _id: transactionId,
    userId,
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // Lưu categoryId trước khi xóa transaction
  const categoryId = transaction.category.toString();

  // Kiểm tra xem category có tồn tại không
  const categoryExists = await mongoose.model("Category").findById(categoryId);
  if (!categoryExists) {
    throw new Error("Category not found for this transaction");
  }

  // Bước 2: Xóa giao dịch
  let retryCount = 0;
  let isDeleted = false;

  while (retryCount < MAX_RETRIES && !isDeleted) {
    try {
      const deleteResult = await Transaction.deleteOne({ _id: transactionId });

      if (deleteResult.deletedCount === 0) {
        retryCount++;
        console.log(
          `Transaction not deleted, retry attempt ${retryCount}/${MAX_RETRIES}`
        );

        if (retryCount >= MAX_RETRIES) {
          throw new Error("Failed to delete transaction");
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
        continue;
      }

      console.log("Transaction deleted successfully");
      isDeleted = true;
    } catch (error) {
      retryCount++;
      console.log(
        `Error deleting transaction, retry attempt ${retryCount}/${MAX_RETRIES}`
      );

      if (retryCount >= MAX_RETRIES) {
        console.error("Failed to delete transaction after max retries");
        throw error;
      }

      // Đợi trước khi thử lại
      const delay = Math.floor(Math.random() * 300) + 100; // 100-400ms
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Bước 3: Cập nhật danh mục (giảm transaction count và xóa referecnce)
  retryCount = 0;
  let categoryUpdated = false;

  while (retryCount < MAX_RETRIES && !categoryUpdated) {
    try {
      await mongoose.model("Category").findByIdAndUpdate(categoryId, {
        $inc: { transactionCount: -1 },
        $pull: { transactions: transactionId },
      });

      console.log("Category updated successfully");
      categoryUpdated = true;
    } catch (error) {
      retryCount++;
      console.log(
        `Error updating category, retry attempt ${retryCount}/${MAX_RETRIES}`
      );

      if (retryCount >= MAX_RETRIES) {
        console.error("Failed to update category after max retries");
        // Log lỗi nhưng không throw để không làm gián đoạn luồng
        break;
      }

      const delay = Math.floor(Math.random() * 300) + 100;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { success: true, message: "Transaction deleted successfully" };
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

/**
 * Cập nhật số dư của người dùng sau khi thêm/xóa/cập nhật giao dịch
 * @param userId ID của người dùng
 * @param amountChange Số tiền thay đổi (dương cho thu nhập, âm cho chi tiêu)
 */
export const updateUserBalance = async (
  userId: string,
  amountChange: number
) => {
  try {
    const User = mongoose.model("User");
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Cập nhật số dư
    user.totalBalance = (user.totalBalance || 0) + amountChange;

    // Khởi tạo stats nếu chưa có
    if (!user.stats) {
      user.stats = {
        totalIncome: 0,
        totalExpense: 0,
        avgMonthlyIncome: 0,
        avgMonthlyExpense: 0,
        lastUpdated: new Date(),
      };
    }

    // Cập nhật thống kê
    if (amountChange > 0) {
      user.stats.totalIncome = (user.stats.totalIncome || 0) + amountChange;
    } else if (amountChange < 0) {
      user.stats.totalExpense = (user.stats.totalExpense || 0) - amountChange;
    }

    user.stats.lastUpdated = new Date();

    await user.save();
    return user;
  } catch (error) {
    console.error("Error updating user balance:", error);
    throw error;
  }
};

/**
 * Cập nhật thống kê của danh mục
 * @param categoryId ID của danh mục
 * @param userId ID của người dùng
 * @param amount Số tiền của giao dịch
 */
export const updateCategoryStats = async (
  categoryId: any,
  userId: string,
  amount: number
) => {
  try {
    // Đảm bảo categoryId là string MongoDB ObjectId hợp lệ
    let categoryIdStr = "";

    // Xử lý các kiểu dữ liệu đầu vào khác nhau
    if (categoryId instanceof mongoose.Types.ObjectId) {
      // Nếu là MongoDB ObjectId
      categoryIdStr = categoryId.toString();
    } else if (typeof categoryId === "object" && categoryId !== null) {
      // Nếu là object thông thường có _id
      if (categoryId._id) {
        categoryIdStr = categoryId._id.toString();
      } else {
        throw new Error(
          `Invalid category object without ID: ${JSON.stringify(categoryId)}`
        );
      }
    } else if (typeof categoryId === "string") {
      // Nếu đã là string
      categoryIdStr = categoryId;
    } else {
      // Các kiểu dữ liệu khác
      throw new Error(`Unsupported category ID type: ${typeof categoryId}`);
    }

    // Kiểm tra tính hợp lệ của ID
    if (!mongoose.Types.ObjectId.isValid(categoryIdStr)) {
      throw new Error(`Invalid category ID format: ${categoryIdStr}`);
    }

    // Tìm category trong database
    const Category = mongoose.model("Category");
    const category = await Category.findById(categoryIdStr);

    if (!category) {
      throw new Error(`Category not found with ID: ${categoryIdStr}`);
    }

    // Khởi tạo thống kê nếu chưa có
    if (!category.stats) {
      category.stats = {
        totalAmount: 0,
        transactionCount: 0,
        averageAmount: 0,
      };
    }

    // Cập nhật thống kê danh mục
    category.stats.totalAmount = (category.stats.totalAmount || 0) + amount;
    category.stats.transactionCount =
      (category.stats.transactionCount || 0) + 1;

    if (category.stats.transactionCount > 0) {
      category.stats.averageAmount =
        category.stats.totalAmount / category.stats.transactionCount;
    }

    // Lưu thay đổi vào database
    await category.save();
    console.log(
      `📊 Category stats updated for ${categoryIdStr} with amount ${amount}`
    );

    return category;
  } catch (error) {
    console.error(`❌ Error updating category stats: ${error}`);
    throw error;
  }
};
