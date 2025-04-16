import api from "./apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as savingService from "./savingService";

// Hàm utility để lấy năm và tháng hiện tại
export const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // getMonth() trả về 0-11, nên +1 để được 1-12
  };
};

// Tạo chuỗi năm-tháng cho API
export const getCurrentMonthString = () => {
  const { year, month } = getCurrentYearMonth();
  return `${year}-${month}`;
};

// 🏠 Lấy dữ liệu trang Home (Số dư, tổng chi tiêu) và tổng ngân sách của tháng hiện tại
export const fetchHomeData = async (filter = "monthly") => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("🚨 Token không tồn tại!");
    }

    console.log("✅ Gửi request với token:", token);
    console.log(`✅ Đang gọi API /api/home?timeFilter=${filter}`);

    // Lấy dữ liệu home
    const homeResponse = await api.get(`/api/home?timeFilter=${filter}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ API /api/home trả về:", homeResponse.data);

    // Kiểm tra dữ liệu người dùng
    if (!homeResponse.data.userName) {
      console.warn("⚠️ API không trả về userName, sử dụng giá trị mặc định");
    } else {
      console.log("✅ API trả về userName:", homeResponse.data.userName);
    }

    // Lấy tổng ngân sách của tháng hiện tại
    let monthlyBudget = 20000000; // Giá trị mặc định
    try {
      const currentMonth = getCurrentMonthString();
      monthlyBudget = await savingService.getTotalBudget(currentMonth);
      console.log("✅ Tổng ngân sách tháng hiện tại:", monthlyBudget);
    } catch (budgetError) {
      console.warn(
        "⚠️ Không thể lấy tổng ngân sách, sử dụng giá trị mặc định:",
        budgetError
      );
    }

    // Trả về dữ liệu từ API home
    return {
      userName: homeResponse.data.userName || "User",
      userAvatar: homeResponse.data.userAvatar || "",
      totalBalance: homeResponse.data.totalBalance || 0,
      totalExpense: homeResponse.data.totalExpense || 0,
      savingsOnGoals: homeResponse.data.savingsOnGoals || 0,
      goalPercentage: homeResponse.data.goalPercentage || 0,
      revenueLostWeek: homeResponse.data.revenueLostWeek || 0,
      foodLastWeek: homeResponse.data.foodLastWeek || 0,
      monthlyBudget: monthlyBudget,
      budgetPercentage:
        monthlyBudget > 0
          ? Math.min(
              Math.round(
                ((homeResponse.data.totalExpense || 0) / monthlyBudget) * 100
              ),
              100
            )
          : 0,
    };
  } catch (error: any) {
    // ✅ Xử lý lỗi đúng cách
    if (error instanceof Error) {
      console.error("🚨 Lỗi lấy dữ liệu Home:", error.message);
    } else {
      console.error("🚨 Lỗi không xác định khi lấy dữ liệu Home:", error);
    }

    // In thêm thông tin chi tiết của lỗi nếu có
    if (error.response) {
      console.error("🚨 Chi tiết lỗi:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
      });
    }

    // Trả về dữ liệu mặc định trong trường hợp lỗi
    return {
      userName: "User",
      userAvatar: "",
      totalBalance: 0,
      totalExpense: 0,
      savingsOnGoals: 1500000,
      goalPercentage: 45,
      revenueLostWeek: 2500000,
      foodLastWeek: 750000,
      transactions: [],
      monthlyBudget: 20000000,
      budgetPercentage: 0,
    };
  }
};

// 📝 Lấy dữ liệu giao dịch gần đây
export const fetchTransactions = async (filter = "monthly") => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("🚨 Token does not exist!");
    }

    // Chuyển đổi filter sang timeFilter cho endpoint
    const endpoint = `/api/transactions?timeFilter=${filter}`;

    console.log(`✅ Calling API: ${endpoint}`);

    // Lấy dữ liệu giao dịch
    const response = await api.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ API transactions response:", response.data);

    // Kiểm tra định dạng dữ liệu trả về
    if (response.data && Array.isArray(response.data.transactions)) {
      return response.data.transactions;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn("⚠️ Unexpected transaction data format:", response.data);
      return [];
    }
  } catch (error: any) {
    // ✅ Xử lý lỗi
    if (error instanceof Error) {
      console.error("🚨 Error fetching transactions:", error.message);
    } else {
      console.error("🚨 Unknown error when fetching transactions:", error);
    }

    // In thêm thông tin chi tiết của lỗi nếu có
    if (error.response) {
      console.error("🚨 Error details:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
      });
    }

    // Return sample data in case of error
    return [
      {
        date: "Today",
        transactions: [
          {
            id: "1",
            title: "Salary",
            type: "income",
            amount: 15000000,
            date: new Date(),
            category: "Salary",
          },
          {
            id: "2",
            title: "Restaurant",
            type: "expense",
            amount: 350000,
            date: new Date(Date.now() - 86400000), // Yesterday
            category: "Food & Drink",
          },
        ],
      },
      {
        date: "Yesterday",
        transactions: [
          {
            id: "3",
            title: "Transportation",
            type: "expense",
            amount: 85000,
            date: new Date(Date.now() - 86400000 * 2),
            category: "Transportation",
          },
        ],
      },
    ];
  }
};
