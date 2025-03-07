import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TransactionsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transactions</Text>
      <View style={styles.transactionItem}>
        <Text>Salary</Text>
        <Text style={styles.income}>$4,000.00</Text>
      </View>
      <View style={styles.transactionItem}>
        <Text>Groceries</Text>
        <Text style={styles.expense}>-$100.00</Text>
      </View>
      <View style={styles.transactionItem}>
        <Text>Rent</Text>
        <Text style={styles.expense}>-$674.40</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f0f0f0" },
  header: { fontSize: 22, fontWeight: "bold" },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  income: { color: "#00C897" },
  expense: { color: "#ff4d4d" },
});

export default TransactionsScreen;
