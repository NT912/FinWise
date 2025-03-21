import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";

// Cập nhật URL API dựa trên môi trường
const getApiUrl = () => {
  // Use local IP for development
  if (__DEV__) {
    return "http://192.168.1.15:3000/api";
  }

  // Use EC2 URL for production
  return "http://3.87.47.184:3000/api";
};

const API_URL = getApiUrl();
console.log("🔍 API URL hiện tại:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

// Enhanced error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("🚨 Lỗi kết nối mạng chi tiết:", {
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        stack: error.stack,
      });

      // Kiểm tra kết nối internet
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error(
          "Không có kết nối internet. Vui lòng kiểm tra kết nối mạng."
        );
      }

      // Kiểm tra kết nối đến server
      try {
        await axios.get(API_URL + "/health");
      } catch (serverError) {
        throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    }

    return Promise.reject(error);
  }
);

// Xử lý request
api.interceptors.request.use(async (config) => {
  try {
    console.log("🌐 Kiểm tra kết nối mạng...");
    const netInfo = await NetInfo.fetch();
    console.log("📶 Trạng thái mạng:", netInfo);

    if (!netInfo.isConnected) {
      throw new Error("Không có kết nối mạng");
    }

    const token = await AsyncStorage.getItem("token");
    if (token) {
      console.log("🔑 Token được tìm thấy, thêm vào header");
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("📤 Request:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
    });

    return config;
  } catch (error) {
    console.error("❌ Lỗi khi gửi request:", error);
    return Promise.reject(error);
  }
});

// Xử lý response
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response thành công:", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  async (error) => {
    console.error("❌ Response lỗi:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Xử lý lỗi mạng
    if (!error.response) {
      throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    }

    // Xử lý lỗi 401 (Unauthorized)
    if (error.response.status === 401) {
      await AsyncStorage.clear(); // Xóa token
      // Có thể thêm logic chuyển về màn hình login ở đây
    }

    return Promise.reject(error);
  }
);

export default api;

// Thêm hàm delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Thêm hàm retry
const withRetry = async (fn: () => Promise<any>, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000 * (i + 1));
      console.log(`🔄 Retry attempt ${i + 1}`);
    }
  }
};

// Áp dụng retry cho các request
api.interceptors.request.use(async (config) => {
  return withRetry(async () => {
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

      // Log request để debug
      console.log("📤 Request:", {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        headers: config.headers,
      });

      return config;
    } catch (error) {
      console.error("❌ Lỗi khi gửi request:", error);
      return Promise.reject(error);
    }
  });
});
