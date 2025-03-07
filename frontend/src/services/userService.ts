import api from "./apiService";

// Lấy thông tin user
export const fetchUserProfile = async () => {
  try {
    const response = await api.get("/profile");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cập nhật thông tin user
export const updateUserProfile = async (userData: any) => {
  try {
    const response = await api.put("/profile/update", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
