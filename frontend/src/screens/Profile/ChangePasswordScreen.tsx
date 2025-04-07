import React, { useState, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  changePassword,
  sendPasswordChangeCode,
} from "../../services/profileService";
import commonProfileStyles from "../../styles/profile/commonProfileStyles";
import LoadingIndicator from "../../components/LoadingIndicator";

enum VerificationMethod {
  PASSWORD = "password",
  EMAIL = "email",
}

enum PasswordStrength {
  WEAK = "weak",
  MEDIUM = "medium",
  STRONG = "strong",
}

const ChangePasswordScreen = ({ navigation }: { navigation: any }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationMethod, setVerificationMethod] =
    useState<VerificationMethod>(VerificationMethod.PASSWORD);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(
    PasswordStrength.WEAK
  );
  const [countdown, setCountdown] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    // Animate the form appearance
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
  }, []);

  useEffect(() => {
    // Handle countdown for resending verification code
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    // Check password strength
    if (newPassword.length === 0) {
      setPasswordStrength(PasswordStrength.WEAK);
    } else if (newPassword.length < 8) {
      setPasswordStrength(PasswordStrength.WEAK);
    } else if (
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        newPassword
      )
    ) {
      setPasswordStrength(PasswordStrength.STRONG);
    } else {
      setPasswordStrength(PasswordStrength.MEDIUM);
    }
  }, [newPassword]);

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case PasswordStrength.STRONG:
        return "#00D09E";
      case PasswordStrength.MEDIUM:
        return "#FFB74D";
      case PasswordStrength.WEAK:
      default:
        return "#FF6B6B";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case PasswordStrength.STRONG:
        return "Strong password";
      case PasswordStrength.MEDIUM:
        return "Medium strength - add special characters";
      case PasswordStrength.WEAK:
      default:
        return "Weak password - minimum 8 characters";
    }
  };

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleSendVerificationCode = async () => {
    try {
      setLoading(true);
      await sendPasswordChangeCode();
      setCodeSent(true);
      setCountdown(60); // 60 seconds countdown
      Alert.alert("Success", "Verification code sent to your email");
    } catch (error) {
      Alert.alert("Error", "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Kiểm tra mật khẩu mới
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please enter new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    // Kiểm tra phương thức xác thực
    if (
      verificationMethod === VerificationMethod.PASSWORD &&
      !currentPassword
    ) {
      Alert.alert("Error", "Please enter current password");
      return;
    }

    if (verificationMethod === VerificationMethod.EMAIL && !verificationCode) {
      Alert.alert("Error", "Please enter verification code");
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        currentPassword:
          verificationMethod === VerificationMethod.PASSWORD
            ? currentPassword
            : "",
        newPassword,
        verificationMethod,
        verificationCode:
          verificationMethod === VerificationMethod.EMAIL
            ? verificationCode
            : "",
      });
      Alert.alert("Success", "Password changed successfully");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !codeSent) {
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
            Change Password
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#00D09E"]}
              tintColor="#00D09E"
            />
          }
        >
          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Verification Method Selector */}
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionTitle}>Verification Method</Text>

              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    verificationMethod === VerificationMethod.PASSWORD &&
                      styles.activeTab,
                  ]}
                  onPress={() =>
                    setVerificationMethod(VerificationMethod.PASSWORD)
                  }
                >
                  <Ionicons
                    name="lock-closed"
                    size={18}
                    color={
                      verificationMethod === VerificationMethod.PASSWORD
                        ? "#00D09E"
                        : "#888"
                    }
                  />
                  <Text
                    style={[
                      styles.tabText,
                      verificationMethod === VerificationMethod.PASSWORD &&
                        styles.activeTabText,
                    ]}
                  >
                    Current Password
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tab,
                    verificationMethod === VerificationMethod.EMAIL &&
                      styles.activeTab,
                  ]}
                  onPress={() =>
                    setVerificationMethod(VerificationMethod.EMAIL)
                  }
                >
                  <Ionicons
                    name="mail"
                    size={18}
                    color={
                      verificationMethod === VerificationMethod.EMAIL
                        ? "#00D09E"
                        : "#888"
                    }
                  />
                  <Text
                    style={[
                      styles.tabText,
                      verificationMethod === VerificationMethod.EMAIL &&
                        styles.activeTabText,
                    ]}
                  >
                    Email Verification
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Current Password Field */}
            {verificationMethod === VerificationMethod.PASSWORD && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#888"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter your current password"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            )}

            {/* Email Verification */}
            {verificationMethod === VerificationMethod.EMAIL && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Verification Code</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="key-outline"
                    size={20}
                    color="#888"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.verificationButton,
                    (countdown > 0 || loading) && { opacity: 0.6 },
                  ]}
                  onPress={handleSendVerificationCode}
                  disabled={countdown > 0 || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.verificationButtonText}>
                      {countdown > 0
                        ? `Resend Code (${countdown}s)`
                        : codeSent
                        ? "Resend Code"
                        : "Send Verification Code"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color="#888"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarContainer}>
                  <View
                    style={[
                      styles.strengthBar,
                      {
                        width:
                          passwordStrength === PasswordStrength.WEAK
                            ? "33%"
                            : passwordStrength === PasswordStrength.MEDIUM
                            ? "66%"
                            : "100%",
                        backgroundColor: getPasswordStrengthColor(),
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    { color: getPasswordStrengthColor() },
                  ]}
                >
                  {getPasswordStrengthText()}
                </Text>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#888"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#999"
                />
              </View>
              {confirmPassword.length > 0 &&
                newPassword !== confirmPassword && (
                  <Text style={styles.errorMessage}>Passwords don't match</Text>
                )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="#FFF" />
                  <Text style={styles.submitButtonText}>Update Password</Text>
                </>
              )}
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  formCard: {
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
  sectionWrapper: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#888",
    marginLeft: 8,
  },
  activeTabText: {
    color: "#00D09E",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    backgroundColor: "#F9F9F9",
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#333",
  },
  verificationButton: {
    backgroundColor: "#00D09E",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 12,
  },
  verificationButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: "#EEEEEE",
    borderRadius: 2,
    marginBottom: 6,
    overflow: "hidden",
  },
  strengthBar: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "500",
  },
  errorMessage: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: "#00D09E",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: 10,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});

export default ChangePasswordScreen;
