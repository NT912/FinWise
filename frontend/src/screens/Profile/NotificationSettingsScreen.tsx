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

const NotificationSettingsScreen = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    general: true,
    sound: true,
    soundCall: true,
    vibrate: true,
    transactionUpdates: true,
    expenseReminder: false,
    budgetNotifications: true,
    lowBalanceAlerts: true,
  });

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile();

      if (userData && userData.notifications) {
        // Map backend notification settings to our UI settings
        const backendSettings = userData.notifications;
        setSettings({
          ...settings,
          general: backendSettings.push || false,
          sound: backendSettings.sound || false,
          // Map other settings as needed
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
      setSettings({ ...settings, [key]: value });

      // Map UI settings back to backend format
      const backendSettings = {
        push: key === "general" ? value : settings.general,
        email: true, // Set other values as needed
        sms: false,
        // Map other settings as needed
      };

      const formattedSettings = {
        pushEnabled: backendSettings.push,
        emailEnabled: backendSettings.email,
        smsEnabled: backendSettings.sms,
      };

      await updateNotificationSettings({
        emailNotifications: formattedSettings.emailEnabled,
        pushNotifications: formattedSettings.pushEnabled,
        smsNotifications: formattedSettings.smsEnabled,
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      Alert.alert("Error", "Failed to update notification settings");
      // Revert the toggle if there was an error
      setSettings({ ...settings });
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={notificationStyles.container}>
      <View style={notificationStyles.header}>
        <TouchableOpacity
          style={notificationStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={notificationStyles.title}>Notification Settings</Text>
      </View>

      <ScrollView style={notificationStyles.content}>
        <View style={notificationStyles.section}>
          <Text style={notificationStyles.sectionTitle}>
            General Notifications
          </Text>

          <NotificationToggle
            label="General Notification"
            value={settings.general}
            onToggle={(value) => handleToggle("general", value)}
          />

          <NotificationToggle
            label="Sound"
            value={settings.sound}
            onToggle={(value) => handleToggle("sound", value)}
          />

          <NotificationToggle
            label="Sound Call"
            value={settings.soundCall}
            onToggle={(value) => handleToggle("soundCall", value)}
          />

          <NotificationToggle
            label="Vibrate"
            value={settings.vibrate}
            onToggle={(value) => handleToggle("vibrate", value)}
          />
        </View>

        <View style={notificationStyles.section}>
          <Text style={notificationStyles.sectionTitle}>
            Financial Notifications
          </Text>

          <NotificationToggle
            label="Transaction Updates"
            value={settings.transactionUpdates}
            onToggle={(value) => handleToggle("transactionUpdates", value)}
          />

          <NotificationToggle
            label="Expense Reminder"
            value={settings.expenseReminder}
            onToggle={(value) => handleToggle("expenseReminder", value)}
          />

          <NotificationToggle
            label="Budget Notifications"
            value={settings.budgetNotifications}
            onToggle={(value) => handleToggle("budgetNotifications", value)}
          />

          <NotificationToggle
            label="Low Balance Alerts"
            value={settings.lowBalanceAlerts}
            onToggle={(value) => handleToggle("lowBalanceAlerts", value)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;
