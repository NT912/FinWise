import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatVND } from "../../utils/formatters";

interface Transaction {
  id?: string;
  _id?: string;
  type: string;
  icon?: string;
  amount: number;
  date: string;
  category: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
}

const EmptyTransactions = () => (
  <View style={styles.emptyContainer}>
    <Ionicons
      name="receipt-outline"
      size={40}
      color="#DDDDDD"
      style={{ marginBottom: 10 }}
    />
    <Text style={styles.emptyText}>No transactions found</Text>
    <Text style={styles.emptySubtext}>Your transactions will appear here</Text>
  </View>
);

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  title = "Transaction History",
}) => {
  const getIconName = (type: string) => {
    switch (type.toLowerCase()) {
      case "salary":
      case "income":
        return "cash-outline";
      case "groceries":
      case "food":
        return "basket-outline";
      case "rent":
      case "housing":
        return "home-outline";
      case "utilities":
        return "flash-outline";
      case "transport":
      case "transportation":
        return "car-outline";
      case "entertainment":
        return "film-outline";
      case "shopping":
        return "cart-outline";
      case "healthcare":
        return "medkit-outline";
      default:
        return "card-outline";
    }
  };

  const formatAmount = (amount: number) => {
    const isPositive = amount > 0;
    return {
      text: isPositive ? formatVND(amount) : `-${formatVND(Math.abs(amount))}`,
      color: isPositive ? "#00D09E" : "#FF6B6B",
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {transactions && transactions.length > 0 ? (
        transactions.map((transaction) => (
          <View
            key={transaction.id || transaction._id || Math.random().toString()}
            style={styles.transactionItem}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getIconBackgroundColor(transaction.type) },
              ]}
            >
              <Ionicons
                name={getIconName(transaction.type)}
                size={22}
                color="#FFFFFF"
                style={styles.icon}
              />
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.leftContent}>
                <Text style={styles.title}>{transaction.category}</Text>
                <Text style={styles.date}>{transaction.date}</Text>
              </View>

              <View style={styles.rightContent}>
                <Text
                  style={[
                    styles.amount,
                    { color: formatAmount(transaction.amount).color },
                  ]}
                >
                  {formatAmount(transaction.amount).text}
                </Text>
                <Text style={styles.type}>{transaction.type}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <EmptyTransactions />
      )}
    </View>
  );
};

const getIconBackgroundColor = (type: string) => {
  // Assign colors based on transaction types
  switch (type.toLowerCase()) {
    case "salary":
    case "income":
      return "#00D09E"; // Green for income
    case "groceries":
    case "food":
      return "#FFB800"; // Orange for food
    case "rent":
    case "housing":
      return "#4A90E2"; // Blue for housing
    case "utilities":
      return "#9B51E0"; // Purple for utilities
    case "transport":
    case "transportation":
      return "#F2994A"; // Orange for transport
    case "entertainment":
      return "#EB5757"; // Red for entertainment
    case "shopping":
      return "#2F80ED"; // Blue for shopping
    case "healthcare":
      return "#219653"; // Green for healthcare
    default:
      return "#6C63FF"; // Default purple
  }
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    backgroundColor: "transparent",
  },
  detailsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#666666",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  type: {
    fontSize: 13,
    color: "#666666",
    textTransform: "capitalize",
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
});

export default TransactionList;
