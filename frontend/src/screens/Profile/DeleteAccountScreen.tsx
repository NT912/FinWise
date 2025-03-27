import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
  Image,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteAccount } from "../../services/profileService";
import LoadingIndicator from "../../components/LoadingIndicator";
import commonProfileStyles from "../../styles/profile/commonProfileStyles";

const DeleteAccountScreen = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const warningIconAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for warning icon
    const pulseWarning = Animated.sequence([
      Animated.timing(warningIconAnim, {
        toValue: 1.2,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(warningIconAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulseWarning).start();
  }, []);

  useEffect(() => {
    // Check if button should be enabled
    setIsButtonEnabled(password.length > 0);
  }, [password]);

  const handleDeleteAccount = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter your password to confirm deletion");
      return;
    }

    Alert.alert(
      "Final Confirmation",
      "This will permanently delete your account and all associated data. This action CANNOT be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete My Account",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              console.log("Attempting to delete account...");

              // Add timeout to prevent hanging requests
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), 15000)
              );

              const deletePromise = deleteAccount(password);

              // Race between the delete request and the timeout
              await Promise.race([deletePromise, timeoutPromise]);

              // If successful, clear token and navigate
              await AsyncStorage.removeItem("token");
              console.log("Account deleted successfully, token removed");

              Alert.alert(
                "Account Deleted",
                "Your account has been successfully deleted",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: "Login" }],
                      });
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error("Error deleting account:", error);

              // Detailed error logging
              if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);

                // Show specific error message from server if available
                const errorMessage =
                  error.response.data?.message ||
                  "Failed to delete account. Please check your password and try again.";

                Alert.alert("Error", errorMessage);
              } else if (error.request) {
                // The request was made but no response was received
                console.error("No response received:", error.request);
                Alert.alert(
                  "Connection Error",
                  "No response from server. Please check your internet connection and try again."
                );
              } else if (error.message?.includes("timeout")) {
                // Request timed out
                Alert.alert(
                  "Request Timeout",
                  "The request took too long to complete. Please try again later."
                );
              } else {
                // Something happened in setting up the request that triggered an Error
                console.error("Error message:", error.message);
                Alert.alert(
                  "Error",
                  "An unexpected error occurred. Please try again later."
                );
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={commonProfileStyles.enhancedHeader}>
          <TouchableOpacity
            style={commonProfileStyles.enhancedBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={commonProfileStyles.enhancedHeaderTitle}>
            Delete Account
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View
            style={[
              styles.contentCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.warningHeader}>
              <Animated.View
                style={{
                  transform: [{ scale: warningIconAnim }],
                }}
              >
                <Ionicons name="warning" size={40} color="#FF6B6B" />
              </Animated.View>
              <Text style={styles.warningTitle}>Account Deletion</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.cautionBox}>
              <Text style={styles.cautionText}>
                This action is permanent and irreversible. All your data will be
                permanently deleted, including:
              </Text>

              <View style={styles.bulletPoints}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="cash-outline" size={20} color="#FF6B6B" />
                  <Text style={styles.bulletText}>
                    Your financial data and transaction history
                  </Text>
                </View>

                <View style={styles.bulletPoint}>
                  <Ionicons
                    name="pie-chart-outline"
                    size={20}
                    color="#FF6B6B"
                  />
                  <Text style={styles.bulletText}>
                    Budget plans and financial goals
                  </Text>
                </View>

                <View style={styles.bulletPoint}>
                  <Ionicons
                    name="analytics-outline"
                    size={20}
                    color="#FF6B6B"
                  />
                  <Text style={styles.bulletText}>
                    Insights and financial analytics
                  </Text>
                </View>

                <View style={styles.bulletPoint}>
                  <Ionicons name="person-outline" size={20} color="#FF6B6B" />
                  <Text style={styles.bulletText}>
                    Your profile and personal settings
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.passwordLabel}>
              Enter your password to confirm:
            </Text>
            <View style={styles.passwordInputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.passwordInput}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  !isButtonEnabled && styles.disabledButton,
                ]}
                onPress={handleDeleteAccount}
                disabled={!isButtonEnabled}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color="#FFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3FFF8",
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF6B6B",
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 16,
  },
  cautionBox: {
    backgroundColor: "#FFF4F4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cautionText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoints: {
    marginTop: 8,
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  bulletText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 10,
    flex: 1,
  },
  passwordLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    backgroundColor: "#F9F9F9",
    marginBottom: 20,
  },
  inputIcon: {
    marginLeft: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 2,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#FFADAD",
    opacity: 0.5,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default DeleteAccountScreen;
