import { Request, Response } from "express";
import mongoose from "mongoose";
import Savings from "../models/Savings";
import { handleApiError } from "../utils/errorHandler";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import Transaction from "../models/Transaction";

// Hàm utility để lấy năm và tháng hiện tại
const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // getMonth() trả về 0-11, nên +1 để được 1-12
  };
};

// Lấy tổng ngân sách (mặc định là tháng hiện tại)
export const getTotalBudget = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Lấy tham số từ query
    const { year, month } = req.query.date
      ? {
          year: parseInt(req.query.date.toString().split("-")[0]),
          month: parseInt(req.query.date.toString().split("-")[1]),
        }
      : getCurrentYearMonth();

    console.log(`Getting budget for: Year=${year}, Month=${month}`);

    // Tìm document savings của user
    let savings = await Savings.findOne({ userId });

    // Nếu không tìm thấy, tạo mới
    if (!savings) {
      const { year: currentYear, month: currentMonth } = getCurrentYearMonth();

      savings = await Savings.create({
        userId,
        totalBudget: 20000000, // Default 20M VND
        monthlyBudgets: [
          {
            year: currentYear,
            month: currentMonth,
            amount: 20000000, // Default 20M VND cho tháng hiện tại
          },
        ],
      });

      return res.json({
        totalBudget: 20000000,
        year: currentYear,
        month: currentMonth,
      });
    }

    // Tìm ngân sách của tháng cụ thể
    const monthlyBudget = savings.monthlyBudgets?.find(
      (budget) => budget.year === year && budget.month === month
    );

    // Nếu không có ngân sách cho tháng được yêu cầu, sử dụng ngân sách tổng
    if (!monthlyBudget) {
      // Thêm ngân sách cho tháng này (sử dụng giá trị mặc định từ totalBudget)
      if (savings.monthlyBudgets) {
        savings.monthlyBudgets.push({
          year,
          month,
          amount: savings.totalBudget,
        });
      } else {
        savings.monthlyBudgets = [
          {
            year,
            month,
            amount: savings.totalBudget,
          },
        ];
      }
      await savings.save();

      return res.json({
        totalBudget: savings.totalBudget,
        year,
        month,
      });
    }

    // Trả về ngân sách tháng
    return res.json({
      totalBudget: monthlyBudget.amount,
      year,
      month,
    });
  } catch (error) {
    console.error("Error getting total budget:", error);
    handleApiError(error, res);
  }
};

// Cập nhật tổng ngân sách
export const updateTotalBudget = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { totalBudget } = req.body;

    // Lấy tham số từ body hoặc sử dụng giá trị mặc định là tháng hiện tại
    const { year, month } = req.body.date
      ? {
          year: parseInt(req.body.date.toString().split("-")[0]),
          month: parseInt(req.body.date.toString().split("-")[1]),
        }
      : getCurrentYearMonth();

    if (typeof totalBudget !== "number" || totalBudget < 0) {
      return res.status(400).json({ message: "Invalid budget amount" });
    }

    let savings = await Savings.findOne({ userId });

    if (!savings) {
      // Nếu không tìm thấy, tạo mới
      savings = await Savings.create({
        userId,
        totalBudget,
        monthlyBudgets: [
          {
            year,
            month,
            amount: totalBudget,
          },
        ],
      });
    } else {
      // Cập nhật ngân sách tổng
      savings.totalBudget = totalBudget;

      // Tìm và cập nhật ngân sách cho tháng cụ thể
      const monthlyBudgetIndex = savings.monthlyBudgets?.findIndex(
        (budget) => budget.year === year && budget.month === month
      );

      if (monthlyBudgetIndex >= 0 && savings.monthlyBudgets) {
        // Cập nhật ngân sách tháng đã tồn tại
        savings.monthlyBudgets[monthlyBudgetIndex].amount = totalBudget;
      } else {
        // Thêm mới ngân sách cho tháng này
        if (savings.monthlyBudgets) {
          savings.monthlyBudgets.push({
            year,
            month,
            amount: totalBudget,
          });
        } else {
          savings.monthlyBudgets = [
            {
              year,
              month,
              amount: totalBudget,
            },
          ];
        }
      }

      await savings.save();
    }

    res.json({
      totalBudget,
      year,
      month,
      message: `Budget updated for ${month}/${year}`,
    });
  } catch (error) {
    console.error("Error updating total budget:", error);
    handleApiError(error, res);
  }
};

