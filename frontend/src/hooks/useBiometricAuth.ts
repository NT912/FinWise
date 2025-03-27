import { useState, useEffect } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UseBiometricAuthResult {
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  authenticateWithBiometrics: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const useBiometricAuth = (): UseBiometricAuthResult => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      setLoading(true);

      // Kiểm tra thiết bị có hỗ trợ sinh trắc học không
      const hasHardware = await LocalAuthentication.hasHardwareAsync();

      if (!hasHardware) {
        setIsBiometricAvailable(false);
        setError("Device does not support biometric authentication");
        return;
      }

      // Kiểm tra người dùng đã cấu hình Face ID/Touch ID chưa
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!isEnrolled) {
        setIsBiometricAvailable(false);
        setError("Biometric authentication is not set up on this device");
        return;
      }

      // Kiểm tra Face ID được hỗ trợ trên thiết bị iOS
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      const supportsFaceID = supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      );

      if (!supportsFaceID) {
        setIsBiometricAvailable(false);
        setError("Face ID is not available on this device");
        return;
      }

      setIsBiometricAvailable(true);

      // Kiểm tra xem người dùng đã bật Face ID trong ứng dụng chưa
      const faceIDEnabledString = await AsyncStorage.getItem("faceIDEnabled");
      const faceIDEnabled = faceIDEnabledString === "true";
      setIsBiometricEnabled(faceIDEnabled);
    } catch (err) {
      console.error("Error checking biometric availability:", err);
      setError("Failed to check biometric availability");
      setIsBiometricAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      if (!isBiometricAvailable) {
        setError("Biometric authentication is not available");
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with Face ID",
        fallbackLabel: "Use passcode",
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Authentication failed");
      return false;
    }
  };

  return {
    isBiometricAvailable,
    isBiometricEnabled,
    authenticateWithBiometrics,
    loading,
    error,
  };
};

export default useBiometricAuth;
