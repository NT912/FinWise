import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  View,
  StyleSheet,
  StatusBar,
  Animated,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  NavigationProp,
  useNavigation,
  useIsFocused,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import {
  RootStackParamList,
  HomeStackParamList,
} from "../../navigation/AppNavigator";
import { fetchHomeData, fetchTransactions } from "../../services/homeService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppHeader from "../../components/common/AppHeader";
import BalanceOverview from "../../components/BalanceOverview";
import StatisticsOverview from "./StatisticsOverview";
import FilterButtons from "../../components/FilterButtons";
import LoadingIndicator from "../../components/LoadingIndicator";
import TransactionList from "./TransactionList";
import api from "../../services/apiService";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
import * as savingService from "../../services/savingService";

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, "Home">>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    "Daily" | "Weekly" | "Monthly"
  >("Monthly");
  const isFocused = useIsFocused();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const [userData, setUserData] = useState({
    userName: "",
    userAvatar: "",
    totalIncome: 0,
    totalExpense: 0,
    savingsOnGoals: 0,
    goalPercentage: 0,
    revenueLostWeek: 0,
    expenseLastWeek: 0,
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    if (isFocused) {
      // Initial load with full screen overlay is fine
      loadHomeData(selectedFilter);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when screen is not focused
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      translateY.setValue(20);
    }
  }, [isFocused, selectedFilter]);

  // Handle filter change - show loading only in transactions section
  const handleFilterChange = useCallback(
    (filter: "Daily" | "Weekly" | "Monthly") => {
      setSelectedFilter(filter);
      setTransactionsLoading(true);
      setRefreshing(true);
      loadHomeDataWithoutOverlay(filter);
    },
    []
  );

  // Load home data with a full screen loading overlay
  const loadHomeData = async (filter: "Daily" | "Weekly" | "Monthly") => {
    console.log(`Loading home data with filter: ${filter}`);
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      // Fetch both user data and transactions in parallel
      const [homeData, transactionsData, savingsInfo] = await Promise.all([
        fetchHomeData(filter.toLowerCase()),
        fetchTransactions(filter.toLowerCase()),
        savingService.getSimpleSavingsInfo(),
      ]);

      console.log("Home data received:", homeData);
      console.log("Savings info received:", savingsInfo);
      console.log("Transactions data received:", transactionsData.length);

      // Calculate total income from transactions
      const totalIncome = transactionsData.reduce(
        (sum: number, transaction: { type: string; amount: number }) => {
          if (transaction.type === "income") {
            return sum + transaction.amount;
          }
          return sum;
        },
        0
      );

      // Calculate total income and expense from last week
      const now = new Date();
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(now.getDate() - now.getDay() - 6); // Set to last Monday
      lastWeekStart.setHours(0, 0, 0, 0);

      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6); // Set to last Sunday
      lastWeekEnd.setHours(23, 59, 59, 999);

      console.log("Last week range:", {
        start: lastWeekStart.toISOString(),
        end: lastWeekEnd.toISOString(),
      });

      const totalExpenseLastWeek = transactionsData.reduce(
        (
          sum: number,
          transaction: { type: string; amount: number; date: string }
        ) => {
          const transactionDate = new Date(transaction.date);
          if (
            transaction.type === "expense" &&
            transactionDate >= lastWeekStart &&
            transactionDate <= lastWeekEnd
          ) {
            return sum + transaction.amount;
          }
          return sum;
        },
        0
      );

      const totalRevenueLastWeek = transactionsData.reduce(
        (
          sum: number,
          transaction: { type: string; amount: number; date: string }
        ) => {
          const transactionDate = new Date(transaction.date);
          if (
            transaction.type === "income" &&
            transactionDate >= lastWeekStart &&
            transactionDate <= lastWeekEnd
          ) {
            return sum + transaction.amount;
          }
          return sum;
        },
        0
      );

      // Update user data state
      setUserData({
        userName: homeData.userName || "User",
        userAvatar: homeData.userAvatar || "",
        totalIncome: totalIncome,
        totalExpense: homeData.totalExpense || 0,
        savingsOnGoals: totalIncome - (homeData.totalExpense || 0),
        goalPercentage:
          savingsInfo.data?.targetSavingAmount > 0
            ? Math.min(
                ((totalIncome - (homeData.totalExpense || 0)) /
                  savingsInfo.data.targetSavingAmount) *
                  100,
                100
              )
            : 0,
        revenueLostWeek: totalRevenueLastWeek,
        expenseLastWeek: totalExpenseLastWeek,
      });

      // Update transactions
      setTransactions(transactionsData);
    } catch (error: any) {
      console.error("Failed to load home data:", error);
      if (error.message === "User not authenticated") {
        setError("Please login again");
        navigation.navigate("Login" as never);
      } else if (error.response?.status === 401) {
        setError("Session expired. Please login again");
        navigation.navigate("Login" as never);
      } else {
        setError("Failed to load data. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load home data without a full screen overlay
  const loadHomeDataWithoutOverlay = async (
    filter: "Daily" | "Weekly" | "Monthly"
  ) => {
    console.log(`Loading home data without overlay: ${filter}`);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      // Fetch both user data and transactions in parallel
      const [homeData, transactionsData, savingsInfo] = await Promise.all([
        fetchHomeData(filter.toLowerCase()),
        fetchTransactions(filter.toLowerCase()),
        savingService.getSimpleSavingsInfo(),
      ]);

      // Calculate total income from transactions
      const totalIncome = transactionsData.reduce(
        (sum: number, transaction: { type: string; amount: number }) => {
          if (transaction.type === "income") {
            return sum + transaction.amount;
          }
          return sum;
        },
        0
      );

      // Calculate total income and expense from last week
      const now = new Date();
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(now.getDate() - now.getDay() - 6); // Set to last Monday
      lastWeekStart.setHours(0, 0, 0, 0);

      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6); // Set to last Sunday
      lastWeekEnd.setHours(23, 59, 59, 999);

      console.log("Last week range:", {
        start: lastWeekStart.toISOString(),
        end: lastWeekEnd.toISOString(),
      });

      const totalExpenseLastWeek = transactionsData.reduce(
        (
          sum: number,
          transaction: { type: string; amount: number; date: string }
        ) => {
          const transactionDate = new Date(transaction.date);
          if (
            transaction.type === "expense" &&
            transactionDate >= lastWeekStart &&
            transactionDate <= lastWeekEnd
          ) {
            return sum + transaction.amount;
          }
          return sum;
        },
        0
      );

      const totalRevenueLastWeek = transactionsData.reduce(
        (
          sum: number,
          transaction: { type: string; amount: number; date: string }
        ) => {
          const transactionDate = new Date(transaction.date);
          if (
            transaction.type === "income" &&
            transactionDate >= lastWeekStart &&
            transactionDate <= lastWeekEnd
          ) {
            return sum + transaction.amount;
          }
          return sum;
        },
        0
      );

      // Update user data state
      setUserData((prev) => ({
        ...prev,
        totalIncome: totalIncome,
        totalExpense: homeData.totalExpense || prev.totalExpense,
        savingsOnGoals:
          totalIncome - (homeData.totalExpense || prev.totalExpense),
        goalPercentage:
          savingsInfo.data?.targetSavingAmount > 0
            ? Math.min(
                ((totalIncome - (homeData.totalExpense || prev.totalExpense)) /
                  savingsInfo.data.targetSavingAmount) *
                  100,
                100
              )
            : 0,
        revenueLostWeek: totalRevenueLastWeek,
        expenseLastWeek: totalExpenseLastWeek,
      }));

      // Update transactions
      setTransactions(transactionsData);
    } catch (error: any) {
      console.error("Failed to load transactions:", error);
      if (
        error.message === "User not authenticated" ||
        error.response?.status === 401
      ) {
        navigation.navigate("Login" as never);
      } else {
        setError("Failed to load data. Please check your connection.");
      }
    } finally {
      setTransactionsLoading(false);
      setRefreshing(false);
    }
  };

  // Update the onRefresh callback
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHomeDataWithoutOverlay(selectedFilter);
  }, [selectedFilter]);

  // Changed to render main UI even when loading
  return (
    <View style={styles.container}>
      {/* Loading overlay - shown only when initial loading is happening */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Green header section */}
      <View style={styles.headerSection}>
        <SafeAreaView style={styles.safeArea}>
          <AppHeader textColor="#000000" userName={userData.userName} />
        </SafeAreaView>

        <BalanceOverview
          totalBalance={userData.totalIncome || 0}
          totalExpense={userData.totalExpense || 0}
          expensePercentage={
            userData.totalIncome > 0
              ? Math.min(
                  Math.round(
                    ((userData.totalExpense || 0) /
                      (userData.totalIncome || 1)) *
                      100
                  ),
                  100
                )
              : 0
          }
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={60} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadHomeData(selectedFilter)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mainContent}>
          <StatisticsOverview
            savingsOnGoals={userData.savingsOnGoals}
            revenueLostWeek={userData.revenueLostWeek}
            expenseLastWeek={userData.expenseLastWeek}
            goalPercentage={userData.goalPercentage}
            isLoading={refreshing}
          />

          <View style={styles.filterContainer}>
            <FilterButtons
              selectedFilter={selectedFilter}
              onFilterChange={handleFilterChange}
            />
          </View>

          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {transactionsLoading ? (
              <View style={styles.transactionLoadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <TransactionList
                transactions={transactions}
                navigation={navigation}
              />
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  safeArea: {
    backgroundColor: "transparent",
  },
  headerSection: {
    backgroundColor: colors.primary,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginVertical: 8,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    marginTop: -20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 4,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  transactionLoadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;
