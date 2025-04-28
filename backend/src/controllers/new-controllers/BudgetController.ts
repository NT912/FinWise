import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";

// Dữ liệu mẫu cho ngân sách
const sampleBudgets = [
  {
    id: "budget-001",
    name: "Monthly Food Budget",
    amount: 500000,
    currentAmount: 250000,
    startDate: new Date("2023-06-01"),
    endDate: new Date("2023-06-30"),
    categories: ["cat-001", "cat-004"], // Food & Drink, Groceries
    userId: "user-001",
    walletId: "wallet-001",
    isRecurring: true,
    recurringFrequency: "monthly",
    status: "in_progress",
    notificationThreshold: 80, // Phần trăm khi cần thông báo
    notes: "Budget for all food expenses",
    createdAt: new Date("2023-05-25"),
    updatedAt: new Date("2023-06-15"),
  },
  {
    id: "budget-002",
    name: "Entertainment Budget",
    amount: 200000,
    currentAmount: 150000,
    startDate: new Date("2023-06-01"),
    endDate: new Date("2023-06-30"),
    categories: ["cat-005"], // Entertainment
    userId: "user-001",
    walletId: "wallet-001",
    isRecurring: true,
    recurringFrequency: "monthly",
    status: "in_progress",
    notificationThreshold: 90,
    notes: "Movies, games, etc.",
    createdAt: new Date("2023-05-25"),
    updatedAt: new Date("2023-06-15"),
  },
  {
    id: "budget-003",
    name: "Transport Budget",
    amount: 300000,
    currentAmount: 200000,
    startDate: new Date("2023-06-01"),
    endDate: new Date("2023-06-30"),
    categories: ["cat-002"], // Transport
    userId: "user-001",
    walletId: "wallet-001",
    isRecurring: true,
    recurringFrequency: "monthly",
    status: "in_progress",
    notificationThreshold: 80,
    notes: "Public transport and ride sharing",
    createdAt: new Date("2023-05-25"),
    updatedAt: new Date("2023-06-15"),
  },
  {
    id: "budget-004",
    name: "Shopping Trip",
    amount: 1000000,
    currentAmount: 500000,
    startDate: new Date("2023-06-10"),
    endDate: new Date("2023-06-15"),
    categories: ["cat-003"], // Shopping
    userId: "user-001",
    walletId: "wallet-001",
    isRecurring: false,
    status: "in_progress",
    notificationThreshold: 75,
    notes: "Budget for summer shopping trip",
    createdAt: new Date("2023-06-01"),
    updatedAt: new Date("2023-06-12"),
  },
];

/**
 * Lấy danh sách ngân sách
 * Money Lover tính năng:
 * - Lọc ngân sách theo trạng thái (đang diễn ra, đã hoàn thành, v.v.)
 * - Lọc theo loại (theo tháng, tùy chỉnh)
 * - Lọc theo thời gian
 */
export const getBudgets = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Lọc ngân sách
    const { status, isRecurring, walletId, startDate, endDate } = req.query;

    let filteredBudgets = [...sampleBudgets];

    // Lọc theo trạng thái
    if (status) {
      filteredBudgets = filteredBudgets.filter((b) => b.status === status);
    }

    // Lọc theo loại (định kỳ hoặc một lần)
    if (isRecurring !== undefined) {
      const recurring = isRecurring === "true";
      filteredBudgets = filteredBudgets.filter(
        (b) => b.isRecurring === recurring
      );
    }

    // Lọc theo ví
    if (walletId) {
      filteredBudgets = filteredBudgets.filter((b) => b.walletId === walletId);
    }

    // Lọc theo ngày bắt đầu
    if (startDate) {
      const start = new Date(startDate as string);
      filteredBudgets = filteredBudgets.filter((b) => b.startDate >= start);
    }

    // Lọc theo ngày kết thúc
    if (endDate) {
      const end = new Date(endDate as string);
      filteredBudgets = filteredBudgets.filter((b) => b.endDate <= end);
    }

    // Tính toán số liệu tổng hợp
    const totalBudgeted = filteredBudgets.reduce(
      (sum, budget) => sum + budget.amount,
      0
    );
    const totalSpent = filteredBudgets.reduce(
      (sum, budget) => sum + budget.currentAmount,
      0
    );
    const averageUsagePercentage = Math.round(
      (totalSpent / totalBudgeted) * 100
    );

    // Phân loại theo trạng thái
    const budgetsSummary = {
      totalBudgeted,
      totalSpent,
      averageUsagePercentage,
      totalBudgets: filteredBudgets.length,
      inProgressBudgets: filteredBudgets.filter(
        (b) => b.status === "in_progress"
      ).length,
      completedBudgets: filteredBudgets.filter((b) => b.status === "completed")
        .length,
      exceededBudgets: filteredBudgets.filter((b) => b.currentAmount > b.amount)
        .length,
    };

    res.json({
      budgets: filteredBudgets,
      summary: budgetsSummary,
    });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ message: "Error fetching budgets" });
  }
};

