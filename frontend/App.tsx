import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import CustomStatusBar from "./src/components/StatusBar";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import NetworkStatusMonitor from "./src/components/NetworkStatusMonitor";
import AlertProvider from "./src/components/common/AlertProvider";
import { ToastProvider } from "./src/contexts/ToastContext";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_300Light,
} from "@expo-google-fonts/roboto";

const App = () => {
  const [fontsLoaded] = useFonts({
    "Roboto-Regular": Roboto_400Regular,
    "Roboto-Medium": Roboto_500Medium,
    "Roboto-Bold": Roboto_700Bold,
    "Roboto-Light": Roboto_300Light,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00875F" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <CustomStatusBar />
      <AlertProvider>
        <ToastProvider>
          <NavigationContainer>
            <NetworkStatusMonitor />
            <AppNavigator initialRouteName="Login" />
          </NavigationContainer>
        </ToastProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});

export default App;
