import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { config } from "../config/config";

// Lưu API URL vào AsyncStorage
export const saveApiUrl = async (url: string) => {
  try {
    await AsyncStorage.setItem("api_url", url);
    console.log("✅ Đã lưu API URL:", url);
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi lưu API URL:", error);
    return false;
  }
};

// Lấy API URL từ AsyncStorage
export const getStoredApiUrl = async () => {
  try {
    const url = await AsyncStorage.getItem("api_url");
    if (url) {
      console.log("🔍 Đã tìm thấy API URL đã lưu:", url);
      return url;
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy API URL:", error);
  }
  return null;
};

// Xác định baseURL dựa trên platform
const getBaseUrl = async () => {
  // Thử lấy từ AsyncStorage trước tiên
  const storedUrl = await getStoredApiUrl();
  if (storedUrl) {
    return storedUrl;
  }

  // Nếu không có URL đã lưu, sử dụng config mặc định
  return config.api.baseUrl;
};

// Tạo API client với baseURL mặc định
const api = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: config.api.timeout,
});

// Khởi tạo API client với URL từ AsyncStorage hoặc giá trị mặc định
export const initializeApi = async () => {
  try {
    const baseUrl = await getBaseUrl();
    api.defaults.baseURL = baseUrl;
    console.log("🚀 Khởi tạo API client với baseURL:", baseUrl);
    return true;
  } catch (error) {
    console.error("❌ Lỗi khởi tạo API client:", error);
    return false;
  }
};

// Gọi hàm khởi tạo ngay lập tức
initializeApi();

// Log mỗi request để debug
api.interceptors.request.use((request) => {
  console.log("🔄 Request:", request.url);
  return request;
});

// Log mỗi response để debug
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log("🚨 API Error:", error.message, error.config?.url);
    return Promise.reject(error);
  }
);

// Xóa URL đã lưu
export const clearStoredUrl = async () => {
  try {
    await AsyncStorage.removeItem("api_url");
    console.log("🗑️ Đã xóa API URL từ AsyncStorage");
  } catch (error) {
    console.error("❌ Lỗi khi xóa API URL:", error);
  }
};

// Kiểm tra token hiện tại
export const checkCurrentToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    console.log("🔑 Token hiện tại:", token.substring(0, 20) + "...");
    return true;
  }
  console.warn("⚠️ Không tìm thấy token trong AsyncStorage");
  return false;
};

