import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";

// Cập nhật URL API dựa trên môi trường
const getApiUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:3001/api";
  } else {
    // Địa chỉ IP của máy host - được cập nhật theo mạng hiện tại
    const hostIP = "172.20.10.2"; // Địa chỉ IP của máy chủ của bạn trong mạng LAN

    // Danh sách các IP dự phòng để thử kết nối
    const fallbackIPs = [
      hostIP, // IP chính
      "localhost", // localhost
      "10.0.2.2", // Địa chỉ localhost cho Android Emulator
      "127.0.0.1", // localhost alternative
    ];

    console.log("📱 Thiết bị di động, sử dụng IP:", hostIP);

    return __DEV__
      ? `http://${hostIP}:3001/api` // Sử dụng IP thực của máy chủ cho thiết bị di động
      : "https://your-production-api.com/api"; // URL production
  }
};

const API_URL = getApiUrl();
console.log("🔍 API URL hiện tại:", API_URL);

// Biến lưu URL thực sự đang sử dụng
let activeApiUrl = API_URL;

// Kiểm tra kết nối đến server trước khi khởi tạo API client
const checkServerConnection = async () => {
  try {
    console.log("🔄 Kiểm tra kết nối đến máy chủ:", `${API_URL}/health`);
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    console.log("✅ Máy chủ hoạt động:", response.data);
    return true;
  } catch (error: any) {
    console.error(
      "❌ Không thể kết nối đến máy chủ:",
      error?.message || "Unknown error"
    );

    // Sử dụng cơ chế thử kết nối với các IP thay thế
    console.log("🔄 Thử kết nối với các IP thay thế...");
    const fallbackUrl = await tryFallbackConnections();

    if (fallbackUrl) {
      console.log("✅ Đã tìm thấy IP hoạt động:", fallbackUrl);
      // Ghi lại IP hoạt động để sử dụng cho lần sau
      // Lưu ý: Đây chỉ là gợi ý, cần thêm cơ chế đồng bộ thực tế
      console.log("💡 Gợi ý: Cập nhật IP trong mã nguồn thành IP đã xác minh");
      return true;
    }

    // Nếu không tìm thấy IP nào hoạt động
    console.error("❌ Tất cả các IP đều không hoạt động");
    return false;
  }
};

// API client với cấu hình tốt hơn
const api = axios.create({
  baseURL: API_URL, // URL ban đầu, có thể được cập nhật sau
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
  // Thêm withCredentials để hỗ trợ CORS với credentials
  withCredentials: true,
});

// Gọi hàm kiểm tra kết nối và cập nhật URL nếu cần
checkServerConnection().then(async (isConnected) => {
  console.log("🌐 Kết nối máy chủ khả dụng:", isConnected);

  if (!isConnected) {
    // Nếu không kết nối được, thử với các IP dự phòng
    const fallbackUrl = await tryFallbackConnections();
    if (fallbackUrl) {
      activeApiUrl = fallbackUrl;
      console.log("🔀 Chuyển sang sử dụng URL:", activeApiUrl);
    }
  }

  // Cập nhật baseURL cho api instance
  api.defaults.baseURL = activeApiUrl;
  console.log("🔌 API hiện đang sử dụng URL:", api.defaults.baseURL);
});

// Enhanced error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("🚨 Lỗi kết nối mạng chi tiết:", {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        stack: error.stack,
      });

      // Kiểm tra kết nối internet
      const netInfo = await NetInfo.fetch();
      console.log("📶 Trạng thái mạng khi gặp lỗi:", netInfo);

      if (!netInfo.isConnected) {
        throw new Error(
          "Không có kết nối internet. Vui lòng kiểm tra kết nối mạng."
        );
      }

      // Kiểm tra kết nối đến server
      try {
        await axios.get(API_URL + "/health", { timeout: 5000 });
      } catch (serverError) {
        console.error("🚨 Lỗi kết nối đến server:", serverError);
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
    } else {
      console.warn("⚠️ Không tìm thấy token trong AsyncStorage");
    }

    console.log("📤 Request:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      data: config.data
        ? JSON.stringify(config.data).substring(0, 200) + "..."
        : undefined,
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
      method: response.config.method,
      status: response.status,
      data: response.data ? "Data received" : "No data",
    });
    return response;
  },
  async (error) => {
    console.error("❌ Response lỗi:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Xử lý lỗi mạng
    if (!error.response) {
      console.error("🚨 Network error details:", error);
      throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    }

    // Xử lý lỗi 401 (Unauthorized)
    if (error.response.status === 401) {
      console.log("⚠️ Token không hợp lệ hoặc hết hạn, đang xóa token...");
      await AsyncStorage.removeItem("token");
      // Có thể thêm logic chuyển về màn hình login ở đây
    }

    return Promise.reject(error);
  }
);

// Đối với chức năng xóa tài khoản, thêm xử lý đặc biệt
export const enhancedDelete = async (url: string, data?: any) => {
  try {
    console.log(`🚨 Enhanced delete request to ${url}`);
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return await api.delete(url, {
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Enhanced delete error:", error);
    throw error;
  }
};

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

// Tự động thử kết nối với các IP dự phòng nếu IP chính không hoạt động
const tryFallbackConnections = async () => {
  const fallbackIPs = [
    "172.20.10.2", // IP hiện tại
    "192.168.1.4", // IP trước đó
    "localhost",
    "10.0.2.2", // Địa chỉ localhost cho Android Emulator
    "127.0.0.1",
  ];

  for (const ip of fallbackIPs) {
    try {
      console.log(`🔄 Thử kết nối với IP: ${ip}`);
      const url = `http://${ip}:3001/api/health`;
      const response = await axios.get(url, { timeout: 5000 });

      if (response.status === 200) {
        console.log(`✅ Kết nối thành công với IP: ${ip}`);
        return `http://${ip}:3001/api`;
      }
    } catch (error: any) {
      const errorMsg = error?.message || "Unknown error";
      const errorCode = error?.code || "NO_CODE";
      console.log(
        `❌ Không thể kết nối với IP: ${ip} - ${errorCode}: ${errorMsg}`
      );

      // Tiếp tục với IP tiếp theo
      continue;
    }
  }

  console.error("❌ Không thể kết nối với bất kỳ IP nào trong danh sách");
  return null;
};