/**
 * Lấy chi tiết ngân sách
 */
export const getBudgetById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const budgetId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!budgetId) {
      res.status(400).json({ message: "Budget ID is required" });
      return;
    }

    // Tìm ngân sách trong dữ liệu mẫu
    const budget = sampleBudgets.find((b) => b.id === budgetId);

    if (!budget) {
      res.status(404).json({ message: "Budget not found" });
      return;
    }

    // Tính toán thêm chi tiết
    const usagePercentage = Math.round(
      (budget.currentAmount / budget.amount) * 100
    );
    const remainingAmount = budget.amount - budget.currentAmount;
    const isExceeded = budget.currentAmount > budget.amount;
    const daysLeft = Math.max(
      0,
      Math.ceil(
        (budget.endDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    // Tạo dữ liệu giao dịch mẫu cho ngân sách
    const sampleTransactions = [
      {
        id: "trans-001",
        amount: 50000,
        description: "Lunch",
        date: new Date("2023-06-05"),
        categoryId: "cat-001",
        walletId: "wallet-001",
      },
      {
        id: "trans-002",
        amount: 100000,
        description: "Groceries",
        date: new Date("2023-06-10"),
        categoryId: "cat-004",
        walletId: "wallet-001",
      },
      {
        id: "trans-003",
        amount: 80000,
        description: "Dinner",
        date: new Date("2023-06-12"),
        categoryId: "cat-001",
        walletId: "wallet-001",
      },
    ];

    // Trả về thông tin chi tiết kèm phân tích
    res.json({
      ...budget,
      transactions: sampleTransactions,
      analytics: {
        usagePercentage,
        remainingAmount,
        isExceeded,
        daysLeft,
        dailyBudget: daysLeft > 0 ? remainingAmount / daysLeft : 0,
        warningLevel:
          usagePercentage >= budget.notificationThreshold
            ? "warning"
            : "normal",
      },
    });
  } catch (error) {
    console.error("Error fetching budget:", error);
    res.status(500).json({ message: "Error fetching budget" });
  }
};

/**
 * Tạo ngân sách mới
 * Money Lover tính năng:
 * - Tạo ngân sách theo một hoặc nhiều danh mục
 * - Ngân sách có thể định kỳ (hàng tháng) hoặc một lần
 * - Thiết lập ngưỡng cảnh báo
 */
export const createBudget = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const {
      name,
      amount,
      startDate,
      endDate,
      categories,
      walletId,
      isRecurring,
      recurringFrequency,
      notificationThreshold,
      notes,
    } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (
      !name ||
      !amount ||
      !startDate ||
      !endDate ||
      !categories ||
      !walletId
    ) {
      res.status(400).json({
        message: "Missing required fields",
        requiredFields: [
          "name",
          "amount",
          "startDate",
          "endDate",
          "categories",
          "walletId",
        ],
      });
      return;
    }

    // Kiểm tra xác thực đầu vào
    if (amount <= 0) {
      res.status(400).json({
        message: "Budget amount must be greater than zero",
      });
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      res.status(400).json({
        message: "End date must be after start date",
      });
      return;
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(400).json({
        message: "At least one category must be selected",
      });
      return;
    }

    // Tạo ngân sách mới
    const newBudget = {
      id: `budget-${Date.now()}`,
      name,
      amount: Number(amount),
      currentAmount: 0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      categories,
      userId,
      walletId,
      isRecurring: Boolean(isRecurring),
      recurringFrequency: recurringFrequency || "monthly",
      status: "in_progress",
      notificationThreshold: notificationThreshold || 80,
      notes: notes || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.status(201).json({
      message: "Budget created successfully",
      budget: newBudget,
    });
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ message: "Error creating budget" });
  }
};

