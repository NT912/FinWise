import React, { useEffect, useState, ErrorInfo } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  checkServerConnection,
  updateApiUrl,
  clearStoredUrl,
  checkCurrentToken,
} from "./src/services/apiService";
import { LogBox, Platform, Alert } from "react-native";
import NetworkStatusMonitor from "./src/components/NetworkStatusMonitor";
import AlertProvider from "./src/components/common/AlertProvider";
import api from "./src/services/apiService";

// Bỏ qua một số warning không cần thiết
LogBox.ignoreLogs([
  "ViewPropTypes will be removed from React Native",
  "AsyncStorage has been extracted from react-native",
  "Sending `onAnimatedValueUpdate` with no listeners registered",
  // Thêm lỗi phiên đăng nhập để ngăn nó hiển thị
  "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
]);

// Đặt global error handler để ngăn chặn lỗi không mong muốn
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out specific error messages
  const errorMessage = args[0]?.toString() || "";

  if (
    errorMessage.includes("Phiên đăng nhập hết hạn hoặc không hợp lệ") ||
    errorMessage.includes("Login error") ||
    (args[0] === "Login error:" && args[1]?.response?.status === 401)
  ) {
    // Chỉ ghi log cho mục đích debug, không hiển thị trên UI
    return;
  }

  // Chuyển tiếp các lỗi khác đến hàm console.error gốc
  originalConsoleError(...args);
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requireLogin, setRequireLogin] = useState(false); // Mặc định không yêu cầu đăng nhập lại

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🚀 Ứng dụng khởi động - Kiểm tra kết nối server");

        // Xóa URL cũ nếu có
        await clearStoredUrl();

        // Chỉ xóa token nếu requireLogin = true
        if (requireLogin) {
          console.log("🔒 Đã kích hoạt chính sách đăng nhập bắt buộc");
          await AsyncStorage.removeItem("token");
          setIsAuthenticated(false);
        }

        let serverConnected = await checkServerConnection();

        if (!serverConnected) {
          console.log("🔄 Kết nối server thất bại - Thử URL thay thế");

          // Danh sách các URL thay thế dựa trên platform
          const fallbackUrls =
            Platform.OS === "ios"
              ? [
                  "http://localhost:3002",
                  "http://127.0.0.1:3002",
                  "http://192.168.1.4:3002", // IP đã được xác định là hoạt động
                ]
              : [
                  "http://10.0.2.2:3002",
                  "http://192.168.1.4:3002", // IP đã được xác định là hoạt động
                ];

          let connected = false;

          // Thử từng URL thay thế
          for (const url of fallbackUrls) {
            console.log(`🔄 Đang thử kết nối đến: ${url}`);
            const updated = await updateApiUrl(url);
            if (updated) {
              console.log(`✅ Kết nối thành công đến: ${url}`);
              connected = true;
              break;
            }
          }

          if (!connected) {
            Alert.alert(
              "Lỗi Kết Nối",
              "Không thể kết nối đến máy chủ. Vui lòng kiểm tra:\n\n" +
                "1. Server đã được khởi động\n" +
                "2. Port 3002 không bị chặn\n" +
                "3. Kết nối mạng hoạt động\n\n" +
                "Ứng dụng sẽ tiếp tục nhưng một số tính năng có thể không hoạt động.",
              [{ text: "OK" }]
            );
          }
        }

        if (!requireLogin) {
          // Kiểm tra token chỉ khi không yêu cầu đăng nhập lại
          const hasToken = await checkCurrentToken();
          if (hasToken) {
            console.log(
              "✅ Token đã được tìm thấy:",
              (await AsyncStorage.getItem("token"))?.substring(0, 15) + "..."
            );

            // Kiểm tra xem token còn hợp lệ không
            try {
              // Sử dụng api instance với baseURL đã được thiết lập
              const token = await AsyncStorage.getItem("token");
              const response = await api.get("/api/user/validate-token", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.status === 200) {
                console.log("✅ Token xác thực thành công");
                setIsAuthenticated(true);
              } else {
                console.log("⚠️ Token không hợp lệ, xóa token");
                await AsyncStorage.removeItem("token");
                setIsAuthenticated(false);
              }
            } catch (error: any) {
              console.log("⚠️ Lỗi khi xác thực token:", error.message);

              // Nếu lỗi 401, xóa token và đánh dấu là chưa xác thực
              if (error.response && error.response.status === 401) {
                console.log("🔑 Lỗi 401 Unauthorized, xóa token");
                await AsyncStorage.removeItem("token");
                setIsAuthenticated(false);
              } else {
                // Lỗi khác (có thể là lỗi mạng), giả định token vẫn hợp lệ
                console.log(
                  "ℹ️ Giả định token vẫn hợp lệ để tránh gián đoạn UX"
                );
                setIsAuthenticated(true);
              }
            }
          } else {
            console.log("ℹ️ Chưa đăng nhập");
            setIsAuthenticated(false);
          }
        }
      } catch (error: any) {
        console.error("❌ Lỗi khởi tạo ứng dụng:", error.message);
        Alert.alert(
          "Lỗi Khởi Động",
          "Có lỗi xảy ra khi khởi động ứng dụng. Một số tính năng có thể bị hạn chế.",
          [{ text: "OK" }]
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [requireLogin]);

  if (isLoading) {
    return null;
  }

  return (
    <AlertProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <NavigationContainer>
          <NetworkStatusMonitor />
          <AppNavigator
            initialAuthenticated={isAuthenticated}
            forceLogin={requireLogin}
          />
        </NavigationContainer>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
