import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  ScrollView,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { toggleFaceID, getUserProfile } from "../../services/profileService";
import FaceIDSetup from "../../components/profile/FaceIDSetup";
import LoadingIndicator from "../../components/LoadingIndicator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { saveSecureCredentials, getUserData } from "../../services/authService";
import commonProfileStyles from "../../styles/profile/commonProfileStyles";

const FaceIDScreen = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [faceIDEnabled, setFaceIDEnabled] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [userCredentials, setUserCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Fetch Face ID status and user credentials when component mounts
    const initializeData = async () => {
      try {
        const faceIDEnabledStr = await AsyncStorage.getItem("faceIDEnabled");
        setFaceIDEnabled(faceIDEnabledStr === "true");

        // Try to fetch saved credentials from AsyncStorage
        const savedEmail = await AsyncStorage.getItem("securedEmail");
        const savedPassword = await AsyncStorage.getItem("securedPassword");

        if (savedEmail && savedPassword) {
          setUserCredentials({
            email: savedEmail,
            password: savedPassword,
          });
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
  }, []);

  const authenticateWithFaceID = async () => {
    try {
      // Check if Face ID is enrolled on the device
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!isEnrolled) {
        Alert.alert(
          "Face ID Not Configured",
          "You haven't set up Face ID on this device. Please set up Face ID in your device settings first."
        );
        return false;
      }

      // Try to authenticate with Face ID
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable Face ID",
        fallbackLabel: "Use PIN",
        cancelLabel: "Cancel",
        disableDeviceFallback: false, // Enable device fallback options
      });

      if (result.success) {
        return true;
      } else if (result.error === "user_cancel") {
        console.log("User cancelled authentication");
        return false;
      } else {
        console.error("Authentication error:", result.error);
        Alert.alert(
          "Authentication Failed",
          "Could not authenticate with Face ID. Please try again."
        );
        return false;
      }
    } catch (error) {
      console.error("Authentication error:", error);
      Alert.alert(
        "Authentication Error",
        "An error occurred while authenticating with Face ID. Please try again later."
      );
      return false;
    }
  };

  const handleToggleFaceID = async () => {
    try {
      setLoading(true);

      if (!faceIDEnabled) {
        // Enabling Face ID
        const isAuthenticated = await authenticateWithFaceID();

        if (!isAuthenticated) {
          setLoading(false);
          return;
        }

        try {
          // Fetch current user data
          const userData = await getUserData();

          if (!userData || !userData.email) {
            Alert.alert(
              "Error",
              "Could not retrieve user information. Please log in again."
            );
            setLoading(false);
            return;
          }

          // Show confirmation dialog with email
          Alert.alert(
            "Confirm Face ID Setup",
            `You are enabling Face ID for account ${userData.email}. You need to provide your password to complete setup.`,
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => setLoading(false),
              },
              {
                text: "Continue",
                onPress: () => {
                  // Ask for password to confirm identity
                  Alert.prompt(
                    "Confirm Password",
                    "Please enter your password to enable Face ID:",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => setLoading(false),
                      },
                      {
                        text: "Confirm",
                        onPress: async (password) => {
                          if (!password) {
                            Alert.alert("Error", "Password cannot be empty");
                            setLoading(false);
                            return;
                          }

                          try {
                            const saved = await saveSecureCredentials({
                              email: userData.email,
                              password: password,
                            });

                            if (saved) {
                              await toggleFaceID(true);
                              await AsyncStorage.setItem(
                                "faceIDEnabled",
                                "true"
                              );
                              setFaceIDEnabled(true);
                              setUserCredentials({
                                email: userData.email,
                                password: password,
                              });

                              Alert.alert(
                                "Success",
                                "Face ID has been enabled. You can now use Face ID to log in."
                              );
                            } else {
                              Alert.alert(
                                "Error",
                                "Could not save login credentials. Please try again."
                              );
                            }
                          } catch (error) {
                            console.error("Error saving credentials:", error);
                            Alert.alert(
                              "Error",
                              "An error occurred while saving login credentials."
                            );
                          } finally {
                            setLoading(false);
                          }
                        },
                      },
                    ],
                    "secure-text"
                  );
                },
              },
            ]
          );
        } catch (error) {
          console.error("Error fetching user data:", error);
          Alert.alert(
            "Error",
            "Could not retrieve user information. Please try again later."
          );
          setLoading(false);
        }
      } else {
        // Disabling Face ID
        Alert.alert(
          "Disable Face ID",
          "Are you sure you want to disable Face ID?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setLoading(false),
            },
            {
              text: "Disable",
              style: "destructive",
              onPress: async () => {
                await toggleFaceID(false);
                await AsyncStorage.setItem("faceIDEnabled", "false");
                setFaceIDEnabled(false);
                setUserCredentials(null);
                setLoading(false);

                Alert.alert(
                  "Success",
                  "Face ID authentication has been disabled"
                );
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error toggling Face ID:", error);
      Alert.alert("Error", "Failed to update Face ID settings");
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await getUserProfile(); // Refresh user data silently

      // Also refresh Face ID status
      const faceIDEnabledStr = await AsyncStorage.getItem("faceIDEnabled");
      setFaceIDEnabled(faceIDEnabledStr === "true");
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={commonProfileStyles.enhancedHeader}>
        <TouchableOpacity
          style={commonProfileStyles.enhancedBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={commonProfileStyles.enhancedHeaderTitle}>Face ID</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00C897"]}
            tintColor="#00C897"
          />
        }
      >
        <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="scan-outline" size={100} color="#00C897" />
          </View>
          <Text style={styles.statusText}>
            {faceIDEnabled ? "Face ID is enabled" : "Face ID is disabled"}
          </Text>
        </Animated.View>

        <View style={styles.setupCard}>
          <FaceIDSetup onToggle={() => {}} />

          <TouchableOpacity
            style={[
              styles.button,
              faceIDEnabled ? styles.disableButton : styles.enableButton,
            ]}
            onPress={handleToggleFaceID}
          >
            <Ionicons
              name={faceIDEnabled ? "eye-off" : "eye"}
              size={24}
              color="#FFF"
            />
            <Text style={styles.buttonText}>
              {faceIDEnabled ? "Disable Face ID" : "Enable Face ID"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3FFF8",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  iconCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(0, 200, 151, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00C897",
    marginTop: 10,
    textAlign: "center",
  },
  setupCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
  },
  enableButton: {
    backgroundColor: "#00C897",
  },
  disableButton: {
    backgroundColor: "#FF6B6B",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
});

export default FaceIDScreen;
