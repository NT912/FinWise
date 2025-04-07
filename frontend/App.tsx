import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  checkServerConnection,
  tryFallbackConnections,
} from "./src/services/apiService";
import { LogBox } from "react-native";
import NetworkStatusMonitor from "./src/components/NetworkStatusMonitor";
import AlertProvider from "./src/components/common/AlertProvider";

// Bỏ qua một số warning không cần thiết
LogBox.ignoreLogs([
  "Sending `onAnimatedValueUpdate` with no listeners registered",
]);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra kết nối và token khi ứng dụng khởi động
    const initializeApp = async () => {
      try {
        // Làm sạch trạng thái lưu trữ trước đó khi khởi động ứng dụng
        console.log("🚀 Ứng dụng khởi động - Kiểm tra kết nối server");
        const serverConnected = await checkServerConnection();

        if (!serverConnected) {
          console.log("🔄 Kết nối server thất bại - Thử các kết nối dự phòng");
          await tryFallbackConnections();
        }

        // Kiểm tra token
        const token = await AsyncStorage.getItem("token");
        if (token) {
          console.log(
            "✅ Token đã được tìm thấy, đăng nhập tự động với token hiện tại:",
            token.substring(0, 15) + "..."
          );
        } else {
          console.warn("⚠️ Không tìm thấy token đăng nhập");
        }
      } catch (error) {
        console.error("❌ Lỗi khởi tạo ứng dụng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return null; // hoặc màn hình loading
  }

  return (
    <AlertProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <NetworkStatusMonitor />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
