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
import BalanceOverview from "./BalanceOverview";
import StatisticsOverview from "./StatisticsOverview";
import FilterButtons from "../../components/FilterButtons";
import LoadingIndicator from "../../components/LoadingIndicator";
import TransactionList from "./TransactionList";
import api from "../../services/apiService";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";

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
    totalBalance: 0,
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
      const [homeData, transactionsData] = await Promise.all([
        fetchHomeData(filter.toLowerCase()),
        fetchTransactions(filter.toLowerCase()),
      ]);

      console.log("Home data received:", homeData);
      console.log("Statistics data:", {
        savingsOnGoals: homeData.savingsOnGoals,
        revenueLostWeek: homeData.revenueLostWeek,
        expenseLastWeek: homeData.expenseLastWeek,
        goalPercentage: homeData.goalPercentage,
      });
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
        expenseLastWeek: homeData.expenseLastWeek || 0,
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
        expenseLastWeek: homeData.expenseLastWeek || prev.expenseLastWeek,
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
          totalBalance={userData.totalBalance}
          totalExpense={userData.totalExpense}
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
    marginBottom: 8,
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
