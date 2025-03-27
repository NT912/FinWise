import React, { useState, useEffect } from "react";
import { View, Text, Alert, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FaceIDSetupProps {
  onToggle: (enabled: boolean) => void;
}

const FaceIDSetup: React.FC<FaceIDSetupProps> = ({ onToggle }) => {
  const [isFaceIDAvailable, setIsFaceIDAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkDeviceForBiometrics();
  }, []);

  const checkDeviceForBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();

      if (hasHardware) {
        const supportedTypes =
          await LocalAuthentication.supportedAuthenticationTypesAsync();
        // FaceID type constant is 2 in expo-local-authentication
        const isFaceIDSupported = supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        );

        setIsFaceIDAvailable(isFaceIDSupported);

        if (!isFaceIDSupported && Platform.OS === "ios") {
          Alert.alert(
            "Face ID Not Available",
            "Your device doesn't support Face ID. Please use a device with Face ID capability."
          );
        }
      } else {
        setIsFaceIDAvailable(false);
        Alert.alert(
          "Biometric Authentication Unavailable",
          "Your device doesn't support biometric authentication."
        );
      }
    } catch (error) {
      console.error("Error checking biometric availability:", error);
      setIsFaceIDAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!isFaceIDAvailable && (
        <View style={styles.warningContainer}>
          <Ionicons
            name="alert-circle"
            size={24}
            color="#FF9800"
            style={styles.warningIcon}
          />
          <Text style={styles.warningText}>
            Face ID is not available on this device. Please use a device with
            Face ID capability.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  warningIcon: {
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#F57C00",
    lineHeight: 20,
  },
});

export default FaceIDSetup;
