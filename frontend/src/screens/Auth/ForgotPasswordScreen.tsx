import React, { useState } from "react";
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
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { forgotPassword } from "../../services/authService";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { showError } from "../../services/alertService";

type ForgotPasswordScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNextStep = async () => {
    if (!email) {
      showError("Missing Email", "Please enter your email address.", {
        duration: 3000,
      });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Invalid Email", "Please enter a valid email address.", {
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      navigation.navigate("SecurityPin", { email });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      showError(
        "Reset Failed",
        error.response?.data?.message ||
          "Failed to send verification code. Please try again later.",
        { duration: 3000 }
      );
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.greenBackground}>
          <Text style={styles.headerText}>Forgot Password</Text>
        </View>

        <View style={styles.whiteContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>Reset Password?</Text>
            <Text style={styles.description}>
              Enter your email address below to reset your password. We'll send
              you an email with instructions.
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter Email Address"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.nextButton, loading && styles.disabledButton]}
              onPress={handleNextStep}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.nextButtonText}>Next Step</Text>
              )}
            </TouchableOpacity>

            <View style={styles.socialContainer}>
              <Text style={styles.orText}>or sign up with</Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require("../../../assets/facebook-logo.png")}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require("../../../assets/google-logo.png")}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  greenBackground: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 48,
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: "#E8F8F2",
    borderRadius: 12,
    marginBottom: 40,
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000000",
  },
  nextButton: {
    backgroundColor: "#00D09E",
    borderRadius: 25,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00D09E",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 40,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
  },
  signUpText: {
    color: "#666666",
    fontSize: 14,
  },
  signUpLink: {
    color: "#00D09E",
    fontSize: 14,
    fontWeight: "600",
  },
  socialContainer: {
    marginTop: 20,
    marginBottom: 100,
  },
  orText: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default ForgotPasswordScreen;
