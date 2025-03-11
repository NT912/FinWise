import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Transaction } from "../types";
import styles from "../styles/home/homeStyles";

interface Props {
  transaction: Transaction;
}

const TransactionItem: React.FC<Props> = ({ transaction }) => {
  const getTransactionIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "salary":
        return "briefcase-outline";
      case "groceries":
        return "cart-outline";
      case "rent":
        return "home-outline";
      case "entertainment":
        return "tv-outline";
      default:
        return "cash-outline";
    }
  };

  return (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionDetails}>
        <Ionicons
          name={getTransactionIcon(transaction.category)}
          size={24}
          color="#00C897"
        />
        <View style={styles.transactionTextContainer}>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
          <Text style={styles.transactionTime}>
            {new Date(transaction.date).toLocaleString()}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          transaction.type === "income"
            ? styles.incomeText
            : styles.expenseText,
        ]}
      >
        {transaction.type === "income" ? "+" : "-"}$
        {transaction.amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
};

export default TransactionItem;
