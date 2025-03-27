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
  Modal,
  StyleSheet,
  Animated,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileMenu from "../../components/profile/ProfileMenu";
import LoadingIndicator from "../../components/LoadingIndicator";
import { getUserProfile } from "../../services/profileService";
import commonProfileStyles from "../../styles/profile/commonProfileStyles";
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
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

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

  const handleLogoutPress = () => {
    setLogoutModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogoutConfirm = async () => {
    try {
      setLogoutModalVisible(false);
      await AsyncStorage.removeItem("token");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const handleLogoutCancel = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setLogoutModalVisible(false);
    });
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

  // Add this function to handle profile updates
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserProfile();
    });

    return unsubscribe;
  }, [navigation]);

  const menuItems = [
    {
      icon: "person-outline",
      text: "Edit Profile",
      onPress: () => {
        if (user) {
          navigation.navigate("EditProfile", {
            user: user,
          });
        } else {
          Alert.alert("Error", "Unable to load user profile");
        }
      },
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
      onPress: handleLogoutPress,
      color: "#FFE5E5",
      textColor: "#FF6B6B",
    },
  ];

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={commonProfileStyles.container}>
      <ScrollView
        style={commonProfileStyles.scrollView}
        contentContainerStyle={commonProfileStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00C897"]}
            tintColor="#00C897"
          />
        }
      >
        <View style={commonProfileStyles.section}>
          <Image
            source={
              user?.avatar
                ? { uri: user.avatar }
                : require("../../../assets/user-avatar.png")
            }
            style={commonProfileStyles.avatar}
          />
          <Text style={commonProfileStyles.userName}>{user?.fullName}</Text>
          <Text style={commonProfileStyles.userInfo}>{user?.email}</Text>
        </View>

        <View style={commonProfileStyles.section}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={commonProfileStyles.menuItem}
              onPress={item.onPress}
            >
              <View
                style={[
                  commonProfileStyles.menuIcon,
                  { backgroundColor: item.color || "#E3FFF8" },
                ]}
              >
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={item.textColor || "#00C897"}
                />
              </View>
              <Text
                style={[
                  commonProfileStyles.menuText,
                  item.textColor && { color: item.textColor },
                ]}
              >
                {item.text}
              </Text>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="none"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={handleLogoutCancel}
      >
        <View style={logoutStyles.modalOverlay}>
          <Animated.View
            style={[
              logoutStyles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={logoutStyles.iconContainer}>
              <Ionicons name="log-out" size={30} color="#FF6B6B" />
            </View>
            <Text style={logoutStyles.title}>Sign Out</Text>
            <Text style={logoutStyles.message}>
              Are you sure you want to sign out from your account?
            </Text>
            <View style={logoutStyles.buttonContainer}>
              <TouchableOpacity
                style={[logoutStyles.button, logoutStyles.cancelButton]}
                onPress={handleLogoutCancel}
              >
                <Text style={logoutStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[logoutStyles.button, logoutStyles.logoutButton]}
                onPress={handleLogoutConfirm}
              >
                <Text style={logoutStyles.logoutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const logoutStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 15,
  },
  logoutButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default ProfileScreen;
