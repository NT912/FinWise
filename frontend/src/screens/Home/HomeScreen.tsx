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
} from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { fetchHomeData, fetchTransactions } from "../../services/homeService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppHeader from "../../components/common/AppHeader";
import BalanceOverview from "./BalanceOverview";
import StatisticsOverview from "./StatisticsOverview";
import FilterButtons from "../../components/FilterButtons";
import LoadingIndicator from "../../components/LoadingIndicator";
import TransactionList from "./TransactionList";
import api from "../../services/apiService";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
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
    totalBalance: 0,
    totalExpense: 0,
    savingsOnGoals: 0,
    goalPercentage: 0,
    revenueLostWeek: 0,
    foodLastWeek: 0,
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
  }, [isFocused]); // Remove selectedFilter from dependency array

  // Handle filter change - show loading only in transactions section
  const handleFilterChange = useCallback(
    (filter: "Daily" | "Weekly" | "Monthly") => {
      setSelectedFilter(filter);
      setTransactionsLoading(true);
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
      const [homeData, transactionsData] = await Promise.all([
        fetchHomeData(filter.toLowerCase()),
        fetchTransactions(filter.toLowerCase()),
      ]);

      console.log("Home data received:", homeData);
      console.log("Transactions data received:", transactionsData.length);

      // Update user data state
      setUserData({
        userName: homeData.userName || "User",
        userAvatar: homeData.userAvatar || "",
        totalBalance: homeData.totalBalance || 0,
        totalExpense: homeData.totalExpense || 0,
        savingsOnGoals: homeData.savingsOnGoals || 0,
        goalPercentage: homeData.goalPercentage || 0,
        revenueLostWeek: homeData.revenueLostWeek || 0,
        foodLastWeek: homeData.foodLastWeek || 0,
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
      const [homeData, transactionsData] = await Promise.all([
        fetchHomeData(filter.toLowerCase()),
        fetchTransactions(filter.toLowerCase()),
      ]);

      // Update user data state
      setUserData((prev) => ({
        ...prev,
        totalBalance: homeData.totalBalance || prev.totalBalance,
        totalExpense: homeData.totalExpense || prev.totalExpense,
        savingsOnGoals: homeData.savingsOnGoals || prev.savingsOnGoals,
        goalPercentage: homeData.goalPercentage || prev.goalPercentage,
        revenueLostWeek: homeData.revenueLostWeek || prev.revenueLostWeek,
        foodLastWeek: homeData.foodLastWeek || prev.foodLastWeek,
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
          <ActivityIndicator size="large" color="#00D09E" />
        </View>
      )}

      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        <AppHeader textColor="#000000" userName={userData.userName} />
      </SafeAreaView>

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
          <BalanceOverview
            totalBalance={userData.totalBalance}
            totalExpense={userData.totalExpense}
          />

          <View style={styles.whiteBackground}>
            {/* Static content - not scrollable */}
            <View style={styles.staticContent}>
              <StatisticsOverview
                savingsOnGoals={userData.savingsOnGoals}
                revenueLostWeek={userData.revenueLostWeek}
                foodLastWeek={userData.foodLastWeek}
                goalPercentage={userData.goalPercentage}
                isLoading={loading}
              />

              <View style={styles.filterContainer}>
                <FilterButtons
                  selectedFilter={selectedFilter}
                  onFilterChange={handleFilterChange}
                />
              </View>
            </View>

            {/* Scrollable transaction list only */}
            <Animated.ScrollView
              style={[
                styles.scrollView,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }, { translateY: translateY }],
                },
              ]}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#00D09E"]}
                  tintColor="#00D09E"
                  progressBackgroundColor="transparent"
                  progressViewOffset={20}
                />
              }
            >
              {transactionsLoading ? (
                <View style={styles.transactionLoadingContainer}>
                  <ActivityIndicator size="large" color="#00D09E" />
                </View>
              ) : transactions && transactions.length > 0 ? (
                transactions.map((group, index) => (
                  <TransactionList
                    key={index}
                    transactions={group.transactions}
                    title={group.date}
                  />
                ))
              ) : (
                <View style={styles.emptyTransactionsContainer}>
                  <Ionicons name="wallet-outline" size={50} color="#DDDDDD" />
                  <Text style={styles.emptyTransactionsText}>
                    No transactions yet
                  </Text>
                  <Text style={styles.emptyTransactionsSubText}>
                    Your transactions will appear here
                  </Text>
                </View>
              )}
            </Animated.ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  safeArea: {
    backgroundColor: "#00D09E",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  whiteBackground: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: -12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  staticContent: {
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  transactionSection: {
    padding: 20,
    paddingTop: 0, // Reduced top padding since heading is removed
  },
  simpleLoaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    height: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    fontSize: 16,
    color: "#555555",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#00D09E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorMessageText: {
    color: "#555555",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButtonSmall: {
    backgroundColor: "#00D09E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonTextSmall: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyTransactionsContainer: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTransactionsText: {
    color: "#DDDDDD",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
  },
  emptyTransactionsSubText: {
    color: "#DDDDDD",
    fontSize: 14,
    textAlign: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  transactionLoadingContainer: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
});

export default HomeScreen;
