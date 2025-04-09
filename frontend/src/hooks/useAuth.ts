import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as loginApi } from "../services/authService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useAuth = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await loginApi({ email, password });

      if (response.success && response.token) {
        navigation.replace("TabNavigator");
        return { success: true };
      }

      // Nếu không thành công, lấy thông báo lỗi từ response
      const errorMessage =
        response.message || "Login failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } catch (err: any) {
      // Trường hợp này hiếm khi xảy ra vì loginApi đã xử lý hầu hết các lỗi
      const errorMessage = "An unexpected error occurred. Please try again.";
      console.error("Unexpected login error:", err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
  };
};

export default useAuth;
