import api from "./apiService";

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
    const response = await api.post("/user/profile/enable-faceid", { enable });
    return response.data;
  } catch (error) {
    console.error("Error toggling Face ID:", error);
    throw error;
  }
};

// Cập nhật cài đặt thông báo
export const updateNotificationSettings = async (settings: {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
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
    const response = await api.delete("/user/profile/delete", {
      data: { password },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};
