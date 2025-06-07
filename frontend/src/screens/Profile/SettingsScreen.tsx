import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons   } from "react-native-vector-icons/Ionicons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ProfileStackParamList } from "../../navigation/AppNavigator";

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();

  const handleNotificationPress = () => {
    // Điều hướng trực tiếp đến màn hình NotificationScreen ở root navigator
    navigation.navigate("NotificationScreen" as any);
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
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity
          style={styles.rightIcon}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* White container with settings items */}
      <View style={styles.contentContainer}>
        {/* Notification Settings */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate("NotificationSettings")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="notifications-outline" size={24} color="#00D09E" />
          </View>
          <Text style={styles.settingText}>Notification Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Password Settings */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={24} color="#00D09E" />
          </View>
          <Text style={styles.settingText}>Password Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={[styles.settingItem, { borderBottomWidth: 0 }]}
          onPress={() => navigation.navigate("DeleteAccount")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
          </View>
          <Text style={styles.settingText}>Delete Account</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>
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
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1FFF9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
});

export default SettingsScreen;
