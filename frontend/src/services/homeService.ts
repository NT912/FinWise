import api from "./apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🏠 Lấy dữ liệu trang Home (Số dư, tổng chi tiêu)
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

    // Trả về dữ liệu từ API home
    return {
      ...homeResponse.data,
      userName: homeResponse.data.userName || "User", // Sử dụng userName từ homeResponse hoặc mặc định là "User"
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
      savingsOnGoals: 0,
      goalPercentage: 0,
      revenueLostWeek: 0,
      foodLastWeek: 0,
      transactions: [],
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
        date: new Date().toLocaleDateString(),
        transactions: [
          {
            id: "1",
            title: "Salary",
            type: "income",
            amount: 3500000,
            date: new Date(),
            category: {
              name: "Salary",
              type: "income",
              icon: "cash-outline",
              color: "#4CAF50",
            },
          },
          {
            id: "2",
            title: "Restaurant",
            type: "expense",
            amount: 150000,
            date: new Date(Date.now() - 86400000), // Yesterday
            category: {
              name: "Food & Drink",
              type: "expense",
              icon: "restaurant-outline",
              color: "#FF6B6B",
            },
          },
        ],
      },
      {
        date: new Date(Date.now() - 86400000 * 2).toLocaleDateString(), // 2 days ago
        transactions: [
          {
            id: "3",
            title: "Transportation",
            type: "expense",
            amount: 55000,
            date: new Date(Date.now() - 86400000 * 2),
            category: {
              name: "Transportation",
              type: "expense",
              icon: "car-outline",
              color: "#4DC0F5",
            },
          },
        ],
      },
    ];
  }
};
