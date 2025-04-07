import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatVND } from "../../utils/formatters";

// Định nghĩa kiểu dữ liệu cho props
type BalanceOverviewProps = {
  totalBalance: number;
  totalExpense: number;
};

const BalanceOverview: React.FC<BalanceOverviewProps> = ({
  totalBalance,
  totalExpense,
}) => {
  // Calculate expense percentage
  const targetAmount = 20000.0;
  const expensePercentage = Math.min((totalExpense / targetAmount) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.balanceSection}>
        <View style={styles.balanceItem}>
          <View style={styles.balanceHeader}>
            <Ionicons name="wallet-outline" size={20} color="#FFFFFF" />
            <Text style={styles.balanceLabel}>Total Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.balanceItem}>
          <View style={styles.balanceHeader}>
            <Ionicons name="trending-down-outline" size={20} color="#FFFFFF" />
            <Text style={styles.balanceLabel}>Total Expense</Text>
          </View>
          <Text style={styles.expenseAmount}>-${totalExpense.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${expensePercentage}%` }]}
          />
        </View>
        <Text style={styles.progressText}>${targetAmount.toFixed(2)}</Text>
      </View>

      <Text style={styles.statusText}>
        <Text style={styles.percentageText}>
          {expensePercentage.toFixed(0)}%
        </Text>{" "}
        Of Your Expenses. Looks Good.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  balanceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  balanceItem: {
    flex: 1,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 8,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  expenseAmount: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  separator: {
    width: 1,
    height: "100%",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    opacity: 0.2,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "right",
    opacity: 0.8,
  },
  statusText: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  percentageText: {
    color: "#FFFFFF",
    fontWeight: "600",
    opacity: 1,
  },
});

export default BalanceOverview;
