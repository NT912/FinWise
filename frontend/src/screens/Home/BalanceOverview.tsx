import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
            <Ionicons name="wallet-outline" size={16} color="#000000" />
            <Text style={styles.balanceLabel}>Total Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
        </View>

        <View style={styles.balanceItem}>
          <View style={styles.balanceHeader}>
            <Ionicons name="trending-down-outline" size={16} color="#000000" />
            <Text style={styles.balanceLabel}>Total Expense</Text>
          </View>
          <Text style={styles.expenseAmount}>-${totalExpense.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[styles.progressFill, { width: `${expensePercentage}%` }]}
          >
            <Text style={styles.progressPercentage}>
              {expensePercentage.toFixed(0)}%
            </Text>
          </View>
          <View
            style={[
              styles.progressRemaining,
              { width: `${100 - expensePercentage}%` },
            ]}
          >
            <Text style={styles.remainingPercentage}>
              {(100 - expensePercentage).toFixed(0)}%
            </Text>
          </View>
        </View>
        <Text style={styles.progressText}>${targetAmount.toFixed(2)}</Text>
      </View>

      <Text style={styles.statusText}>Of Your Expenses, Looks Good</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#00D09E",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
    margin: 16,
    marginBottom: 18,
  },
  balanceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
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
    color: "#000000",
    marginLeft: 8,
    opacity: 0.7,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  expenseAmount: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0068FF",
  },
  progressContainer: {
    marginBottom: 6,
  },
  progressBackground: {
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 15,
    flexDirection: "row",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 10,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  progressRemaining: {
    height: "100%",
    justifyContent: "center",
    paddingLeft: 10,
  },
  progressPercentage: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
  remainingPercentage: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  progressText: {
    fontSize: 12,
    color: "#000000",
    textAlign: "right",
    marginTop: 2,
    opacity: 0.7,
  },
  statusText: {
    fontSize: 14,
    color: "#000000",
    opacity: 0.7,
  },
});

export default BalanceOverview;
