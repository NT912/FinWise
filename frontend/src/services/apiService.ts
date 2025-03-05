import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.10:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

// Add token to requests if it exists
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Đăng ký tài khoản
export const register = async (userData: {
  email: string;
  password: string;
  fullName: string;
}) => {
  try {
    if (!userData.email || !userData.password || !userData.fullName) {
      throw new Error("Please provide all required information.");
    }

    console.log("📤 Sending registration data:", {
      ...userData,
      password: "***", // Hide password in logs
    });

    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error: any) {
    console.error("❌ Registration error:", error.response?.data || error);

    // 🛠 Xử lý lỗi nếu email đã tồn tại
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || "User already exists.");
    }

    throw new Error("An error occurred while registering.");
  }
};

// Đăng nhập tài khoản
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    if (response.data.success) {
      // Chỉ lưu những thông tin cần thiết
      await AsyncStorage.setItem("token", response.data.token);
      // Không cần lưu toàn bộ thông tin user
      await AsyncStorage.setItem("userId", response.data.user.id);
    }

    return response.data;
  } catch (error: any) {
    console.error("Login error:", error.message);
    throw error;
  }
};

// Đăng nhập bằng Google
export const loginWithGoogle = async (idToken: string) => {
  try {
    console.log("Sending Google token to server");
    const response = await api.post("/google", { idToken });
    const token = response.data.token;
    await AsyncStorage.setItem("token", token);
    return token;
  } catch (error) {
    console.error("Google login error:", error);
    throw new Error("Google authentication failed");
  }
};

// Đăng nhập bằng Facebook
export const loginWithFacebook = async (accessToken: string) => {
  try {
    console.log("Sending Facebook token to server");
    const response = await api.post("/facebook", { accessToken });
    const token = response.data.token;
    await AsyncStorage.setItem("token", token);
    return token;
  } catch (error) {
    console.error("Facebook login error:", error);
    throw new Error("Facebook authentication failed");
  }
};

export const forgotPassword = async (email: string) => {
  try {
    console.log("Attempting to call:", `${API_URL}/auth/forgot-password`);
    console.log("With email:", email);

    const response = await api.post("/auth/forgot-password", { email });
    console.log("Success response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("API call failed:", {
      url: `${API_URL}/auth/forgot-password`,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const resetPassword = async (
  email: string,
  resetCode: string,
  newPassword: string
) => {
  console.log("📤 Gửi request lên API:", { email, resetCode, newPassword });

  try {
    const response = await api.post("/auth/reset-password", {
      email,
      resetCode,
      newPassword,
    });

    console.log("✅ API trả về:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ API lỗi:", error.response?.data || error);
    throw error;
  }
};

// Thêm hàm để lấy token
export const getToken = () => AsyncStorage.getItem("token");

// Thêm hàm để lấy thông tin user
export const getUserId = () => AsyncStorage.getItem("userId");

export const logout = () => AsyncStorage.clear();

export const fetchDashboardData = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/dashboard"); // 🔥 Kiểm tra đường dẫn API này
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);
    throw error;
  }
};

export const scanReceipt = async (formData: FormData) => {
  const response = await axios.post(`${API_URL}/ocr/scan`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchChartData = async () => {
  const response = await axios.get(`${API_URL}/charts`);
  return response.data;
};

// ✅ API lấy thông tin user từ backend
export const fetchUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${getToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// ✅ API cập nhật hồ sơ người dùng
export const updateUserProfile = async (userData: any) => {
  try {
    const response = await axios.put(`${API_URL}/profile/update`, userData, {
      headers: { Authorization: `Bearer ${getToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
