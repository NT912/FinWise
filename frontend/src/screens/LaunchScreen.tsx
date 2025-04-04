import React, { useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Định nghĩa kiểu navigation
type NavigationProp = StackNavigationProp<RootStackParamList, "Launch">;

export default function LaunchScreen() {
  const navigation = useNavigation<NavigationProp>();
  console.log("LaunchScreen rendered"); // Thêm log để debug

  // Tạo animation cho logo
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    console.log("LaunchScreen useEffect running"); // Thêm log để debug

    // Chạy animation khi màn hình load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // Kiểm tra token xác thực
    const checkAuthAndNavigate = async () => {
      try {
        console.log("Checking authentication status...");
        const token = await AsyncStorage.getItem("token");

        // Đợi animation kết thúc (khoảng 2 giây) rồi mới chuyển màn hình
        setTimeout(() => {
          if (token) {
            console.log("Token found, navigating to MainApp");
            navigation.replace("MainApp");
          } else {
            console.log("No token found, navigating to Login");
            navigation.replace("Login");
          }
        }, 2000);
      } catch (error) {
        console.error("Error checking authentication:", error);
        // Nếu có lỗi, mặc định chuyển về màn hình đăng nhập
        setTimeout(() => {
          navigation.replace("Login");
        }, 2000);
      }
    };

    checkAuthAndNavigate();

    // Không cần cleanup timer vì chúng ta đã dùng setTimeout trong hàm async
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../../assets/logo.png")}
        style={[
          styles.logo,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      />
      <Text style={styles.title}>Welcome to FinWise</Text>
      <Text style={styles.copyright}>© 2025 NhaTruong</Text>
    </View>
  );
}

// 📌 StyleSheet cập nhật với logo lớn hơn và hiệu ứng animation đẹp hơn
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E3FFF8",
  },
  logo: { width: 150, height: 150, marginBottom: 20 }, // Logo lớn hơn
  title: { fontSize: 24, fontWeight: "bold", color: "#00C897" },
  copyright: { position: "absolute", bottom: 30, fontSize: 12, color: "#666" },
});
