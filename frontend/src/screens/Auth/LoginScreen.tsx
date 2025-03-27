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
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";
import {
  login,
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

  // Handle Google and Facebook responses when they change
  useEffect(() => {
    const initializeAuth = async () => {
      // Handle Google and Facebook responses only when they change
      if (googleResponse?.type === "success" && googleResponse.authentication) {
        const { accessToken } = googleResponse.authentication;
        handleGoogleSuccess(accessToken);
      }

      if (fbResponse?.type === "success") {
        const { access_token } = fbResponse.params;
        handleFacebookLogin(access_token);
      }
    };

    initializeAuth();
  }, [googleResponse, fbResponse]);

  // Login handling function
  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Warning", "Please fill in all fields");
        return;
      }

      setLoading(true);
      console.log("Attempting login with email and password...");

      const response = await login({ email, password });
      console.log("Login API response received");

      if (response.token) {
        console.log("Login successful, saving token for this session only");
        await AsyncStorage.setItem("token", response.token);
        console.log("Navigating to MainApp");
        navigation.replace("MainApp");
      }
    } catch (error: any) {
      console.error("Login error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = "Login failed. Please check your credentials.";

      if (error.response?.status === 401) {
        errorMessage = "Email or password is incorrect.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Success
  const handleGoogleSuccess = async (token: string) => {
    try {
      console.log("Google sign in successful, getting server token");
      const serverToken = await loginWithGoogle(token);
      console.log("Server token received, saving for this session only");
      await AsyncStorage.setItem("token", serverToken);
      console.log("Navigating to MainApp");
      navigation.replace("MainApp");
    } catch (error) {
      console.error("Google sign in error:", error);
      Alert.alert("Error", "Google sign in failed");
    }
  };

  // Handle Facebook Login
  const handleFacebookLogin = async (access_token: string) => {
    try {
      console.log("Facebook sign in successful, getting server token");
      const serverToken = await loginWithFacebook(access_token);
      console.log("Server token received, saving for this session only");
      await AsyncStorage.setItem("token", serverToken);
      console.log("Navigating to MainApp");
      navigation.replace("MainApp");
    } catch (error) {
      console.error("Facebook sign in error:", error);
      Alert.alert("Error", "Facebook sign in failed");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>

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

              <View style={styles.registerContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text style={styles.linkText}>
                    Don't have an account? Register now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 🖌️ Thiết lập CSS
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E3FFF8",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E3FFF8",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
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
  loginButton: {
    backgroundColor: "#00C897",
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
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
  registerContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 30,
  },
  linkText: {
    fontSize: 16,
    color: "#007AFF",
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