/**
 * Cập nhật ngân sách
 * Money Lover tính năng:
 * - Chỉnh sửa thông tin ngân sách
 * - Chỉnh sửa danh mục thuộc ngân sách
 */
export const updateBudget = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const budgetId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!budgetId) {
      res.status(400).json({ message: "Budget ID is required" });
      return;
    }

    // Tìm ngân sách cần cập nhật
    const budget = sampleBudgets.find((b) => b.id === budgetId);

    if (!budget) {
      res.status(404).json({ message: "Budget not found" });
      return;
    }

    const {
      name,
      amount,
      startDate,
      endDate,
      categories,
      walletId,
      isRecurring,
      recurringFrequency,
      notificationThreshold,
      notes,
    } = req.body;

    // Cập nhật ngân sách
    const updatedBudget = {
      ...budget,
      name: name || budget.name,
      amount: amount ? Number(amount) : budget.amount,
      startDate: startDate ? new Date(startDate) : budget.startDate,
      endDate: endDate ? new Date(endDate) : budget.endDate,
      categories: categories || budget.categories,
      walletId: walletId || budget.walletId,
      isRecurring:
        isRecurring !== undefined ? Boolean(isRecurring) : budget.isRecurring,
      recurringFrequency: recurringFrequency || budget.recurringFrequency,
      notificationThreshold:
        notificationThreshold || budget.notificationThreshold,
      notes: notes !== undefined ? notes : budget.notes,
      updatedAt: new Date(),
    };

    // Kiểm tra logic ngày tháng
    if (updatedBudget.startDate >= updatedBudget.endDate) {
      res.status(400).json({
        message: "End date must be after start date",
      });
      return;
    }

    res.json({
      message: "Budget updated successfully",
      budget: updatedBudget,
    });
  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({ message: "Error updating budget" });
  }
};

/**
 * Xóa ngân sách
 */
export const deleteBudget = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const budgetId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!budgetId) {
      res.status(400).json({ message: "Budget ID is required" });
      return;
    }

    // Tìm ngân sách cần xóa
    const budget = sampleBudgets.find((b) => b.id === budgetId);

    if (!budget) {
      res.status(404).json({ message: "Budget not found" });
      return;
    }

    // Xác nhận xóa tất cả ngân sách định kỳ trong tương lai?
    const { deleteAllRecurring } = req.query;

    if (budget.isRecurring && deleteAllRecurring === "true") {
      res.json({
        message: "Budget and all future recurring budgets deleted successfully",
        budgetId,
      });
      return;
    }

    res.json({
      message: "Budget deleted successfully",
      budgetId,
    });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ message: "Error deleting budget" });
  }
};

/**
 * Lấy báo cáo ngân sách
 * Money Lover tính năng:
 * - Tạo báo cáo tổng quan về tất cả ngân sách
 * - Phân tích chi tiết theo từng danh mục
 */
