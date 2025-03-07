import api from "./apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Đăng ký tài khoản
export const register = async (userData: {
  email: string;
  password: string;
  fullName: string;
}) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error registering user.");
  }
};

// Đăng nhập tài khoản
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });

    if (response.data.success && response.data.token) {
      await AsyncStorage.setItem("token", response.data.token); // ✅ Lưu token
      await AsyncStorage.setItem("userId", response.data.user.id); // ✅ Lưu userId
      console.log("✅ Token được lưu:", response.data.token);
    } else {
      console.warn("⚠️ Không có token trong response!");
    }

    return response.data;
  } catch (error: any) {
    console.error("❌ Login error:", error.response?.data || error);
    throw error;
  }
};

// Đăng nhập bằng Google
export const loginWithGoogle = async (idToken: string) => {
  const response = await api.post("/auth/google", { idToken });
  await AsyncStorage.setItem("token", response.data.token);
  return response.data.token;
};

// Đăng nhập bằng Facebook
export const loginWithFacebook = async (accessToken: string) => {
  try {
    console.log("📤 Gửi token Facebook đến server...");
    const response = await api.post("/auth/facebook", { accessToken });

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
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

// Đặt lại mật khẩu
export const resetPassword = async (
  email: string,
  resetCode: string,
  newPassword: string
) => {
  const response = await api.post("/auth/reset-password", {
    email,
    resetCode,
    newPassword,
  });
  return response.data;
};

// Đăng xuất
export const logout = () => AsyncStorage.clear();

export default {
  loginUser,
  register,
  loginWithGoogle,
  loginWithFacebook,
  forgotPassword,
  resetPassword,
  logout,
};