// Get savings summary
export const getSavingsSummary = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    let savings = await Savings.findOne({ userId });

    if (!savings) {
      const { year, month } = getCurrentYearMonth();

      savings = await Savings.create({
        userId,
        totalBudget: 20000000,
        monthlyBudgets: [
          {
            year,
            month,
            amount: 20000000,
          },
        ],
        savingGoals: [],
      });
    }

    // Tính tổng số tiền đã tiết kiệm từ tất cả các mục tiêu
    const totalSavings =
      savings.savingGoals?.reduce(
        (sum, goal) => sum + (goal.currentAmount || 0),
        0
      ) || 0;

    // Tìm mục tiêu của tháng hiện tại
    const { year: currentYear, month: currentMonth } = getCurrentYearMonth();

    const currentGoal = savings.savingGoals?.find((goal) => {
      const goalDate = new Date(goal.createdAt);
      const goalMonth = goalDate.getMonth() + 1;
      const goalYear = goalDate.getFullYear();
      return goalMonth === currentMonth && goalYear === currentYear;
    });

    // Lấy số tiền mục tiêu cho tháng hiện tại (nếu có)
    const targetAmount = currentGoal?.targetAmount || 0;

    // Tính phần trăm tiến độ
    const progress =
      targetAmount > 0 ? Math.min((totalSavings / targetAmount) * 100, 100) : 0;

    // Định dạng dữ liệu tháng cho biểu đồ
    const monthlyData = {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      data: Array(12).fill(0),
    };

    // Cập nhật dữ liệu biểu đồ nếu có mục tiêu
    if (savings.savingGoals && savings.savingGoals.length > 0) {
      savings.savingGoals.forEach((goal) => {
        const date = new Date(goal.createdAt);
        const month = date.getMonth();
        monthlyData.data[month] += goal.currentAmount || 0;
      });
    }

    // Chuyển đổi savingGoals để đảm bảo có _id
    const processedGoals = (savings.savingGoals || []).map((goal) => {
      // Nếu goal không có _id, tạo một _id mới
      if (!goal._id) {
        // Chuyển đổi goal thành plain object để thêm _id
        const plainGoal = {
          goalName: goal.goalName,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          createdAt: goal.createdAt,
          _id: new mongoose.Types.ObjectId(),
        };
        return plainGoal;
      }
      return goal;
    });

    // Trả về dữ liệu đã được định dạng đúng
    res.json({
      totalSavings,
      targetAmount,
      progress,
      savingGoals: processedGoals,
      monthlyData: monthlyData,
      monthlyBudgets: savings.monthlyBudgets,
    });
  } catch (error) {
    console.error("Error getting savings summary:", error);
    handleApiError(error, res);
  }
};

// Create a new saving goal
export const createSavingGoal = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { goalName, targetAmount, currentAmount = 0, month, year } = req.body;

    // Validate input
    if (!goalName || typeof targetAmount !== "number" || targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid saving goal data. Required: goalName, targetAmount",
      });
    }

    // Find the user's savings document
    let savings = await Savings.findOne({ userId });

    // If no document exists, create one
    if (!savings) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      savings = await Savings.create({
        userId,
        totalBudget: 20000000, // Default budget
        monthlyBudgets: [
          {
            year: currentYear,
            month: currentMonth,
            amount: 20000000,
          },
        ],
        savingGoals: [],
      });
    }

    // Create the new saving goal với _id rõ ràng
    const newGoal = {
      _id: new mongoose.Types.ObjectId(), // Tạo _id mới rõ ràng
      goalName,
      targetAmount,
      currentAmount,
      createdAt: new Date(),
    };

    // Add the goal to the savingGoals array
    if (Array.isArray(savings.savingGoals)) {
      savings.savingGoals.push(newGoal);
    } else {
      savings.savingGoals = [newGoal];
    }

    // Save the updated document
    await savings.save();

    // Return success response
    res.status(201).json({
      success: true,
      data: newGoal,
      message: "Saving goal created successfully",
    });
  } catch (error) {
    console.error("Error creating saving goal:", error);
    handleApiError(error, res);
  }
};

