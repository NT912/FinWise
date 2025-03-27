import api from "./apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

interface LoginCredentials {
  email: string;
  password: string;
}

interface BiometricLoginResult {
  success: boolean;
  error?: string;
  token?: string;
  userData?: any;
}

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

// Đăng nhập
export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post("/auth/login", credentials);

    if (response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);

      // Lưu thông tin đăng nhập cho Face ID nếu tính năng đã được bật
      const faceIDEnabledStr = await AsyncStorage.getItem("faceIDEnabled");
      if (faceIDEnabledStr === "true") {
        await saveSecureCredentials(credentials);
      }
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
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
export const logout = async () => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userId");
    // Không xóa securedEmail và securedPassword để có thể dùng Face ID đăng nhập lại
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Lấy thông tin người dùng
export const getUserData = async () => {
  try {
    const response = await api.get("/user/profile");
    return response.data;
  } catch (error) {
    console.error("Get user data error:", error);
    throw error;
  }
};

// Kiểm tra xem có thể đăng nhập bằng Face ID không
export const canLoginWithBiometrics = async (): Promise<boolean> => {
  try {
    // Kiểm tra xem thiết bị có hỗ trợ Face ID không
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;

    // Kiểm tra xem Face ID có được cấu hình trên thiết bị không
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) return false;

    // Kiểm tra xem có lưu thông tin đăng nhập không
    const email = await AsyncStorage.getItem("securedEmail");
    const password = await AsyncStorage.getItem("securedPassword");
    if (!email || !password) return false;

    // Kiểm tra xem người dùng đã bật Face ID trong ứng dụng chưa
    const faceIDEnabledStr = await AsyncStorage.getItem("faceIDEnabled");
    return faceIDEnabledStr === "true";
  } catch (error) {
    console.error("Error checking biometric availability:", error);
    return false;
  }
};

// Đăng nhập bằng Face ID
export const loginWithBiometrics = async (): Promise<BiometricLoginResult> => {
  try {
    const canUse = await canLoginWithBiometrics();
    if (!canUse) {
      return {
        success: false,
        error:
          "Face ID is not available or hasn't been configured for this app.",
      };
    }

    // Xác thực bằng Face ID
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to Login",
      fallbackLabel: "Use Password",
      cancelLabel: "Cancel",
      disableDeviceFallback: true,
    });

    if (!result.success) {
      return {
        success: false,
        error: "Face ID authentication failed.",
      };
    }

    // Lấy thông tin đăng nhập đã lưu
    const email = await AsyncStorage.getItem("securedEmail");
    const password = await AsyncStorage.getItem("securedPassword");

    if (!email || !password) {
      return {
        success: false,
        error:
          "Saved login credentials not found. Please login with password first.",
      };
    }

    // Đăng nhập bằng thông tin đã lưu
    const response = await api.post("/auth/login", { email, password });

    if (response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);

      return {
        success: true,
        token: response.data.token,
        userData: response.data.user,
      };
    } else {
      return {
        success: false,
        error: "Invalid login credentials.",
      };
    }
  } catch (error) {
    console.error("Biometric login error:", error);
    return {
      success: false,
      error: "An error occurred during Face ID authentication.",
    };
  }
};

// Kiểm tra xem token có hợp lệ không
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return false;

    // Kiểm tra token còn hợp lệ không
    const response = await api.get("/auth/verify");
    return response.data.valid;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
};

// Lưu thông tin đăng nhập an toàn cho Face ID
export const saveSecureCredentials = async (
  credentials: LoginCredentials
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem("securedEmail", credentials.email);
    await AsyncStorage.setItem("securedPassword", credentials.password);
    return true;
  } catch (error) {
    console.error("Error saving secure credentials:", error);
    return false;
  }
};

// Thêm hàm xác thực bằng FaceID cho bất kỳ tác vụ nào
export const authenticateWithFaceID = async (
  prompt = "Xác thực bằng Face ID"
): Promise<boolean> => {
  try {
    // Kiểm tra thiết bị có hỗ trợ FaceID không
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      console.log("Thiết bị không hỗ trợ xác thực sinh trắc học");
      return false;
    }

    // Kiểm tra người dùng đã cấu hình Face ID/Touch ID chưa
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      console.log(
        "Người dùng chưa cấu hình xác thực sinh trắc học trên thiết bị"
      );
      return false;
    }

    // Kiểm tra xem người dùng đã bật Face ID trong ứng dụng chưa
    const faceIDEnabledString = await AsyncStorage.getItem("faceIDEnabled");
    const faceIDEnabled = faceIDEnabledString === "true";
    if (!faceIDEnabled) {
      console.log("Face ID chưa được bật trong ứng dụng");
      return false;
    }

    // Thực hiện xác thực
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      fallbackLabel: "Sử dụng mã PIN",
      cancelLabel: "Hủy",
      disableDeviceFallback: false,
    });

    return result.success;
  } catch (error) {
    console.error("Lỗi xác thực Face ID:", error);
    return false;
  }
};

export default {
  loginUser: login,
  register,
  loginWithGoogle,
  loginWithFacebook,
  forgotPassword,
  resetPassword,
  logout,
  getUserData,
  canLoginWithBiometrics,
  loginWithBiometrics,
  isAuthenticated,
  authenticateWithFaceID,
};
