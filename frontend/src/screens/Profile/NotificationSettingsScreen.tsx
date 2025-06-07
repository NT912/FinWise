import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons   } from "react-native-vector-icons/Ionicons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ProfileStackParamList } from "../../navigation/AppNavigator";

const NotificationSettingsScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();

  // Settings state
  const [settings, setSettings] = useState({
    generalNotification: true,
    sound: true,
    soundCall: true,
    vibrate: true,
    transactionUpdate: false,
    expenseReminder: false,
    budgetNotifications: false,
    lowBalanceAlerts: false,
  });

  // Handle toggle changes
  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: !prevSettings[key],
    }));
  };

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
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <TouchableOpacity
          style={styles.rightIcon}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollView}>
          {/* Notification options */}
          <NotificationOption
            label="General Notification"
            value={settings.generalNotification}
            onToggle={() => handleToggle("generalNotification")}
          />

          <NotificationOption
            label="Sound"
            value={settings.sound}
            onToggle={() => handleToggle("sound")}
          />

          <NotificationOption
            label="Sound Call"
            value={settings.soundCall}
            onToggle={() => handleToggle("soundCall")}
          />

          <NotificationOption
            label="Vibrate"
            value={settings.vibrate}
            onToggle={() => handleToggle("vibrate")}
          />

          <NotificationOption
            label="Transaction Update"
            value={settings.transactionUpdate}
            onToggle={() => handleToggle("transactionUpdate")}
          />

          <NotificationOption
            label="Expense Reminder"
            value={settings.expenseReminder}
            onToggle={() => handleToggle("expenseReminder")}
          />

          <NotificationOption
            label="Budget Notifications"
            value={settings.budgetNotifications}
            onToggle={() => handleToggle("budgetNotifications")}
          />

          <NotificationOption
            label="Low Balance Alerts"
            value={settings.lowBalanceAlerts}
            onToggle={() => handleToggle("lowBalanceAlerts")}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Simple notification option component
const NotificationOption = ({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) => {
  return (
    <View style={styles.optionRow}>
      <Text style={styles.optionLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#D9D9D9", true: "#00D09E" }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#D9D9D9"
      />
    </View>
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
    overflow: "hidden",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  optionLabel: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "400",
  },
});

export default NotificationSettingsScreen;