// Update saving goal
export const updateSavingGoal = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { goalId } = req.params;
    const { currentAmount, targetAmount } = req.body;

    console.log(
      `Updating saving goal ${goalId} with: currentAmount=${currentAmount}, targetAmount=${targetAmount}`
    );

    // Validate input
    if (currentAmount === undefined && targetAmount === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "No valid fields to update. Provide currentAmount or targetAmount.",
      });
    }

    // Find the user's savings document
    const savings = await Savings.findOne({ userId });

    if (!savings || !savings.savingGoals || savings.savingGoals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No saving goals found for this user",
      });
    }

    // Tìm mục tiêu cụ thể để cập nhật
    // Chuyển đổi các savingGoals thành dạng chuẩn hơn với _id
    const goalIndex = savings.savingGoals.findIndex((goal: any) => {
      // Kiểm tra một cách an toàn xem goal có _id không và khớp với goalId không
      return goal && goal._id && goal._id.toString() === goalId;
    });

    if (goalIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Saving goal not found",
      });
    }

    // Update the goal
    if (currentAmount !== undefined) {
      savings.savingGoals[goalIndex].currentAmount = currentAmount;
    }

    if (targetAmount !== undefined) {
      savings.savingGoals[goalIndex].targetAmount = targetAmount;
    }

    // Save the changes
    await savings.save();

    // Return the updated goal
    res.status(200).json({
      success: true,
      data: savings.savingGoals[goalIndex],
      message: "Saving goal updated successfully",
    });
  } catch (error) {
    console.error("Error updating saving goal:", error);
    handleApiError(error, res);
  }
};

// Set saving amount
export const setSavingAmount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { amount } = req.body;

    // Validate input
    if (typeof amount !== "number" || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount. Please provide a non-negative number.",
      });
    }

    // Find the user's savings document
    let savings = await Savings.findOne({ userId });

    // If no document exists, create one
    if (!savings) {
      const { year, month } = getCurrentYearMonth();

      savings = await Savings.create({
        userId,
        totalBudget: 20000000, // Default budget
        monthlyBudgets: [
          {
            year,
            month,
            amount: 20000000,
          },
        ],
        savingAmount: amount,
        targetSavingAmount: 0, // Default target
      });
    } else {
      // Update existing document
      savings.savingAmount = amount;
      await savings.save();
    }

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        savingAmount: savings.savingAmount,
        targetSavingAmount: savings.targetSavingAmount,
      },
      message: "Saving amount updated successfully",
    });
  } catch (error) {
    console.error("Error setting saving amount:", error);
    handleApiError(error, res);
  }
};

// Set target saving amount
export const setTargetSavingAmount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { amount } = req.body;

    // Validate input
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid target amount. Please provide a positive number.",
      });
    }

    // Find the user's savings document
    let savings = await Savings.findOne({ userId });

    // If no document exists, create one
    if (!savings) {
      const { year, month } = getCurrentYearMonth();

      savings = await Savings.create({
        userId,
        totalBudget: 20000000, // Default budget
        monthlyBudgets: [
          {
            year,
            month,
            amount: 20000000,
          },
        ],
        savingAmount: 0, // Default current amount
        targetSavingAmount: amount,
      });
    } else {
      // Update existing document
      savings.targetSavingAmount = amount;
      await savings.save();
    }

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        savingAmount: savings.savingAmount,
        targetSavingAmount: savings.targetSavingAmount,
      },
      message: "Target saving amount updated successfully",
    });
  } catch (error) {
    console.error("Error setting target saving amount:", error);
    handleApiError(error, res);
  }
};

