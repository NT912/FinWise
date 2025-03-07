import Transaction from "../models/Transaction";
import User from "../models/User";

export const getHomeDataService = async (userId: string) => {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Lấy thông tin user
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Lấy danh sách giao dịch gần đây (giới hạn 5 giao dịch)
  const recentTransactions = await Transaction.find({ userId })
    .sort({ date: -1 }) // Sắp xếp mới nhất trước
    .limit(5);

  // Tính tổng thu nhập
  const totalIncomeResult = await Transaction.aggregate([
    { $match: { userId, type: "income" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalIncome = totalIncomeResult.length ? totalIncomeResult[0].total : 0;

  // Tính tổng chi tiêu
  const totalExpenseResult = await Transaction.aggregate([
    { $match: { userId, type: "expense" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalExpense = totalExpenseResult.length
    ? totalExpenseResult[0].total
    : 0;

  // Tính tổng số dư
  const totalBalance = totalIncome - totalExpense;

  return {
    userName: user.fullName,
    totalBalance,
    totalExpense,
    recentTransactions,
  };
};
