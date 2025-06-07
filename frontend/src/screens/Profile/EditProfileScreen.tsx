import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StyleSheet,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  CommonActions,
} from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { User } from "../../types";
import { Ionicons, MaterialIcons   } from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { updateUserProfile } from "../../services/profileService";
import LoadingIndicator from "../../components/LoadingIndicator";
import categoryStyles from "../../styles/category/categoryStyles";

type EditProfileScreenNavigationProp = NavigationProp<RootStackParamList>;

interface EditProfileScreenProps {
  route: {
    params: {
      user: User;
    };
  };
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
  onConfirm?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = "success",
  onClose,
  onConfirm,
}) => {
  if (!visible) return null;

  const getIconName = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      case "warning":
        return "warning";
      default:
        return "information-circle";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#00D09E";
      case "error":
        return "#FF6B6B";
      case "warning":
        return "#FFB020";
      case "info":
        return "#00D09E";
      default:
        return "#00D09E";
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Ionicons
                name={getIconName()}
                size={50}
                color={getIconColor()}
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalMessage}>{message}</Text>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: getIconColor() },
                ]}
                onPress={onConfirm || onClose}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  onConfirm: (() => void) | null;
}

const EditProfileScreen = ({ route }: EditProfileScreenProps) => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { user } = route.params;

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [savingChanges, setSavingChanges] = useState(false);

  // Validation states
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: "",
    message: "",
    type: "success",
    onConfirm: null,
  });

  const validatePhone = (value: string) => {
    return true; // Bỏ validate số điện thoại
  };

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handlePhoneChange = (value: string) => {
    // Chỉ lưu giá trị mà không validate
    setPhone(value);
    setPhoneError("");
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateEmail(value);
  };

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "success",
    onConfirm: (() => void) | null = null
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const handleSave = async () => {
    const isPhoneValid = validatePhone(phone);
    const isEmailValid = validateEmail(email);

    if (!isPhoneValid || !isEmailValid) {
      showAlert(
        "Validation Error",
        "Please check your input fields",
        "warning"
      );
      return;
    }

    try {
      if (
        fullName === user?.fullName &&
        email === user?.email &&
        phone === user?.phone &&
        avatar === user?.avatar
      ) {
        showAlert("No Changes", "No changes detected to update", "success");
        return;
      }

      setSavingChanges(true);

      const updatedProfile = {
        fullName,
        email,
        phone,
        avatar,
      };

      await updateUserProfile(updatedProfile);
      showAlert(
        "Success",
        "Your profile has been updated successfully",
        "success",
        () => navigation.goBack()
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert(
        "Update Failed",
        "Unable to update profile. Please try again later.",
        "error"
      );
    } finally {
      setSavingChanges(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showAlert("Error", "Failed to select image", "error");
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleNotificationPress = () => {
    // Điều hướng trực tiếp đến màn hình NotificationScreen ở root navigator
    navigation.navigate("NotificationScreen" as any);
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#00D09E"
        translucent={true}
      />

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
        onConfirm={() => {
          setAlertConfig({ ...alertConfig, visible: false });
          alertConfig.onConfirm && alertConfig.onConfirm();
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text
            style={[
              categoryStyles.headerText,
              {
                color: "#000000",
                fontSize: 20,
                fontWeight: "600",
              },
            ]}
          >
            Edit My Profile
          </Text>
        </View>
        <TouchableOpacity
          style={categoryStyles.notificationButton}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.contentContainer}>
          {/* Avatar và tên người dùng */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
              <Image
                source={
                  avatar
                    ? { uri: avatar }
                    : require("../../../assets/user-avatar.png")
                }
                style={styles.avatar}
              />
              <View style={styles.editAvatarButton}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.userName}>{fullName || "John Smith"}</Text>
          </View>

          {/* Account Settings Section */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.staticContent}>
              {/* Username Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your name"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Phone Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View
                  style={[
                    styles.inputContainer,
                    emailError ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {emailError ? (
                    <MaterialIcons
                      name="error"
                      size={20}
                      color="#FF6B6B"
                      style={styles.errorIcon}
                    />
                  ) : null}
                </View>
                {emailError ? (
                  <View style={styles.errorContainer}>
                    <MaterialIcons
                      name="error-outline"
                      size={14}
                      color="#FF6B6B"
                    />
                    <Text style={styles.errorText}>{emailError}</Text>
                  </View>
                ) : null}
              </View>

              {/* Update Profile Button */}
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  savingChanges && { opacity: 0.7 },
                  (phoneError || emailError) && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={savingChanges || !!phoneError || !!emailError}
              >
                {savingChanges ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.updateButtonText}>Update Profile</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 11,
    backgroundColor: "#00D09E",
    position: "relative",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "transparent",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  avatarContainer: {
    position: "absolute",
    alignItems: "center",
    width: "100%",
    top: 20,
    zIndex: 10,
  },
  avatarWrapper: {
    position: "relative",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: "#FFFFFF",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00D09E",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    marginTop: 8,
  },
  staticContent: {
    flex: 1,
    backgroundColor: "#F0FFF4",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: 75,
    paddingTop: 125,
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: "flex-start",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    height: 48,
    fontSize: 16,
    color: "#000000",
    flex: 1,
  },
  updateButton: {
    backgroundColor: "#00D09E",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF5F5",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    backgroundColor: "#FFF5F5",
    padding: 8,
    borderRadius: 6,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  errorIcon: {
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "85%",
    maxWidth: 340,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  modalButton: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00D09E",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditProfileScreen;
