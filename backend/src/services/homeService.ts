import User from "../models/User";
import SavingsGoal from "../models/Saving";
import Transaction from "../models/Transaction";
import mongoose, { Document } from "mongoose";

interface CategoryPopulated {
  _id: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  type: string;
}

interface TransactionWithPopulatedCategory extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  date: Date;
  type: string;
  category: CategoryPopulated;
  userId: mongoose.Types.ObjectId;
}

interface TransactionGroupItem {
  id: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  date: Date;
  type: string;
  category: CategoryPopulated;
}

interface TransactionGroup {
  date: string;
  transactions: TransactionGroupItem[];
}

export const getHomeDataService = async (
  userId: string,
  timeFilter: string
) => {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  console.log(
    `✅ [homeService] Lấy dữ liệu Home cho userId: ${userId}, filter: ${timeFilter}`
  );

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  console.log(
    `🔹 [homeService] User: ${user.fullName}, Avatar: ${user.avatar}`
  );

  // Calculate date range based on time filter
  const now = new Date();
  let startDate = new Date();

  switch (timeFilter.toLowerCase()) {
    case "daily":
      startDate.setDate(now.getDate() - 1);
      break;
    case "weekly":
      startDate.setDate(now.getDate() - 7);
      break;
    case "monthly":
    default:
      startDate.setMonth(now.getMonth() - 1);
      break;
  }

  // Fetch transactions for the time period
  const transactions = (await Transaction.find({
    userId: new mongoose.Types.ObjectId(userId),
    date: { $gte: startDate, $lte: now },
  })
    .populate({
      path: "category",
      select: "name icon color type",
    })
    .sort({ date: -1 })) as unknown as TransactionWithPopulatedCategory[];

  console.log(
    `✅ [homeService] Fetched ${transactions.length} transactions for the ${timeFilter} period`
  );

  // Calculate financial metrics
  let totalBalance = 0;
  let totalExpense = 0;
  let revenueLostWeek = 0;
  let foodLastWeek = 0;

  // Last week date for specific calculations
  const lastWeekDate = new Date();
  lastWeekDate.setDate(now.getDate() - 7);

  transactions.forEach((transaction) => {
    // Add to total balance
    if (transaction.type === "income") {
      totalBalance += transaction.amount;

      // Revenue in the last week
      if (transaction.date >= lastWeekDate) {
        revenueLostWeek += transaction.amount;
      }
    } else if (transaction.type === "expense") {
      totalBalance -= transaction.amount;
      totalExpense += transaction.amount;

      // Food expenses in the last week
      if (
        transaction.date >= lastWeekDate &&
        transaction.category &&
        (transaction.category.name === "Food & Drink" ||
          transaction.category.name === "Restaurant")
      ) {
        foodLastWeek += transaction.amount;
      }
    }
  });

  // Group transactions by date for display
  const groupedTransactions: TransactionGroup[] = [];
  const dateGroups: Record<string, TransactionGroup> = {};

  transactions.forEach((transaction) => {
    const dateStr = transaction.date.toLocaleDateString();

    if (!dateGroups[dateStr]) {
      dateGroups[dateStr] = {
        date: dateStr,
        transactions: [],
      };
      groupedTransactions.push(dateGroups[dateStr]);
    }

    const transactionItem: TransactionGroupItem = {
      id: transaction._id,
      title: transaction.title,
      amount: transaction.amount,
      date: transaction.date,
      type: transaction.type,
      category: transaction.category,
    };

    dateGroups[dateStr].transactions.push(transactionItem);
  });

  // 🎯 Lấy mục tiêu tiết kiệm
  const savingsGoals = await SavingsGoal.find({ userId });
  console.log(`✅ [homeService] Số Savings Goals: ${savingsGoals.length}`);

  // Calculate savings progress
  let savingsOnGoals = 0;
  let goalPercentage = 0;

  if (savingsGoals.length > 0) {
    const totalSavings = savingsGoals.reduce(
      (sum, goal) => sum + (goal.currentAmount || 0),
      0
    );
    const totalGoals = savingsGoals.reduce(
      (sum, goal) => sum + (goal.targetAmount || 0),
      0
    );

    savingsOnGoals = totalSavings;
    if (totalGoals > 0) {
      goalPercentage = Math.round((totalSavings / totalGoals) * 100);
    }
  }

  // 📤 Chuẩn bị dữ liệu trả về
  const responseData = {
    userName: user.fullName,
    userAvatar: user.avatar || "",
    totalBalance: totalBalance,
    totalExpense: totalExpense,
    savingsOnGoals: savingsOnGoals,
    goalPercentage: goalPercentage,
    revenueLostWeek: revenueLostWeek,
    foodLastWeek: foodLastWeek,
    transactions: groupedTransactions,
  };

  console.log(
    `✅ [homeService] Dữ liệu trả về với ${groupedTransactions.length} nhóm giao dịch`
  );

  return responseData;
};