export const getBudgetReport = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { month, year, walletId } = req.query;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Kiểm tra tham số
    if (!month || !year) {
      res.status(400).json({
        message: "Month and year are required for report generation",
      });
      return;
    }

    const reportMonth = parseInt(month as string);
    const reportYear = parseInt(year as string);

    if (
      isNaN(reportMonth) ||
      reportMonth < 1 ||
      reportMonth > 12 ||
      isNaN(reportYear)
    ) {
      res.status(400).json({
        message: "Invalid month or year format",
      });
      return;
    }

    // Lọc ngân sách theo tháng/năm
    let relevantBudgets = [...sampleBudgets].filter((budget) => {
      const startMonth = budget.startDate.getMonth() + 1;
      const startYear = budget.startDate.getFullYear();
      const endMonth = budget.endDate.getMonth() + 1;
      const endYear = budget.endDate.getFullYear();

      // Kiểm tra xem ngân sách có nằm trong tháng báo cáo không
      return (
        (startYear < reportYear ||
          (startYear === reportYear && startMonth <= reportMonth)) &&
        (endYear > reportYear ||
          (endYear === reportYear && endMonth >= reportMonth))
      );
    });

    // Lọc theo ví nếu cần
    if (walletId) {
      relevantBudgets = relevantBudgets.filter((b) => b.walletId === walletId);
    }

    // Tính toán số liệu tổng hợp
    const totalBudgeted = relevantBudgets.reduce(
      (sum, budget) => sum + budget.amount,
      0
    );
    const totalSpent = relevantBudgets.reduce(
      (sum, budget) => sum + budget.currentAmount,
      0
    );
    const totalRemaining = totalBudgeted - totalSpent;
    const overallProgress = Math.round((totalSpent / totalBudgeted) * 100);

    // Phân tích theo từng danh mục
    const categoryAnalysis = [
      {
        categoryId: "cat-001",
        categoryName: "Food & Drink",
        budgeted: 300000,
        spent: 200000,
        remaining: 100000,
        progress: 67,
      },
      {
        categoryId: "cat-004",
        categoryName: "Groceries",
        budgeted: 200000,
        spent: 50000,
        remaining: 150000,
        progress: 25,
      },
      {
        categoryId: "cat-002",
        categoryName: "Transport",
        budgeted: 300000,
        spent: 200000,
        remaining: 100000,
        progress: 67,
      },
    ];

    // Xu hướng chi tiêu theo thời gian
    const dailySpending = [
      { date: "2023-06-01", amount: 0 },
      { date: "2023-06-02", amount: 0 },
      { date: "2023-06-03", amount: 0 },
      { date: "2023-06-04", amount: 0 },
      { date: "2023-06-05", amount: 50000 },
      { date: "2023-06-06", amount: 0 },
      { date: "2023-06-07", amount: 0 },
      { date: "2023-06-08", amount: 0 },
      { date: "2023-06-09", amount: 0 },
      { date: "2023-06-10", amount: 100000 },
      { date: "2023-06-11", amount: 0 },
      { date: "2023-06-12", amount: 80000 },
      { date: "2023-06-13", amount: 0 },
      { date: "2023-06-14", amount: 0 },
      { date: "2023-06-15", amount: 0 },
    ];

    // Trạng thái ngân sách
    const budgetStatuses = {
      healthy: relevantBudgets.filter(
        (b) => (b.currentAmount / b.amount) * 100 < 75
      ).length,
      warning: relevantBudgets.filter(
        (b) =>
          (b.currentAmount / b.amount) * 100 >= 75 &&
          (b.currentAmount / b.amount) * 100 < 100
      ).length,
      exceeded: relevantBudgets.filter((b) => b.currentAmount > b.amount)
        .length,
    };

    res.json({
      month: reportMonth,
      year: reportYear,
      totalBudgets: relevantBudgets.length,
      summary: {
        totalBudgeted,
        totalSpent,
        totalRemaining,
        overallProgress,
        budgetStatuses,
      },
      categoryAnalysis,
      dailySpending,
      budgets: relevantBudgets.map((budget) => ({
        id: budget.id,
        name: budget.name,
        amount: budget.amount,
        spent: budget.currentAmount,
        remaining: budget.amount - budget.currentAmount,
        progress: Math.round((budget.currentAmount / budget.amount) * 100),
        status:
          budget.currentAmount > budget.amount
            ? "exceeded"
            : (budget.currentAmount / budget.amount) * 100 >=
              budget.notificationThreshold
            ? "warning"
            : "healthy",
      })),
    });
  } catch (error) {
    console.error("Error generating budget report:", error);
    res.status(500).json({ message: "Error generating budget report" });
  }
};
