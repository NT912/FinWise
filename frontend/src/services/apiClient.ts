import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { config } from "../config/config";

// Đồng bộ với cấu hình từ apiService để đảm bảo tất cả các gọi API đều sử dụng cùng URL base
const getApiUrl = () => {
  return config.api.baseUrl;
};

const API_URL = getApiUrl();
console.log("🔍 API URL hiện tại (apiClient):", API_URL);

// Tạo instance axios với cấu hình chung
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: config.api.timeout,
});

// Thêm interceptor cho request để tự động thêm token xác thực
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Kiểm tra kết nối mạng
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error("Không có kết nối mạng");
      }

      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log("📤 Request (apiClient):", {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
      });

      return config;
    } catch (error) {
      console.error("Error setting auth token:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor cho response để xử lý lỗi
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ Response thành công (apiClient):", {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
    });
    return response;
  },
  async (error) => {
    // Kiểm tra trạng thái lỗi 401 (Unauthorized) - token hết hạn hoặc không hợp lệ
    if (error.response && error.response.status === 401) {
      try {
        // Xóa token và thông tin người dùng
        await AsyncStorage.multiRemove(["token", "user"]);
      } catch (e) {
        console.error("Error removing auth data:", e);
      }
    }

    console.error("❌ Response error (apiClient):", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

export default apiClient;
