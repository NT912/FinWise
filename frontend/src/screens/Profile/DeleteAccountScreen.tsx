import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  TextInput,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { Ionicons   } from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NavigationProp,
  useNavigation,
  CommonActions,
} from "@react-navigation/native";
import { ProfileStackParamList } from "../../navigation/AppNavigator";

const DeleteAccountScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const handleNotificationPress = () => {
    // Điều hướng trực tiếp đến màn hình NotificationScreen ở root navigator
    navigation.navigate("NotificationScreen" as any);
  };

  const validatePassword = async () => {
    // Here we would normally validate the password with the API
    // For demo, we'll assume the password is correct if it's not empty
    if (!password || password.length < 6) {
      setErrorMessage("Please enter a valid password");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000); // Hide error after 3 seconds
      return false;
    }

    return true;
  };

  const handleDeleteAccountInitial = async () => {
    const isPasswordValid = await validatePassword();

    if (isPasswordValid) {
      // Show the confirmation popup
      setShowConfirmModal(true);
    }
  };

  const handleFinalDeleteAccount = async () => {
    try {
      // Here you would call your API to delete the account
      // For now, we'll just simulate success
      await AsyncStorage.removeItem("userToken");

      // Close modal and navigate to login
      setShowConfirmModal(false);

      // Navigate to the login screen using CommonActions
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" as any }], // Cast as any to bypass TypeScript error
        })
      );
    } catch (error) {
      setShowConfirmModal(false);
      setErrorMessage("Failed to delete account. Please try again.");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00D09E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <TouchableOpacity
          style={styles.rightIcon}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Warning title */}
        <Text style={styles.warningTitle}>
          Are You Sure You Want To Delete Your Account?
        </Text>

        {/* Warning box */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            This action will permanently delete all of your data, and you will
            not be able to recover it. Please keep the following in mind before
            proceeding:
          </Text>

          <View style={styles.bulletPointsContainer}>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                All your expenses, income and associated transactions will be
                deleted.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                You will not be able to access your account or any related
                information.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                This action cannot be undone.
              </Text>
            </View>
          </View>
        </View>

        {/* Password input */}
        <Text style={styles.passwordLabel}>
          Please Enter Your Password To Confirm Deletion Of Your Account.
        </Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="••••••••"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccountInitial}
          >
            <Text style={styles.deleteButtonText}>Yes, Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Message */}
      {showError && (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Ionicons name="alert-circle" size={24} color="#FFF" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        </View>
      )}

      {/* Final Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Account</Text>

            <Text style={styles.modalText}>
              Are You Sure You Want To Log Out?
            </Text>

            <Text style={styles.modalDescription}>
              By deleting your account, you agree that you understand the
              consequences of this action and that you agree to permanently
              delete your account and all associated data.
            </Text>

            <TouchableOpacity
              style={styles.modalDeleteButton}
              onPress={handleFinalDeleteAccount}
            >
              <Text style={styles.modalDeleteButtonText}>
                Yes, Delete Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowConfirmModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  rightIcon: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F6F9F8",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  warningBox: {
    backgroundColor: "#E5F8F0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
  },
  bulletPointsContainer: {
    marginLeft: 8,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bulletDot: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  passwordLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5F8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 55,
  },
  input: {
    flex: 1,
    height: 55,
    color: "#333",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  buttonContainer: {
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#00D09E",
    borderRadius: 30,
    height: 50,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    width: "80%",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#F2F2F2",
    borderRadius: 30,
    height: 50,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
  },
  // Error styles
  errorContainer: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    zIndex: 1000,
  },
  errorContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "90%",
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 10,
    fontWeight: "500",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  modalDeleteButton: {
    backgroundColor: "#00D09E",
    borderRadius: 30,
    height: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  modalDeleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalCancelButton: {
    backgroundColor: "#E5F8F0",
    borderRadius: 30,
    height: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#333333",
    fontSize: 16,
  },
});

export default DeleteAccountScreen;
