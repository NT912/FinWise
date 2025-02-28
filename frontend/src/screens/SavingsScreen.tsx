import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SavingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Savings</Text>
      <Text style={styles.amount}>Total Savings: $2,000.00</Text>
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
  title: { fontSize: 24, fontWeight: "bold", color: "#00C897" },
  amount: { fontSize: 20, fontWeight: "bold", color: "#333", marginTop: 10 },
});
