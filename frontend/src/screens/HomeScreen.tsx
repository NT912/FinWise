import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress"; // ✅ Đảm bảo đã cài đặt
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchHomeData } from "../services/transactionService";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Định nghĩa kiểu Transaction
type Transaction = {
  _id: string;
  title: string;
  date: string;
  type: "income" | "expense";
  amount: number;
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [revenueLastWeek, setRevenueLastWeek] = useState(0);
  const [foodLastWeek, setFoodLastWeek] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("Monthly");

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.warn("🚨 Token không tồn tại, yêu cầu đăng nhập lại!");
        navigation.navigate("Login");
        return;
      }

      console.log("✅ Đang gửi request với token:", token);
      const data = await fetchHomeData();
      console.log("📥 API Response:", data);
      setUserName(data.userName);
      setUserAvatar(data.userAvatar || "https://via.placeholder.com/50");
      setTotalBalance(data.totalBalance ?? 0);
      setTotalExpense(data.totalExpense ?? 0);
      setRecentTransactions(data.recentTransactions ?? []);

      console.log("✅ Home data fetched successfully:", data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn("🚨 Token không hợp lệ, chuyển hướng về đăng nhập!");
        await AsyncStorage.clear();
        navigation.navigate("Login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00C897" />
      </View>
    );
  }

  return (
    <FlatList
      data={recentTransactions}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={
        <>
          {/* Header */}
          <View style={styles.header}>
            {/* 🔥 Avatar + Tên User */}
            <View style={styles.userSection}>
              <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                <Image
                  source={{ uri: "https://via.placeholder.com/50" }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <View>
                <Text style={styles.greeting}>Hi, Welcome Back</Text>
                <Text style={styles.userName}>{userName || "User"}</Text>
              </View>
            </View>

            {/* 🔔 Nút Thông báo */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Notifications")}
            >
              <Ionicons name="notifications-outline" size={28} color="black" />
            </TouchableOpacity>
          </View>

          {/* Balance Overview */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceLabel}>Total Expense</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceAmount}>
                ${totalBalance.toFixed(2)}
              </Text>
              <Text style={styles.expenseAmount}>
                -${totalExpense.toFixed(2)}
              </Text>
            </View>

            {/* Thanh tiến trình ngân sách */}
            <Progress.Bar
              progress={totalBalance > 0 ? totalExpense / totalBalance : 0}
              width={300}
              height={12}
              color="#fff"
              borderRadius={10}
              style={styles.progressBar}
            />
          </View>

          {/* 🔥 Savings & Revenue Card */}
          <View style={styles.savingsCard}>
            <View style={styles.savingsItem}>
              <Ionicons name="wallet-outline" size={32} color="white" />
              <Text style={styles.savingsLabel}>Savings On Goals</Text>
            </View>
            <View style={styles.savingsDetails}>
              <View style={styles.revenueBox}>
                <Text style={styles.revenueTitle}>Revenue Last Week</Text>
                <Text style={styles.revenueAmount}>
                  ${revenueLastWeek.toFixed(2)}
                </Text>
              </View>
              <View style={styles.expenseBox}>
                <Text style={styles.expenseTitle}>Food Last Week</Text>
                <Text style={styles.expenseLastWeek}>
                  -${foodLastWeek.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* 🔥 Filter Buttons (Daily | Weekly | Monthly) */}
          <View style={styles.filterContainer}>
            {["Daily", "Weekly", "Monthly"].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Transactions Header */}
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Transactions")}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.transactionItem}
          onPress={() => navigation.navigate("Transactions")}
        >
          <View style={styles.transactionDetails}>
            <Ionicons name="card-outline" size={24} color="#00C897" />
            <View style={styles.transactionTextContainer}>
              <Text style={styles.transactionTitle}>{item.title}</Text>
              <Text style={styles.transactionTime}>
                {new Date(item.date).toLocaleString()}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.transactionAmount,
              item.type === "income" ? styles.incomeText : styles.expenseText,
            ]}
          >
            {item.type === "income" ? "+" : "-"}${item.amount.toFixed(2)}
          </Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  userName: {
    fontSize: 16,
    color: "gray",
    marginTop: 2,
  },

  balanceCard: {
    backgroundColor: "#00C897",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 20,
  },
  balanceRow: { flexDirection: "row", justifyContent: "space-between" },
  balanceLabel: { color: "white", fontSize: 14 },
  balanceAmount: { color: "white", fontSize: 22, fontWeight: "bold" },
  expenseAmount: { color: "#FFD700", fontSize: 22, fontWeight: "bold" },
  progressBar: { alignSelf: "center", marginTop: 10 },

  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  transactionsTitle: { fontSize: 18, fontWeight: "bold" },
  seeAllText: { color: "#00C897", fontWeight: "bold" },

  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  transactionDetails: { flexDirection: "row", alignItems: "center" },
  transactionTextContainer: { marginLeft: 10 },
  transactionTitle: { fontSize: 16, fontWeight: "bold" },
  transactionTime: { fontSize: 12, color: "gray" },

  transactionAmount: { fontSize: 16, fontWeight: "bold" },
  incomeText: { color: "#00C897" },
  expenseText: { color: "#FF4D4D" },

  savingsCard: {
    backgroundColor: "#00C897",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 15,
  },

  savingsItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  savingsLabel: {
    fontSize: 16,
    color: "white",
    marginLeft: 10,
    fontWeight: "bold",
  },

  savingsDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  revenueBox: {
    alignItems: "center",
  },

  expenseBox: {
    alignItems: "center",
  },

  revenueTitle: {
    fontSize: 14,
    color: "white",
  },

  revenueAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },

  expenseTitle: {
    fontSize: 14,
    color: "white",
  },

  expenseLastWeek: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF4D4D",
  },

  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 5,
  },

  filterButtonActive: {
    backgroundColor: "#00C897",
  },

  filterText: {
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
  },

  filterTextActive: {
    color: "white",
  },
});
