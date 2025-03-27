import api, { enhancedDelete } from "./apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Lấy thông tin profile người dùng
export const getUserProfile = async () => {
  try {
    const response = await api.get("/user/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Cập nhật thông tin profile
export const updateUserProfile = async (profileData: any) => {
  try {
    const response = await api.put("/user/profile/update", profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Thay đổi mật khẩu
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  verificationMethod?: string;
  verificationCode?: string;
}) => {
  try {
    const response = await api.post("/user/profile/change-password", data);
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

// Gửi mã xác nhận đổi mật khẩu qua email
export const sendPasswordChangeCode = async () => {
  try {
    const response = await api.post("/user/profile/send-password-change-code");
    return response.data;
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw error;
  }
};

// Bật/tắt Face ID
export const toggleFaceID = async (enable: boolean) => {
  try {
    // Gọi API để cập nhật trạng thái Face ID trên server
    const response = await api.post("/user/profile/enable-faceid", { enable });

    // Lưu trạng thái Face ID vào AsyncStorage
    await AsyncStorage.setItem("faceIDEnabled", enable.toString());

    // Nếu tắt Face ID, xóa thông tin đăng nhập đã lưu
    if (!enable) {
      await AsyncStorage.removeItem("securedEmail");
      await AsyncStorage.removeItem("securedPassword");
    }

    return response.data;
  } catch (error) {
    console.error("Error toggling Face ID:", error);
    throw error;
  }
};

// Cập nhật cài đặt thông báo
export const updateNotificationSettings = async (settings: {
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  budgetAlerts?: boolean;
  goalAlerts?: boolean;
}) => {
  try {
    const response = await api.put("/user/profile/notifications", settings);
    return response.data;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
};

// Upload avatar
export const uploadAvatar = async (formData: FormData) => {
  try {
    const response = await api.post("/user/profile/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
};

// Xóa tài khoản
export const deleteAccount = async (password: string) => {
  try {
    console.log("🚨 Đang cố gắng xóa tài khoản...");

    // Sử dụng enhancedDelete thay vì api.delete
    const response = await enhancedDelete("/user/profile/delete", { password });

    console.log("✅ Xóa tài khoản thành công:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa tài khoản:", error);
    throw error;
  }
};