// Get simple savings info
export const getSimpleSavingsInfo = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Find the user's savings document
    let savings = await Savings.findOne({ userId });

    // If no document exists, create one
    if (!savings) {
      const { year, month } = getCurrentYearMonth();

      savings = await Savings.create({
        userId,
        totalBudget: 20000000, // Default budget
        monthlyBudgets: [
          {
            year,
            month,
            amount: 20000000,
          },
        ],
        savingAmount: 0,
        targetSavingAmount: 0,
      });
    }

    // Tạo dữ liệu biểu đồ hàng tháng
    const monthlyData = {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      data: Array(12).fill(0),
    };

    // Tính toán dữ liệu cho tất cả các tháng trong năm hiện tại
    const currentYear = new Date().getFullYear();

    for (let month = 0; month < 12; month++) {
      const firstDayOfMonth = new Date(currentYear, month, 1);
      const lastDayOfMonth = new Date(currentYear, month + 1, 0);

      // Lấy tất cả giao dịch trong tháng
      const transactions = await Transaction.find({
        userId,
        date: {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth,
        },
      });

      // Tính tổng thu nhập và chi tiêu cho tháng này
      let monthIncome = 0;
      let monthExpense = 0;

      transactions.forEach((transaction) => {
        if (transaction.type === "income") {
          monthIncome += transaction.amount;
        } else if (transaction.type === "expense") {
          monthExpense += transaction.amount;
        }
      });

      // Tính số tiền tiết kiệm = thu nhập - chi tiêu
      monthlyData.data[month] = monthIncome - monthExpense;
    }

    // Return the savings info with monthly data
    res.status(200).json({
      success: true,
      data: {
        savingAmount: savings.savingAmount,
        targetSavingAmount: savings.targetSavingAmount,
        progress:
          savings.targetSavingAmount > 0
            ? Math.min(
                (savings.savingAmount / savings.targetSavingAmount) * 100,
                100
              )
            : 0,
        monthlyData: monthlyData,
      },
    });
  } catch (error) {
    console.error("Error getting simple savings info:", error);
    handleApiError(error, res);
  }
};

// Thêm hàm mới
/**
 * Cập nhật số tiền tiết kiệm từ giao dịch
 * @param req Request
 * @param res Response
 */
export const updateSavingAmountFromTransactions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Lấy tham số từ query
    const { year, month } = req.query.date
      ? {
          year: parseInt(req.query.date.toString().split("-")[0]),
          month: parseInt(req.query.date.toString().split("-")[1]),
        }
      : getCurrentYearMonth();

    // Tìm document savings của user
    let savings = await Savings.findOne({ userId });

    if (!savings) {
      const { year: currentYear, month: currentMonth } = getCurrentYearMonth();

      savings = await Savings.create({
        userId,
        totalBudget: 20000000,
        monthlyBudgets: [
          {
            year: currentYear,
            month: currentMonth,
            amount: 20000000,
          },
        ],
        savingAmount: 0,
        targetSavingAmount: 0,
      });
    }

    // Tính tổng thu nhập và chi tiêu trong tháng hiện tại
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);

    // Format dates for logging
    console.log(
      `Calculating savings for: ${firstDayOfMonth.toISOString()} to ${lastDayOfMonth.toISOString()}`
    );

    // Lấy tất cả giao dịch trong tháng
    const transactions = await Transaction.find({
      userId,
      date: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      },
    });

    // Tính tổng thu nhập và chi tiêu
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else if (transaction.type === "expense") {
        totalExpense += transaction.amount;
      }
    });

    // Tính số tiền tiết kiệm = thu nhập - chi tiêu
    const savingAmount = totalIncome - totalExpense;

    // Cập nhật số tiền tiết kiệm (cho phép âm để phản ánh đúng tình trạng tài chính)
    savings.savingAmount = savingAmount;
    await savings.save();

    // Trả về kết quả
    res.status(200).json({
      success: true,
      data: {
        savingAmount: savings.savingAmount,
        targetSavingAmount: savings.targetSavingAmount,
        totalIncome,
        totalExpense,
        progress:
          savings.targetSavingAmount > 0
            ? Math.min(
                (savings.savingAmount / savings.targetSavingAmount) * 100,
                100
              )
            : 0,
      },
      message: "Saving amount updated from transactions",
    });
  } catch (error) {
    console.error("Error updating saving amount from transactions:", error);
    handleApiError(error, res);
  }
};
