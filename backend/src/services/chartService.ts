import Transaction from "../models/Transaction";

export const getChartDataService = async (userId: string) => {
  try {
    const transactions = await Transaction.find({ user: userId });

    let income = 0;
    let expense = 0;
    let categorizedExpenses: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.type === "income") {
        income += tx.amount;
      } else {
        expense += tx.amount;
        if (!categorizedExpenses[tx.category]) {
          categorizedExpenses[tx.category] = 0;
        }
        categorizedExpenses[tx.category] += tx.amount;
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      categorizedExpenses,
    };
  } catch (error) {
    console.error("Chart service error:", error);
    throw new Error("Failed to fetch chart data");
  }
};
