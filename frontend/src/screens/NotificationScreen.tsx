import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import AppHeader from "../components/common/AppHeader";

const NotificationScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <AppHeader
        showBackButton={true}
        showAvatar={false}
        showNotification={false}
        title="Notifications"
        backgroundColor="#F5F5F5"
      />

      <ScrollView style={styles.content}>
        <Text style={styles.notificationItem}>
          Reminder: Set up savings goal!
        </Text>
        <Text style={styles.notificationItem}>
          New transaction recorded: -$50
        </Text>
        <Text style={styles.notificationItem}>Budget exceeded warning!</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default NotificationScreen;
