import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import useBiometricAuth from "../../hooks/useBiometricAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface BiometricAuthGateProps {
  children: React.ReactNode;
}

const BiometricAuthGate: React.FC<BiometricAuthGateProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const {
    isBiometricAvailable,
    isBiometricEnabled,
    authenticateWithBiometrics,
    loading,
  } = useBiometricAuth();

  useEffect(() => {
    checkIfNeedsAuthentication();
  }, []);

  const checkIfNeedsAuthentication = async () => {
    try {
      const appUnlocked = await AsyncStorage.getItem("appUnlocked");

      // Nếu app đã được mở khóa trong phiên này, không cần xác thực lại
      if (appUnlocked === "true") {
        setIsAuthenticated(true);
        return;
      }

      // Chỉ hiển thị dialog xác thực nếu Face ID được bật trong ứng dụng
      if (isBiometricEnabled && !loading) {
        setShowAuthPrompt(true);
      } else {
        // Không yêu cầu Face ID, cho phép truy cập
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error checking authentication state:", error);
      // Trong trường hợp lỗi, cho phép truy cập không cần xác thực
      setIsAuthenticated(true);
    }
  };

  const handleAuthenticate = async () => {
    const success = await authenticateWithBiometrics();

    if (success) {
      await AsyncStorage.setItem("appUnlocked", "true");
      setIsAuthenticated(true);
      setShowAuthPrompt(false);
    } else {
      Alert.alert(
        "Authentication Failed",
        "Face ID authentication failed. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleSkipAuthentication = async () => {
    // Cho phép bỏ qua xác thực, ví dụ trong trường hợp khẩn cấp hoặc khi có vấn đề với Face ID
    await AsyncStorage.setItem("appUnlocked", "true");
    setIsAuthenticated(true);
    setShowAuthPrompt(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Modal visible={showAuthPrompt} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.authContainer}>
            <Text style={styles.title}>Authenticate with Face ID</Text>

            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="face-recognition"
                size={80}
                color="#00C897"
              />
            </View>

            <Text style={styles.description}>
              Please authenticate with Face ID to access the app
            </Text>

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuthenticate}
            >
              <Text style={styles.buttonText}>Authenticate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipAuthentication}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Đã xác thực hoặc không yêu cầu xác thực
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 18,
    color: "#00C897",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  authContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  iconContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: "rgba(0, 200, 151, 0.1)",
    borderRadius: 50,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  authButton: {
    backgroundColor: "#00C897",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipButton: {
    padding: 10,
    width: "100%",
    alignItems: "center",
  },
  skipButtonText: {
    color: "#999",
    fontSize: 14,
  },
});

export default BiometricAuthGate;
