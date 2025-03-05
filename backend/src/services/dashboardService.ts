import Transaction from "../models/Transaction";

export const getDashboardDataService = async (userId: string) => {
  const totalIncome = await Transaction.aggregate([
    { $match: { user: userId, type: "income" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalExpense = await Transaction.aggregate([
    { $match: { user: userId, type: "expense" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const transactions = await Transaction.find({ user: userId })
    .sort({ date: -1 })
    .limit(5);

  return {
    totalBalance: totalIncome[0]?.total - totalExpense[0]?.total || 0,
    totalIncome: totalIncome[0]?.total || 0,
    totalExpense: totalExpense[0]?.total || 0,
    transactions,
  };
};
