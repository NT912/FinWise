import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { forgotPassword } from "../../services/authService";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/AppNavigator";

type ForgotPasswordNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ForgotPassword"
>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Nhập email, Step 2: Nhập mã xác nhận

  // Gửi mã xác nhận đến email
  const handleSendCode = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email!");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      Alert.alert(
        "Success",
        "The confirmation code has been sent to your email."
      );
      setStep(2);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Xác thực mã OTP và truyền mã sang màn hình Reset Password
  const handleVerifyCode = () => {
    if (!verificationCode) {
      Alert.alert("Error", "Please enter the confirmation code.");
      return;
    }

    navigation.navigate("ResetPassword", {
      email,
      resetCode: verificationCode,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>
            {step === 1 ? "Forgot password?" : "Enter confirmation code"}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Enter your email to receive the confirmation code."
              : "Enter the confirmation code that was sent to your email."}
          </Text>

          {step === 1 ? (
            <TextInput
              placeholder="Enter your email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <TextInput
              placeholder="Enter confirmation code"
              style={styles.input}
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="default"
              maxLength={6}
            />
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={step === 1 ? handleSendCode : handleVerifyCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {step === 1 ? "Send confirmation code" : "Confirm code"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.backToLogin}
          >
            <Text style={styles.backToLoginText}>Back to login</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", backgroundColor: "#E3FFF8" },
  innerContainer: { paddingHorizontal: 20, alignItems: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#00D09E",
  },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 20 },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#00D09E",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 16 },
  backToLogin: { marginTop: 20 },
  backToLoginText: { fontSize: 16, color: "#00D09E" },
});
