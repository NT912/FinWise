import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { resetPassword } from "../../services/authService";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation";
import { Ionicons   } from "react-native-vector-icons/Ionicons";
import { showSuccess, showError } from "../../services/alertService";

// Định nghĩa kiểu cho navigation
type ResetPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ResetPassword"
>;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute();
  const { email, resetCode } = route.params as {
    email?: string;
    resetCode?: string;
  };

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!email || !resetCode) {
      console.error("Missing required params:", { email, resetCode });
      showError(
        "Missing Information",
        "Required information is missing. Please try again.",
        {
          confirmText: "Go Back",
          onConfirm: () => navigation.replace("ForgotPassword"),
          showConfirmButton: true,
          showCancelButton: false,
        }
      );
    }
  }, [email, resetCode]);

  const handleResetPassword = async () => {
    // Validate inputs
    if (!newPassword || !confirmPassword) {
      showError(
        "Incomplete Information",
        "Please enter both password fields to continue.",
        { duration: 3000 }
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showError(
        "Passwords Don't Match",
        "Please make sure your passwords match and try again.",
        { duration: 3000 }
      );
      return;
    }

    if (newPassword.length < 6) {
      showError(
        "Password Too Short",
        "Your password must be at least 6 characters long.",
        { duration: 3000 }
      );
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email!, resetCode!, newPassword);

      showSuccess(
        "Success!",
        "Your password has been reset successfully. You can now log in with your new password.",
        {
          confirmText: "Log In",
          onConfirm: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
          showConfirmButton: true,
          showCancelButton: false,
        }
      );
    } catch (error: any) {
      console.error("Password reset error:", error);
      showError(
        "Reset Failed",
        error.response?.data?.message ||
          "Unable to reset password. Please try again later.",
        { duration: 3000 }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.greenBackground}>
          <Text style={styles.title}>New Password</Text>
        </View>

        <View style={styles.whiteContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidView}
            keyboardVerticalOffset={Platform.OS === "ios" ? -64 : 0}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      placeholder="Enter new password"
                      style={styles.input}
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Ionicons
                        name={
                          showNewPassword ? "eye-outline" : "eye-off-outline"
                        }
                        size={24}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm New Password</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      placeholder="Confirm new password"
                      style={styles.input}
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-outline"
                            : "eye-off-outline"
                        }
                        size={24}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Change Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  innerContainer: {
    flex: 1,
  },
  greenBackground: {
    height: "25%",
    backgroundColor: "#00D09E",
    justifyContent: "center",
    alignItems: "center",
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    paddingTop: 30,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    color: "#333",
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    padding: 8,
  },
  button: {
    backgroundColor: "#00D09E",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
