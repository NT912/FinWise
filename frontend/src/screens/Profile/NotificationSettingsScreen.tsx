import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
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
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    budgetAlerts: true,
    goalAlerts: true,
    billReminders: true,
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
          billReminders: userData.notifications.billReminders || true,
        });
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      Alert.alert(
        "Error",
        "Unable to load notification settings. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotificationSettings();
    setRefreshing(false);
  }, []);

  const handleToggle = async (key: string, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // Display update notification
      const toastMessage = value
        ? `Enabling ${getLabelForKey(key)}...`
        : `Disabling ${getLabelForKey(key)}...`;

      // Convert key names for API
      const apiSettings = {
        pushNotifications: newSettings.pushNotifications,
        emailNotifications: newSettings.emailNotifications,
        budgetAlerts: newSettings.budgetAlerts,
        goalAlerts: newSettings.goalAlerts,
        billReminders: newSettings.billReminders,
      };

      await updateNotificationSettings(apiSettings);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      Alert.alert(
        "Error",
        "Unable to update notification settings. Please try again later."
      );
      setSettings(settings); // Restore previous settings if failed
    }
  };

  // Helper function to get display names for notification types
  const getLabelForKey = (key: string): string => {
    const labels: Record<string, string> = {
      pushNotifications: "Push Notifications",
      emailNotifications: "Email Notifications",
      budgetAlerts: "Budget Alerts",
      goalAlerts: "Goal Alerts",
      billReminders: "Bill Reminders",
    };
    return labels[key] || key;
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00C897"]}
            tintColor="#00C897"
          />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons
              name="notifications-active"
              size={22}
              color="#00C897"
            />
            <Text style={styles.sectionTitle}>Notification Methods</Text>
          </View>
          <NotificationToggle
            label="Push Notifications"
            description="Receive notifications directly on your device"
            value={settings.pushNotifications}
            onToggle={(value) => handleToggle("pushNotifications", value)}
            icon={
              <Ionicons name="phone-portrait-outline" size={20} color="#555" />
            }
          />
          <NotificationToggle
            label="Email Notifications"
            description="Receive notifications via your registered email address"
            value={settings.emailNotifications}
            onToggle={(value) => handleToggle("emailNotifications", value)}
            icon={<Ionicons name="mail-outline" size={20} color="#555" />}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="bell" size={22} color="#00C897" />
            <Text style={styles.sectionTitle}>Notification Types</Text>
          </View>
          <NotificationToggle
            label="Budget Alerts"
            description="Get notified when you're about to exceed your budget"
            value={settings.budgetAlerts}
            onToggle={(value) => handleToggle("budgetAlerts", value)}
            icon={
              <MaterialIcons
                name="account-balance-wallet"
                size={20}
                color="#555"
              />
            }
          />
          <NotificationToggle
            label="Goal Alerts"
            description="Notifications about your financial goals progress"
            value={settings.goalAlerts}
            onToggle={(value) => handleToggle("goalAlerts", value)}
            icon={<Ionicons name="flag-outline" size={20} color="#555" />}
          />
          <NotificationToggle
            label="Bill Reminders"
            description="Reminders when bills are due for payment"
            value={settings.billReminders}
            onToggle={(value) => handleToggle("billReminders", value)}
            icon={<Ionicons name="calendar-outline" size={20} color="#555" />}
            isLast={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3FFF8",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    backgroundColor: "rgba(0, 200, 151, 0.05)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#00C897",
  },
});

export default NotificationSettingsScreen;