// Kiểm tra kết nối server
export const checkServerConnection = async () => {
  try {
    console.log(`🔍 Kiểm tra kết nối đến: ${api.defaults.baseURL}/api/health`);
    const response = await axios.get(`${api.defaults.baseURL}/api/health`, {
      timeout: 10000,
      headers: {
        // Không gửi token cho health check
        Authorization: undefined,
      },
    });
    console.log(`✅ Kết nối thành công, status: ${response.status}`);
    return response.status === 200;
  } catch (error: any) {
    if (error.response) {
      // Server trả về response với status code không phải 2xx
      console.error(
        `❌ Lỗi kết nối server: Server trả về status ${error.response.status}`
      );
      console.error(`📄 Response data:`, error.response.data);

      // Nếu server trả về 401, vẫn coi là kết nối thành công vì endpoint health không yêu cầu token
      if (error.response.status === 401) {
        console.log(`⚠️ Server yêu cầu xác thực, nhưng kết nối cơ bản là OK`);
        return true;
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error(`❌ Lỗi kết nối server: Không nhận được response`);

      // Thử kết nối đến IP 192.168.1.8:3002 nếu đang dùng localhost hoặc 127.0.0.1
      if (
        api.defaults.baseURL &&
        (api.defaults.baseURL.includes("localhost") ||
          api.defaults.baseURL.includes("127.0.0.1"))
      ) {
        const alternativeUrl = "http://192.168.1.8:3002";
        console.log(`🔄 Thử tự động chuyển sang ${alternativeUrl}`);

        try {
          const altResponse = await axios.get(`${alternativeUrl}/api/health`, {
            timeout: 10000,
            headers: {
              // Không gửi token cho health check
              Authorization: undefined,
            },
          });

          if (altResponse.status === 200) {
            api.defaults.baseURL = alternativeUrl;
            console.log(`✅ Tự động cập nhật URL thành: ${alternativeUrl}`);
            return true;
          }
        } catch (altError: any) {
          if (altError.response && altError.response.status === 401) {
            api.defaults.baseURL = alternativeUrl;
            console.log(`✅ Tự động cập nhật URL thành: ${alternativeUrl}`);
            return true;
          }
        }
      }
    } else {
      // Có lỗi khi thiết lập request
      console.error(`❌ Lỗi thiết lập request:`, error.message);
    }
    return false;
  }
};

// Cập nhật API URL
export const updateApiUrl = async (newUrl: string) => {
  try {
    console.log(`🔄 Đang thử kết nối đến URL mới: ${newUrl}/api/health`);
    const response = await axios.get(`${newUrl}/api/health`, {
      timeout: 10000,
    });
    if (response.status === 200) {
      api.defaults.baseURL = newUrl;
      console.log("✅ Đã cập nhật API URL:", newUrl);
      return true;
    }
    return false;
  } catch (error: any) {
    if (error.response) {
      // Server trả về response với status code không phải 2xx
      console.error(
        `❌ Lỗi cập nhật API URL: Server trả về status ${error.response.status}`
      );
      console.error(`📄 Response data:`, error.response.data);
      // Nếu server trả về 401 Unauthorized, chúng ta vẫn coi là kết nối thành công
      if (error.response.status === 401) {
        console.log(`⚠️ Server yêu cầu xác thực, nhưng kết nối cơ bản là OK`);
        api.defaults.baseURL = newUrl;
        console.log("✅ Đã cập nhật API URL:", newUrl);
        return true;
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error(`❌ Lỗi cập nhật API URL: Không nhận được response`);
      console.error(`🔄 Request:`, error.request);
    } else {
      // Có lỗi khi thiết lập request
      console.error(`❌ Lỗi thiết lập request:`, error.message);
    }
    return false;
  }
};

// Interceptor request
api.interceptors.request.use(
  async (config) => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error("Không có kết nối mạng");
      }

      const token = await AsyncStorage.getItem("token");

      // Nếu có token, thêm vào header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Danh sách các endpoint không yêu cầu token
        const publicEndpoints = [
          "/api/health",
          "/api/auth/login",
          "/api/auth/register",
          "/api/auth/forgot-password",
          "/api/auth/reset-password",
          "/api/auth/google",
          "/api/auth/facebook",
        ];

        // Kiểm tra xem endpoint hiện tại có trong danh sách public không
        const isPublicEndpoint = publicEndpoints.some(
          (endpoint) => config.url && config.url.includes(endpoint)
        );

        // Nếu không phải endpoint public và không có token
        if (!isPublicEndpoint) {
          console.log("⚠️ Yêu cầu token cho endpoint:", config.url);
          // Lưu lại URL để chuyển hướng sau khi đăng nhập
          await AsyncStorage.setItem("lastRequestUrl", config.url || "");

          // Không throw error ở đây để tiếp tục request và handle lỗi 401 trong response interceptor
        }
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("❌ Lỗi request:", error);
    return Promise.reject(error);
  }
);

// Interceptor response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (!error.response) {
      console.error("🚨 Network Error:", error.message);
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error("Không có kết nối internet");
      }
      throw new Error("Không thể kết nối đến máy chủ");
    }

    if (error.response.status === 401) {
      console.log("🔑 Lỗi xác thực 401, xóa token hiện tại");

      // Chỉ xóa token nếu error không phải từ các endpoint xác thực
      const authEndpoints = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/forgot-password",
      ];
      const isAuthEndpoint = authEndpoints.some(
        (endpoint) =>
          error.config &&
          error.config.url &&
          error.config.url.includes(endpoint)
      );

      if (!isAuthEndpoint) {
        await AsyncStorage.removeItem("token");

        // Lưu lại URL hiện tại để có thể chuyển hướng sau khi đăng nhập lại
        if (error.config && error.config.url) {
          await AsyncStorage.setItem("lastRequestUrl", error.config.url);
        }
      }

      // Chỉ log lỗi thay vì throw error
      console.error("Phiên đăng nhập hết hạn hoặc không hợp lệ");
    }

    return Promise.reject(error);
  }
);

export default api;
