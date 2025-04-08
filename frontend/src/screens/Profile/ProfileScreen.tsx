import React, { useEffect, useState, useRef } from "react";
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
  StatusBar,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileMenu from "../../components/profile/ProfileMenu";
import LoadingIndicator from "../../components/LoadingIndicator";
import { fetchUserProfile } from "../../services/userService";
import commonProfileStyles from "../../styles/profile/commonProfileStyles";
import {
  ProfileStackParamList,
  RootStackParamList,
} from "../../navigation/AppNavigator";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { User } from "../../types";
import TabBar from "../../components/TabBar";
import { StackNavigationProp } from "@react-navigation/stack";
import categoryStyles from "../../styles/category/categoryStyles";

// Định nghĩa kiểu cho navigation
type ProfileScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  "Profile"
>;

// Add type for root navigation
type RootScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "TabNavigator"
>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const rootNavigation = useNavigation<RootScreenNavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await fetchUserProfile();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
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

  const handleLogoutCancel = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setLogoutModalVisible(false);
    });
  };

  const handleLogoutConfirm = async () => {
    try {
      await AsyncStorage.removeItem("token");
      console.log("Token removed successfully");

      setLogoutModalVisible(false);

      rootNavigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert(
        "Logout Failed",
        "There was an error logging out. Please try again."
      );
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserData().then(() => setRefreshing(false));
  }, []);

  // Add this function to handle profile updates
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserData();
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
            user: user as any,
          });
        } else {
          Alert.alert("Error", "Unable to load user profile");
        }
      },
      color: "#4DABFF",
      textColor: "#FFFFFF",
    },
    {
      icon: "shield-outline",
      text: "Security",
      onPress: () => navigation.navigate("Security"),
      color: "#4DABFF",
      textColor: "#FFFFFF",
    },
    {
      icon: "settings-outline",
      text: "Setting",
      onPress: () => navigation.navigate("Settings"),
      color: "#4DABFF",
      textColor: "#FFFFFF",
    },
    {
      icon: "help-circle-outline",
      text: "Help",
      onPress: () => navigation.navigate("Help"),
      color: "#4DABFF",
      textColor: "#FFFFFF",
    },
    {
      icon: "log-out-outline",
      text: "Logout",
      onPress: handleLogoutPress,
      color: "#4DABFF",
      textColor: "#FFFFFF",
    },
  ];

  // Display user's name
  const renderUsername = () => {
    return (
      <View style={styles.usernameContainer}>
        <Text style={styles.usernameText}>{user?.fullName || "User"}</Text>
      </View>
    );
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

      {/* Header với tiêu đề giữa và nút thông báo bên phải */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text
          style={[
            categoryStyles.headerText,
            { flex: 1, textAlign: "center", color: "#000000" },
          ]}
        >
          Profile
        </Text>
        <TouchableOpacity style={categoryStyles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {/* Avatar và tên người dùng */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
                user?.avatar
                  ? { uri: user.avatar }
                  : require("../../../assets/user-avatar.png")
              }
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{user?.fullName || "John Smith"}</Text>
        </View>

        {/* Phần nội dung cố định */}
        <View style={styles.staticContent}>
          {/* Menu items */}
          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View
                  style={[styles.iconCircle, { backgroundColor: item.color }]}
                >
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={item.textColor}
                  />
                </View>
                <Text style={styles.menuText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={handleLogoutCancel}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.deleteIconContainer}>
              <Ionicons name="log-out" size={30} color="#FF6B6B" />
            </View>
            <Text style={styles.deleteTitle}>Logout</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to logout from your account?
            </Text>
            <View style={styles.deleteButtonContainer}>
              <TouchableOpacity
                style={styles.deleteCancelButton}
                onPress={handleLogoutCancel}
              >
                <Text style={styles.deleteCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={handleLogoutConfirm}
              >
                <Text style={styles.deleteConfirmButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 11,
    backgroundColor: "#00D09E",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    flex: 1,
  },
  notificationButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "transparent",
  },
  avatarContainer: {
    position: "absolute",
    alignItems: "center",
    width: "100%",
    top: 20,
    zIndex: 10,
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
  },
  staticContent: {
    flex: 1,
    backgroundColor: "#F0FFF4",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: 75,
    paddingTop: 125,
    paddingBottom: 30,
  },
  menuList: {
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginVertical: 6,
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  deleteIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  deleteTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  deleteMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 24,
  },
  deleteButtonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  deleteCancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginRight: 10,
  },
  deleteCancelButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "500",
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  deleteConfirmButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  usernameContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  usernameText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  placeholder: {
    width: 28, // Cùng kích thước với icon
    height: 28, // Cùng kích thước với icon
  },
});

export default ProfileScreen;
