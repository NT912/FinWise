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

  // Hàm xử lý khi nhấn nút thông báo
  const handleNotificationPress = () => {
    // Điều hướng trực tiếp đến màn hình NotificationScreen ở root navigator
    navigation.navigate("NotificationScreen" as any);
  };

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
      icon: "settings-outline",
      text: "Setting",
      onPress: () => navigation.navigate("Settings"),
      color: "#4DABFF",
      textColor: "#FFFFFF",
    },
    {
      icon: "document-text-outline",
      text: "Terms & Conditions",
      onPress: () => navigation.navigate("Terms"),
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
            Profile
          </Text>
        </View>
        <TouchableOpacity
          style={categoryStyles.notificationButton}
          onPress={handleNotificationPress}
        >
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
            <Text style={styles.modalTitle}>End Session</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleLogoutConfirm}
              >
                <Text style={styles.confirmButtonText}>Yes, End Session</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleLogoutCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
    position: "relative",
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  buttonContainer: {
    width: "100%",
  },
  confirmButton: {
    backgroundColor: "#00D09E",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
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
