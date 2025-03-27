import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import categoryStyles from "../../styles/category/categoryStyles";

interface CategoryHeaderProps {
  title: string;
  subtitle: string;
  userName: string;
  userAvatar: string;
}

const CategoryHeader = ({
  title,
  subtitle,
  userName,
  userAvatar,
}: CategoryHeaderProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Hiển thị tên đầy đủ của người dùng
  const displayName = userName || "User";

  return (
    <View style={styles.headerContainer}>
      {/* User info section */}
      <View style={styles.userSection}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => navigation.navigate("Profile")}
        >
          <Image
            source={{ uri: userAvatar || "https://via.placeholder.com/50" }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{displayName}</Text>
        </View>

        {/* Notification Button */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons name="notifications-outline" size={22} color="#00C897" />
        </TouchableOpacity>
      </View>

      {/* Title section */}
      <View style={styles.titleSection}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 15,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(0, 200, 151, 0.1)",
    padding: 3,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0, 200, 151, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleSection: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 15,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#888",
  },
});

export default CategoryHeader;
