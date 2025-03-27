import api from "./apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LoginCredentials {
  email: string;
  password: string;
}

// Đăng ký tài khoản
export const register = async (userData: {
  email: string;
  password: string;
  fullName: string;
}) => {
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
    }

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

// Quên mật khẩu
export const forgotPassword = async (email: string) => {
  const response = await api.post("/api/auth/forgot-password", { email });
  return response.data;
};

// Đặt lại mật khẩu
export const resetPassword = async (
  email: string,
  resetCode: string,
  newPassword: string
) => {
  const response = await api.post("/api/auth/reset-password", {
    email,
    resetCode,
    newPassword,
  });
  return response.data;
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
  getUserData,
  isAuthenticated,
};
