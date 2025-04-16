import api from "./apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { config } from "../config/config";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Đăng ký tài khoản
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axios.post(
      `${config.api.baseUrl}/api/auth/register`,
      data
    );
    const { token, user } = response.data;

    await AsyncStorage.setItem(config.auth.tokenKey, token);
    await AsyncStorage.setItem(config.auth.userKey, JSON.stringify(user));

    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};

// Đăng nhập
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const response = await axios.post(
      `${config.api.baseUrl}/api/auth/login`,
      credentials
    );
    const { token, user } = response.data;

    await AsyncStorage.setItem(config.auth.tokenKey, token);
    await AsyncStorage.setItem(config.auth.userKey, JSON.stringify(user));

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
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
    const response = await axios.post(
      `${config.api.baseUrl}/api/auth/forgot-password`,
      {
        email,
      }
    );
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

    const response = await axios.post(
      `${config.api.baseUrl}/api/auth/verify-reset-code`,
      {
        email,
        resetCode,
      }
    );

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
    const response = await axios.post(
      `${config.api.baseUrl}/api/auth/reset-password`,
      {
        email,
        resetCode,
        newPassword,
      }
    );
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
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([config.auth.tokenKey, config.auth.userKey]);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Lấy thông tin người dùng
export const getCurrentUser = async (): Promise<any> => {
  try {
    const userStr = await AsyncStorage.getItem(config.auth.userKey);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
};

// Kiểm tra xem người dùng đã đăng nhập chưa
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(config.auth.tokenKey);
    return !!token;
  } catch (error) {
    console.error("Check authentication error:", error);
    return false;
  }
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
  getCurrentUser,
  isAuthenticated,
};
