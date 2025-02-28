import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  login,
  loginWithGoogle,
  loginWithFacebook,
} from "../services/apiService";

// Định nghĩa kiểu navigation
type NavigationProp = StackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      console.log("🟢 Sending login request:", { email, password });

      if (!email || !password) {
        Alert.alert("Error", "Email and password are required!");
        return;
      }

      const response = await login(email, password);
      console.log(response);
      navigation.replace("Home");
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : (error as any)?.response?.data?.error || "Login failed!";
      Alert.alert("Error", errMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.title}>Login to FinWise</Text>
          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
            <Image
              source={require("../../assets/google-logo.png")}
              style={styles.icon}
            />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.facebookButton]}
          >
            <Image
              source={require("../../assets/facebook-logo.png")}
              style={styles.icon}
            />
            <Text style={styles.socialText}>Continue with Facebook</Text>
          </TouchableOpacity>

          <View style={styles.bottomContainer}>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.linkText}>
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E3FFF8" },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#00C897",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  loginButton: {
    backgroundColor: "#00C897",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 16 },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    justifyContent: "center",
    marginTop: 10,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DD4B39",
    borderWidth: 1,
  },
  facebookButton: { backgroundColor: "#1877F2" },
  socialText: { color: "#333", fontSize: 16, marginLeft: 10 },
  icon: { width: 24, height: 24 },
  bottomContainer: {
    position: "absolute",
    bottom: 30,
    alignItems: "center",
    width: "100%",
  },
  linkText: { fontSize: 16, color: "#007AFF", marginBottom: 15 },
});
