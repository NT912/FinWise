import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";

// Đơn giản hóa cách lấy API URL
const getApiUrl = () => {
  // Ưu tiên sử dụng biến môi trường API_URL nếu có
  if (process.env.API_URL) {
    console.log("🔍 Sử dụng API_URL từ .env:", process.env.API_URL);
    return process.env.API_URL;
  }

  // URL mặc định cho thiết bị di động
  return "http://192.168.1.4:3002";
};

const API_URL = getApiUrl();
console.log("🔍 API URL hiện tại:", API_URL);

// Tạo instance API
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

// Kiểm tra token hiện tại (hàm debug)
export const checkCurrentToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    console.log("🔑 Token hiện tại:", token.substring(0, 20) + "...");
    return true;
  } else {
    console.warn("⚠️ Không tìm thấy token trong AsyncStorage");
    return false;
  }
};

// Chỉ giữ một interceptor request để thêm token vào header
api.interceptors.request.use(async (config) => {
  try {
    // Kiểm tra kết nối mạng
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error("Không có kết nối mạng");
    }

    // Lấy token từ AsyncStorage
    const token = await AsyncStorage.getItem("token");
    if (token) {
      console.log("🔑 Thêm token vào request:", config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(
        "⚠️ Không tìm thấy token trong AsyncStorage cho request:",
        config.url
      );
      // Không throw error ở đây để các API public vẫn hoạt động
    }

    console.log("📤 Request:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
    });

    return config;
  } catch (error) {
    console.error("❌ Lỗi khi gửi request:", error);
    return Promise.reject(error);
  }
});

// Xử lý response đơn giản và rõ ràng
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response thành công:", {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
    });
    return response;
  },
  async (error) => {
    if (!error.response) {
      // Lỗi kết nối mạng
      console.error("🚨 Network Error:", {
        message: error.message,
        config: error.config,
      });

      // Kiểm tra kết nối internet
      try {
        const netInfo = await NetInfo.fetch();
        console.log("📶 Trạng thái mạng:", netInfo);

        if (!netInfo.isConnected) {
          throw new Error("Không có kết nối internet. Vui lòng kiểm tra mạng.");
        }

        // Thử kết nối đến Google để xác nhận internet
        try {
          await axios.get("https://www.google.com", { timeout: 5000 });
          console.log("✅ Internet hoạt động, vấn đề từ server API");
        } catch (e) {
          console.error("❌ Lỗi kết nối Internet:", e);
        }

        throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      } catch (netError) {
        throw netError;
      }
    } else {
      // Lỗi từ server
      console.error("❌ Response error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Xử lý lỗi 401 (Unauthorized)
      if (error.response.status === 401) {
        console.log("⚠️ Token không hợp lệ hoặc hết hạn, đang xóa token...");
        await AsyncStorage.removeItem("token");
        // Có thể thêm logic chuyển về màn hình login ở đây
      }
    }

    return Promise.reject(error);
  }
);

// Kiểm tra kết nối đến server
export const checkServerConnection = async () => {
  try {
    console.log("🔄 Kiểm tra kết nối đến máy chủ:", `${API_URL}/api/health`);
    const response = await axios.get(`${API_URL}/api/health`, {
      timeout: 5000,
    });
    console.log("✅ Máy chủ hoạt động:", response.data);
    return true;
  } catch (error: any) {
    console.error(
      "❌ Không thể kết nối đến máy chủ:",
      error?.message || "Unknown error"
    );
    return false;
  }
};

// Đơn giản hóa thử kết nối với các IP
export const tryFallbackConnections = async () => {
  const fallbackIPs = [
    "192.168.1.4", // IP hiện tại
    "localhost",
    "127.0.0.1",
  ];

  for (const ip of fallbackIPs) {
    try {
      console.log(`🔄 Thử kết nối với IP: ${ip}`);
      const url = `http://${ip}:3002/api/health`;
      const response = await axios.get(url, { timeout: 5000 });

      if (response.status === 200) {
        console.log(`✅ Kết nối thành công với IP: ${ip}`);
        // Cập nhật base URL cho mọi request sau này
        api.defaults.baseURL = `http://${ip}:3002`;
        console.log("🔌 API URL đã được cập nhật thành:", api.defaults.baseURL);
        return `http://${ip}:3002`;
      }
    } catch (error: any) {
      console.error(`❌ Không thể kết nối đến ${ip}:`, error?.message);
    }
  }

  console.error("❌ Tất cả các IP thử nghiệm đều không hoạt động");
  return null;
};

export default api;
