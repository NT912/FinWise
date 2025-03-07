import api from "./apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Lấy dữ liệu trang Home (Số dư, tổng chi tiêu, giao dịch gần đây)
export const fetchHomeData = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("Token không tồn tại!");
    }

    console.log("✅ Gửi request với token:", token);
    const response = await api.get(`/home`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ API /home trả về:", response.data);
    return response.data;
  } catch (error) {
    console.error("🚨 Lỗi lấy dữ liệu Home:", error);
    throw error;
  }
};

// Lấy danh sách giao dịch
export const fetchTransactions = async () => {
  try {
    const response = await api.get("/transactions");
    return response.data;
  } catch (error) {
    console.error(
      "🚨 Lỗi lấy danh sách giao dịch:",
      (error as any)?.response?.data || (error as Error)?.message || error
    );
    throw error;
  }
};
