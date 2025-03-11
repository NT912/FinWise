import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import homeStyles from "../../styles/home/homeStyles";

interface Transaction {
  _id: string;
  title: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  category: string;
}

interface TransactionsSectionProps {
  transactions: Transaction[];
  navigation: any;
}

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

const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions,
  navigation,
}) => {
  return (
    <View>
      <View style={homeStyles.transactionsHeader}>
        <Text style={homeStyles.transactionsTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Transactions")}>
          <Text style={homeStyles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={homeStyles.transactionItem}
            onPress={() => navigation.navigate("Transactions")}
          >
            <View style={homeStyles.transactionDetails}>
              <Ionicons
                name={getTransactionIcon(item.category)}
                size={24}
                color="#00C897"
              />
              <View style={homeStyles.transactionTextContainer}>
                <Text style={homeStyles.transactionTitle}>{item.title}</Text>
                <Text style={homeStyles.transactionTime}>
                  {new Date(item.date).toLocaleString()}
                </Text>
              </View>
            </View>
            <Text
              style={[
                homeStyles.transactionAmount,
                item.type === "income"
                  ? homeStyles.incomeText
                  : homeStyles.expenseText,
              ]}
            >
              {item.type === "income" ? "+" : "-"}${item.amount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default TransactionsSection;
