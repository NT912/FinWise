import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { updateUserProfile, uploadAvatar } from "../../services/profileService";
import LoadingIndicator from "../../components/LoadingIndicator";
import editProfileStyles from "../../styles/profile/editProfileStyles";

const EditProfileScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { user, onUpdate } = route.params;
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [darkTheme, setDarkTheme] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }

    try {
      setLoading(true);

      // Upload avatar if changed
      let avatarUrl = avatar;
      if (avatar && avatar !== user?.avatar) {
        const uploadResult = await uploadAvatar(avatar);
        avatarUrl = uploadResult.avatarUrl;
      }

      await updateUserProfile({
        fullName,
        email,
        phone,
        avatar: avatarUrl,
      });

      Alert.alert("Success", "Profile updated successfully");
      if (onUpdate) onUpdate();
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={editProfileStyles.container}>
      <View style={editProfileStyles.header}>
        <TouchableOpacity
          style={editProfileStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={editProfileStyles.title}>Edit My Profile</Text>
      </View>

      <ScrollView style={editProfileStyles.content}>
        <View style={editProfileStyles.profileHeader}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                avatar
                  ? { uri: avatar }
                  : require("../../../assets/user-avatar.png")
              }
              style={editProfileStyles.avatar}
            />
          </TouchableOpacity>
          <Text style={editProfileStyles.userName}>{user?.fullName}</Text>
          <Text style={editProfileStyles.userId}>ID: {user?._id}</Text>
        </View>

        <View style={editProfileStyles.settingsSection}>
          <Text style={editProfileStyles.sectionTitle}>Account Settings</Text>

          <Text style={editProfileStyles.inputLabel}>Username</Text>
          <TextInput
            style={editProfileStyles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your name"
          />

          <Text style={editProfileStyles.inputLabel}>Phone</Text>
          <TextInput
            style={editProfileStyles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 234 567 890"
            keyboardType="phone-pad"
          />

          <Text style={editProfileStyles.inputLabel}>Email Address</Text>
          <TextInput
            style={editProfileStyles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={editProfileStyles.toggleRow}>
            <Text style={editProfileStyles.toggleLabel}>
              Push Notifications
            </Text>
            <TouchableOpacity
              onPress={() => setPushNotifications(!pushNotifications)}
            >
              <Ionicons
                name={pushNotifications ? "toggle" : "toggle-outline"}
                size={36}
                color={pushNotifications ? "#00C897" : "#ccc"}
              />
            </TouchableOpacity>
          </View>

          <View style={editProfileStyles.toggleRow}>
            <Text style={editProfileStyles.toggleLabel}>Turn Dark Theme</Text>
            <TouchableOpacity onPress={() => setDarkTheme(!darkTheme)}>
              <Ionicons
                name={darkTheme ? "toggle" : "toggle-outline"}
                size={36}
                color={darkTheme ? "#00C897" : "#ccc"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={editProfileStyles.updateButton}
          onPress={handleSave}
        >
          <Text style={editProfileStyles.updateButtonText}>Update Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
