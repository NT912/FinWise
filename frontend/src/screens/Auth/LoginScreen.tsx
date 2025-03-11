import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import * as LocalAuthentication from "expo-local-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";
import {
  loginUser,
  loginWithGoogle,
  loginWithFacebook,
} from "../../services/authService";
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  FACEBOOK_APP_ID,
} from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  // Google OAuth configuration
  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useAuthRequest({
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
    });

  // Facebook OAuth configuration
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
  });

  useEffect(() => {
    checkBiometricAvailability();
    handleGoogleSignIn();
    handleFacebookSignIn();
  }, [googleResponse, fbResponse]);

  useEffect(() => {
    if (fbResponse?.type === "success") {
      const { access_token } = fbResponse.params;
      handleFacebookLogin(access_token);
    }
  }, [fbResponse]);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricAvailable(compatible && enrolled);
  };

  // Handle normal login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(email, password);

      if (response.success) {
        // Token đã được lưu trong loginUser function
        navigation.replace("MainApp"); // Sử dụng replace thay vì navigate
      } else {
        Alert.alert("Error", response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || error?.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    if (googleResponse?.type === "success" && googleResponse.authentication) {
      const { accessToken } = googleResponse.authentication;
      handleGoogleSuccess(accessToken);
    }
  };

  const handleGoogleSuccess = async (token: string) => {
    try {
      const serverToken = await loginWithGoogle(token);
      await AsyncStorage.setItem("token", serverToken);
      navigation.navigate("MainApp");
    } catch (error) {
      Alert.alert("Error", "Google sign in failed");
    }
  };

  // Handle Facebook Sign In
  const handleFacebookSignIn = async () => {
    if (fbResponse?.type === "success") {
      const { access_token } = fbResponse.params;
      handleFacebookLogin(access_token);
    }
  };

  // Handle Facebook Login
  const handleFacebookLogin = async (access_token: string) => {
    try {
      const serverToken = await loginWithFacebook(access_token);
      await AsyncStorage.setItem("token", serverToken);
      navigation.navigate("MainApp");
    } catch (error) {
      Alert.alert("Error", "Facebook sign in failed");
    }
  };

  // Handle Biometric Auth
  const handleBiometricAuth = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate with biometrics",
      fallbackLabel: "Use password",
    });

    if (result.success) {
      // Implement your biometric login logic here
      navigation.navigate("MainApp");
    }
  };

  console.log(
    "Facebook Redirect URI:",
    AuthSession.makeRedirectUri({
      scheme: "finwise",
      path: "facebook-auth",
    })
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Welcome to FinWise</Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.authRow}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>

            {isBiometricAvailable && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricAuth}
              >
                <Image
                  source={require("../../../assets/biometric-icon.png")}
                  style={styles.icon}
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={() => googlePromptAsync()}
            disabled={loading}
          >
            <Image
              source={require("../../../assets/google-logo.png")}
              style={styles.icon}
            />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.facebookButton]}
            onPress={() => fbPromptAsync()}
            disabled={loading}
          >
            <Image
              source={require("../../../assets/facebook-logo.png")}
              style={styles.icon}
            />
            <Text style={[styles.socialText, { color: "white" }]}>
              Continue with Facebook
            </Text>
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

// 🖌️ Thiết lập CSS
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E3FFF8",
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
    height: 50,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  authRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  loginButton: {
    backgroundColor: "#00C897",
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginTop: 10,
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  biometricButton: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
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
  facebookButton: {
    backgroundColor: "#1877F2",
  },
  socialText: {
    color: "#333",
    fontSize: 16,
    marginLeft: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 30,
    alignItems: "center",
    width: "100%",
  },
  linkText: {
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 15,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
  },
});
