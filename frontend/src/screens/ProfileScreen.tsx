import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchUserProfile, updateUserProfile } from "../services/apiService";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { storage } from "../config/firebase"; // Import Firebase Storage
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [editing, setEditing] = useState(false);
  const [newAvatar, setNewAvatar] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchUserProfile(); // ✅ Gọi API lấy thông tin user
        setUser(profileData);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleEditToggle = () => {
    setEditing(true);
    setModalVisible(false);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", user.email);
      formData.append("fullName", user.fullName);
      formData.append("phone", user.phone);

      if (newAvatar) {
        const response = await fetch(newAvatar);
        const blob = await response.blob();
        formData.append("avatar", {
          uri: newAvatar,
          name: "profile.jpg",
          type: blob.type,
        } as any);
      }

      await updateUserProfile(formData);
      Alert.alert("Success", "Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (uri: string) => {
    try {
      // Chuyển đổi URI ảnh thành Blob để upload lên Firebase
      const response = await fetch(uri);
      const blob = await response.blob();

      // Tạo đường dẫn lưu ảnh trên Firebase Storage
      const fileName = `avatars/${user.email}_${Date.now()}`;
      const storageRef = ref(storage, fileName);

      // Tải ảnh lên Firebase
      const uploadTask = uploadBytesResumable(storageRef, blob);

      // Lắng nghe sự kiện tải lên
      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("Upload Error:", error);
      return null;
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setNewAvatar(result.assets[0].uri);
    }
  };

  const handleChangePassword = () => {
    setModalVisible(false);
    navigation.navigate("ForgotPassword" as never);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00C897" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="settings-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={handlePickImage}>
          <Image
            source={{
              uri:
                newAvatar || user.avatar || "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />
          <Ionicons
            name="camera-outline"
            size={24}
            color="#007AFF"
            style={styles.cameraIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Thông tin cá nhân */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={user.fullName || ""}
          onChangeText={(text) => setUser({ ...user, fullName: text })}
          editable={editing}
          placeholder="Enter your name"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={user.email || ""}
          editable={false}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={user.phone || ""}
          onChangeText={(text) => setUser({ ...user, phone: text })}
          editable={editing}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
      </View>

      {/* Lưu thay đổi */}
      {editing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}

      {/* Modal Settings */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleEditToggle}
            >
              <Ionicons name="create-outline" size={24} color="#007AFF" />
              <Text style={styles.modalText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleChangePassword}
            >
              <Ionicons name="lock-closed-outline" size={24} color="#FF4C4C" />
              <Text style={styles.modalText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#E3FFF8" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#00C897" },
  avatarContainer: { alignItems: "center", marginBottom: 20 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ddd",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
  },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
  },
  disabledInput: { backgroundColor: "#f2f2f2", color: "#999" },
  saveButton: {
    backgroundColor: "#00C897",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalOption: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  modalText: { marginLeft: 10, fontSize: 16, fontWeight: "bold" },
  closeModal: { marginTop: 10, alignItems: "center" },
  closeModalText: { fontSize: 16, color: "red", fontWeight: "bold" },
});
