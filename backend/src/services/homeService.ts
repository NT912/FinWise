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

  // 🎯 Lấy mục tiêu tiết kiệm
  const savingsGoals = await SavingsGoal.find({ userId });
  console.log(`✅ [homeService] Số Savings Goals: ${savingsGoals.length}`);

  // 📤 Chuẩn bị dữ liệu trả về
  const responseData = {
    userName: user.fullName,
    userAvatar: user.avatar || "",
    totalBalance: 0, // Đã loại bỏ tính toán từ giao dịch
    totalExpense: 0, // Đã loại bỏ tính toán từ giao dịch
    savingsGoals,
  };

  console.log(`✅ [homeService] Dữ liệu trả về:`, responseData);

  return responseData;
};
