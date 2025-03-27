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

    const response = await api.get(`/api/home?filter=${filter}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ API /api/home trả về:", response.data);
    return response.data;
  } catch (error) {
    // ✅ Xử lý lỗi đúng cách
    if (error instanceof Error) {
      console.error("🚨 Lỗi lấy dữ liệu Home:", error.message);
    } else {
      console.error("🚨 Lỗi không xác định khi lấy dữ liệu Home:", error);
    }
    throw error;
  }
};
