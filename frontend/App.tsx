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
  initializeApi,
  saveApiUrl,
} from "./src/services/apiService";
import { LogBox, Platform, Alert, View, Text } from "react-native";
import NetworkStatusMonitor from "./src/components/NetworkStatusMonitor";
import AlertProvider from "./src/components/common/AlertProvider";
import ToastProvider from "./src/components/ToastProvider";
import api from "./src/services/apiService";
import { loadFonts } from "./src/utils/loadFonts";
import * as SplashScreen from "expo-splash-screen";
import { RootStackParamList } from "./src/navigation/AppNavigator";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_300Light,
} from "@expo-google-fonts/roboto";

// Bỏ qua một số cảnh báo không cần thiết
LogBox.ignoreLogs([
  "Warning: componentWillReceiveProps",
  "Warning: componentWillMount",
  "source.uri should not be an empty string",
  "Cannot update a component from inside",
  "fontFamily Roboto", // Bỏ qua các cảnh báo về font Roboto
  "Font ", // Bỏ qua các cảnh báo liên quan đến font
  "Registering 'Roboto", // Bỏ qua các cảnh báo từ việc đăng ký font
]);

// Giữ màn hình splash hiển thị cho đến khi sẵn sàng
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Màn hình splash có thể đã bị ẩn, không cần xử lý lỗi */
});

const App = () => {
  // Sử dụng useFonts hook từ expo-google-fonts
  const [fontsLoaded] = useFonts({
    "Roboto-Regular": Roboto_400Regular,
    "Roboto-Medium": Roboto_500Medium,
    "Roboto-Bold": Roboto_700Bold,
    "Roboto-Light": Roboto_300Light,
  });

  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>("Login");
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Khởi tạo API client
        await initializeApi();

        // Kiểm tra kết nối server
        const isConnected = await checkServerConnection();
        console.log("✅ Kết nối server:", isConnected);

        // Kiểm tra token để xác định màn hình khởi đầu
        const hasToken = await checkCurrentToken();
        if (hasToken) {
          setInitialRoute("TabNavigator");
        }

        setIsReady(true);
      } catch (e) {
        console.warn("⚠️ Lỗi khi khởi tạo ứng dụng:", e);
        setIsReady(true); // Vẫn đặt là sẵn sàng để người dùng có thể thao tác
      } finally {
        // Ẩn màn hình splash khi đã sẵn sàng
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
        }
      }
    }

    if (fontsLoaded) {
      prepare();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Ẩn màn hình splash khi fonts đã tải xong
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch((err) => {
        console.log("Không thể ẩn splash screen:", err);
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || !isReady) {
    // Tiếp tục hiển thị splash screen cho đến khi ứng dụng sẵn sàng
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AlertProvider>
        <ToastProvider>
          <NavigationContainer>
            <NetworkStatusMonitor />
            <AppNavigator initialRouteName={initialRoute} />
          </NavigationContainer>
        </ToastProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
};

export default App;
