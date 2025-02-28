import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const transactions = [
  {
    id: "1",
    description: "Grocery Shopping",
    amount: "-$50.00",
    date: "Feb 25",
  },
  { id: "2", description: "Salary", amount: "+$2,500.00", date: "Feb 24" },
  {
    id: "3",
    description: "Netflix Subscription",
    amount: "-$12.99",
    date: "Feb 22",
  },
];

export default function TransactionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text style={styles.description}>{item.description}</Text>
            <Text
              style={[
                styles.amount,
                item.amount.includes("-") ? styles.expense : styles.income,
              ]}
            >
              {item.amount}
            </Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#E3FFF8" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00C897",
    marginBottom: 20,
  },
  transactionItem: {
    padding: 15,
    backgroundColor: "#FFF",
    marginBottom: 10,
    borderRadius: 8,
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  description: { fontSize: 16, fontWeight: "bold", color: "#333" },
  amount: { fontSize: 16 },
  expense: { color: "#E74C3C" },
  income: { color: "#27AE60" },
  date: { fontSize: 12, color: "#777" },
});
