import api from "./apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config/api";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

// Đăng ký tài khoản
export const register = async (userData: RegisterData) => {
  try {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error registering user.");
  }
};

// Đăng nhập
export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post("/api/auth/login", credentials);

    if (response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);
      console.log(
        "✅ Đăng nhập thành công, token đã được lưu cho phiên hiện tại"
      );
      return { success: true, token: response.data.token };
    }

    return {
      success: false,
      message: "Login failed. No token received from server.",
    };
  } catch (error: any) {
    console.error("Login error:", error);

    let errorMessage = "Login failed. Please check your credentials.";

    if (error.response?.status === 401) {
      errorMessage = "Email or password is incorrect.";
    } else if (error.code === "ERR_NETWORK") {
      errorMessage = "Network error. Please check your connection.";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Đăng nhập bằng Google
export const loginWithGoogle = async (idToken: string) => {
  const response = await api.post("/api/auth/google", { idToken });
  await AsyncStorage.setItem("token", response.data.token);
  return response.data.token;
};

// Đăng nhập bằng Facebook
export const loginWithFacebook = async (accessToken: string) => {
  try {
    console.log("📤 Gửi token Facebook đến server...");
    const response = await api.post("/api/auth/facebook", { accessToken });

    if (response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);
      console.log("✅ Token Facebook được lưu:", response.data.token);
    } else {
      console.warn("⚠️ Không tìm thấy token từ Facebook API!");
    }

    return response.data.token;
  } catch (error) {
    console.error("❌ Facebook login error:", error);
    throw new Error("Facebook authentication failed");
  }
};

// Forgot password - request reset code
export const forgotPassword = async (email: string) => {
  try {
    console.log("📤 Sending forgot password request for:", email);
    const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
      email,
    });
    console.log("✅ Forgot password response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Forgot password error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to send reset code"
    );
  }
};

// Reset password with code
export const resetPassword = async (email: string, resetCode: string) => {
  try {
    console.log("📤 Verifying reset code for:", email);
    console.log("Reset code:", resetCode);

    const response = await axios.post(`${API_URL}/api/auth/verify-reset-code`, {
      email,
      resetCode,
    });

    console.log("✅ Reset code verification response:", response.data);
    return response.data;
  } catch (error: any) {
    // Trả về response data từ server nếu có
    if (error.response?.data) {
      return error.response.data;
    }

    // Nếu không có response data, throw error
    throw new Error("Failed to verify code. Please try again.");
  }
};

// Update password with new password
export const updatePassword = async (
  email: string,
  resetCode: string,
  newPassword: string
) => {
  try {
    console.log("📤 Updating password for:", email);
    const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
      email,
      resetCode,
      newPassword,
    });
    console.log("✅ Password update response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Password update error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to update password"
    );
  }
};

// Đăng xuất
export const logout = async () => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userId");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Lấy thông tin người dùng
export const getUserData = async () => {
  try {
    const response = await api.get("/api/user/profile");
    return response.data;
  } catch (error) {
    console.error("Get user data error:", error);
    throw error;
  }
};

// Kiểm tra xem người dùng đã đăng nhập chưa
export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem("token");
  return !!token;
};

export default {
  register,
  login,
  logout,
  loginWithGoogle,
  loginWithFacebook,
  forgotPassword,
  resetPassword,
  updatePassword,
  getUserData,
  isAuthenticated,
};
