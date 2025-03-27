import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getUserProfile,
  updateNotificationSettings,
} from "../../services/profileService";
import NotificationToggle from "../../components/profile/NotificationToggle";
import LoadingIndicator from "../../components/LoadingIndicator";
import notificationStyles from "../../styles/profile/notificationStyles";
import commonProfileStyles from "../../styles/profile/commonProfileStyles";

const NotificationSettingsScreen = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    budgetAlerts: true,
    goalAlerts: true,
  });

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile();

      if (userData && userData.notifications) {
        setSettings({
          pushNotifications: userData.notifications.push || false,
          emailNotifications: userData.notifications.email || false,
          budgetAlerts: userData.notifications.budgetAlerts || true,
          goalAlerts: userData.notifications.goalAlerts || true,
        });
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      Alert.alert("Error", "Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // Chuyển đổi tên key cho phù hợp với API
      const apiSettings = {
        pushNotifications: newSettings.pushNotifications,
        emailNotifications: newSettings.emailNotifications,
        budgetAlerts: newSettings.budgetAlerts,
        goalAlerts: newSettings.goalAlerts,
      };

      await updateNotificationSettings(apiSettings);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      Alert.alert("Error", "Failed to update notification settings");
      setSettings(settings); // Restore previous settings if failed
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={notificationStyles.container}>
      <View style={commonProfileStyles.enhancedHeader}>
        <TouchableOpacity
          style={commonProfileStyles.enhancedBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={commonProfileStyles.enhancedHeaderTitle}>
          Notification Settings
        </Text>
      </View>

      <ScrollView style={notificationStyles.content}>
        <View style={notificationStyles.section}>
          <Text style={notificationStyles.sectionTitle}>
            Notification Methods
          </Text>
          <NotificationToggle
            label="Push Notifications"
            value={settings.pushNotifications}
            onToggle={(value) => handleToggle("pushNotifications", value)}
          />
          <NotificationToggle
            label="Email Notifications"
            value={settings.emailNotifications}
            onToggle={(value) => handleToggle("emailNotifications", value)}
          />
        </View>

        <View style={notificationStyles.section}>
          <Text style={notificationStyles.sectionTitle}>
            Notification Types
          </Text>
          <NotificationToggle
            label="Budget Alerts"
            value={settings.budgetAlerts}
            onToggle={(value) => handleToggle("budgetAlerts", value)}
          />
          <NotificationToggle
            label="Goal Alerts"
            value={settings.goalAlerts}
            onToggle={(value) => handleToggle("goalAlerts", value)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;
