import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Image,
  Text,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileMenu from "../../components/profile/ProfileMenu";
import LoadingIndicator from "../../components/LoadingIndicator";
import { getUserProfile } from "../../services/profileService";
import profileStyles from "../../styles/profile/profileStyles";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { User } from "../../types";

// Định nghĩa kiểu cho navigation
type ProfileScreenNavigationProp = NavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchUserProfile(); // Refresh user data silently
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const menuItems = [
    {
      icon: "person-outline",
      text: "Edit Profile",
      onPress: () =>
        navigation.navigate("EditProfile", {
          user,
          onUpdate: fetchUserProfile,
        }),
    },
    {
      icon: "shield-outline",
      text: "Security",
      onPress: () => navigation.navigate("SecurityScreen"),
    },
    {
      icon: "settings-outline",
      text: "Setting",
      onPress: () => navigation.navigate("SettingsScreen"),
    },
    {
      icon: "help-circle-outline",
      text: "Help",
      onPress: () => navigation.navigate("HelpScreen"),
    },
    {
      icon: "log-out-outline",
      text: "Logout",
      onPress: handleLogout,
      color: "#FFE5E5",
      textColor: "#FF6B6B",
    },
  ];

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={profileStyles.container}>
      <View style={profileStyles.header}>
        <Text style={profileStyles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={profileStyles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00C897"]}
            tintColor="#00C897"
          />
        }
      >
        <View style={profileStyles.profileSection}>
          <Image
            source={
              user?.avatar
                ? { uri: user.avatar }
                : require("../../../assets/user-avatar.png")
            }
            style={profileStyles.avatar}
          />
          <Text style={profileStyles.name}>
            {user?.fullName || "User Name"}
          </Text>
          <Text style={profileStyles.email}>
            {user?.email || "user@example.com"}
          </Text>

          <TouchableOpacity
            style={profileStyles.editButton}
            onPress={() =>
              navigation.navigate("EditProfile", {
                user: user,
                onUpdate: fetchUserProfile,
              })
            }
          >
            <Text style={profileStyles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={profileStyles.menuContainer}>
          <TouchableOpacity
            style={profileStyles.menuItem}
            onPress={() => navigation.navigate("SettingsScreen")}
          >
            <Ionicons name="settings-outline" size={24} color="#00C897" />
            <Text style={profileStyles.menuText}>Settings</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#ccc"
              style={profileStyles.chevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={profileStyles.menuItem}
            onPress={() => navigation.navigate("SecurityScreen")}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color="#00C897"
            />
            <Text style={profileStyles.menuText}>Security</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#ccc"
              style={profileStyles.chevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={profileStyles.menuItem}
            onPress={() => navigation.navigate("NotificationSettingsScreen")}
          >
            <Ionicons name="notifications-outline" size={24} color="#00C897" />
            <Text style={profileStyles.menuText}>Notifications</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#ccc"
              style={profileStyles.chevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={profileStyles.menuItem}
            onPress={() => navigation.navigate("HelpScreen")}
          >
            <Ionicons name="help-circle-outline" size={24} color="#00C897" />
            <Text style={profileStyles.menuText}>Help</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#ccc"
              style={profileStyles.chevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[profileStyles.menuItem, profileStyles.logoutItem]}
            onPress={() => navigation.navigate("LogoutScreen")}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
            <Text style={[profileStyles.menuText, profileStyles.logoutText]}>
              Logout
            </Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#ccc"
              style={profileStyles.chevron}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
