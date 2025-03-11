import Transaction from "../models/Transaction";
import User from "../models/User";
import SavingsGoal from "../models/Saving";

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

  // 📅 Xác định khoảng thời gian lọc
  let startDate: Date | undefined;
  const now = new Date();

  if (timeFilter === "daily") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (timeFilter === "weekly") {
    startDate = new Date(now.setDate(now.getDate() - now.getDay()));
  } else if (timeFilter === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  console.log(
    `🔹 [homeService] Lọc giao dịch từ ngày: ${startDate?.toISOString()}`
  );

  // 🧾 Giao dịch gần đây theo bộ lọc thời gian
  const transactionQuery: any = { userId };
  if (startDate) {
    transactionQuery.date = { $gte: startDate };
  }

  const recentTransactions = await Transaction.find(transactionQuery)
    .sort({ date: -1 })
    .limit(5);

  console.log(
    `✅ [homeService] Số giao dịch gần đây: ${recentTransactions.length}`
  );

  // 💰 Tính tổng thu nhập & chi tiêu theo bộ lọc thời gian
  const [totalIncomeFiltered, totalExpenseFiltered] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          userId,
          type: "income",
          ...(startDate ? { date: { $gte: startDate } } : {}),
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).then((res) => (res.length ? res[0].total : 0)),

    Transaction.aggregate([
      {
        $match: {
          userId,
          type: "expense",
          ...(startDate ? { date: { $gte: startDate } } : {}),
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).then((res) => (res.length ? res[0].total : 0)),
  ]);

  // 🔄 Lấy số dư tổng và chi tiêu tổng (không áp dụng bộ lọc thời gian)
  const [totalIncomeOverall, totalExpenseOverall] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).then((res) => (res.length ? res[0].total : 0)),

    Transaction.aggregate([
      { $match: { userId, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).then((res) => (res.length ? res[0].total : 0)),
  ]);

  console.log(
    `🔹 [homeService] Tổng thu nhập: ${totalIncomeOverall}, Tổng chi tiêu: ${totalExpenseOverall}`
  );

  // 🎯 Lấy mục tiêu tiết kiệm
  const savingsGoals = await SavingsGoal.find({ userId });
  console.log(`✅ [homeService] Số Savings Goals: ${savingsGoals.length}`);

  // 📤 Chuẩn bị dữ liệu trả về
  const responseData = {
    userName: user.fullName,
    userAvatar: user.avatar || "",
    totalBalance: totalIncomeOverall - totalExpenseOverall, // Luôn giữ nguyên tổng số dư
    totalExpense: totalExpenseFiltered || totalExpenseOverall, // Nếu không có giao dịch, lấy tổng số
    recentTransactions,
    savingsGoals,
  };

  console.log(`✅ [homeService] Dữ liệu trả về:`, responseData);

  return responseData;
};
