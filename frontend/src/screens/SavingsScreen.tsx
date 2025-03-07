import React from "react";
import { View, Text, StyleSheet } from "react-native";

const SavingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Savings</Text>
      <Text>Goal: New Car</Text>
      <Text>Saved: $3,000</Text>
      <Text>Goal: House Down Payment</Text>
      <Text>Saved: $20,000</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});

export default SavingsScreen;
