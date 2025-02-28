import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function NotificationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.message}>No new notifications</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E3FFF8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00C897",
    marginBottom: 10,
  },
  message: { fontSize: 16, color: "#777" },
});
