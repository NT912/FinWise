import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchDashboardData } from "../services/apiService";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ Import SafeAreaView

type Transaction = {
  id: string;
  category: string;
  amount: number;
  date: string;
  type: "income" | "expense";
};

type DashboardData = {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  revenueLastWeek: number;
  foodExpenseLastWeek: number;
  transactions: Transaction[];
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00C897" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {" "}
      {/* ✅ Bọc toàn bộ trong SafeAreaView */}
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hi, Welcome Back</Text>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>

        <View style={styles.balanceContainer}>
          <View style={styles.balanceRow}>
            <Text style={styles.label}>Total Balance</Text>
            <Text style={styles.balance}>${dashboardData?.totalBalance}</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.label}>Total Expense</Text>
            <Text style={styles.totalExpense}>
              -${dashboardData?.totalExpense}
            </Text>
          </View>
        </View>

        {/* Revenue & Expense Last Week */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="car-outline" size={30} color="#00C897" />
            <Text style={styles.statText}>Savings On Goals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statAmount}>
              ${dashboardData?.revenueLastWeek}
            </Text>
            <Text style={styles.statLabel}>Revenue Last Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statAmountExpense}>
              -${dashboardData?.foodExpenseLastWeek}
            </Text>
            <Text style={styles.statLabel}>Food Last Week</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.transactionList}>
          {dashboardData?.transactions.map((transaction, index) => (
            <View key={index} style={styles.transactionItem}>
              <Ionicons name="cash-outline" size={24} color="#00C897" />
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>
                  {transaction.category}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text
                style={
                  transaction.type === "income"
                    ? styles.income
                    : styles.transactionExpense
                }
              >
                {transaction.type === "income" ? "+" : "-"}${transaction.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#E3FFF8" }, // ✅ Định nghĩa SafeAreaView
  container: { flex: 1, backgroundColor: "#E3FFF8" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  welcomeText: { fontSize: 22, fontWeight: "bold" },
  balanceContainer: {
    backgroundColor: "#00C897",
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20, // ✅ Căn chỉnh lề cho đẹp
  },
  balanceRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 16, color: "#fff" },
  balance: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  totalExpense: { fontSize: 22, fontWeight: "bold", color: "#FF4C4C" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  statCard: { alignItems: "center" },
  statText: { fontSize: 14, fontWeight: "bold" },
  statAmount: { fontSize: 18, fontWeight: "bold", color: "#00C897" },
  statAmountExpense: { fontSize: 18, fontWeight: "bold", color: "#FF4C4C" },
  statLabel: { fontSize: 14, color: "gray" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", padding: 20 },
  transactionList: { paddingHorizontal: 20 },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  transactionDetails: { flex: 1, marginLeft: 10 },
  transactionTitle: { fontSize: 16, fontWeight: "bold" },
  transactionDate: { fontSize: 14, color: "gray" },
  income: { fontSize: 16, fontWeight: "bold", color: "#00C897" },
  transactionExpense: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF0000",
  },
});
