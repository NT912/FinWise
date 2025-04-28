import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useIsFocused,
  CompositeNavigationProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  RootStackParamList,
  HomeStackParamList,
  TabParamList,
} from "../../navigation/types";
import { fetchHomeData, fetchTransactions } from "../../services/homeService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatVND } from "../../utils/formatters";
import { colors } from "../../theme";
import { fetchWallets } from "../../services/walletService";
import { Transaction } from "../../services/transactionService";
import apiClient from "../../services/apiClient";
import { LineChart } from "react-native-chart-kit";

interface TopSpending {
  category: string;
  amount: number;
}

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isIncludedInTotal: boolean;
  isDefault: boolean;
  userId: string;
}

type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, "Home">,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

interface TransactionListProps {
  timeFilter: "week" | "month";
  onTimeFilterChange: (filter: "week" | "month") => void;
}

interface TransactionItem {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: {
    name: string;
    color: string;
    icon: string;
  };
  date: string;
}

interface DataPoint {
  x: number;
  y: number;
}

const TransactionList: React.FC<TransactionListProps> = ({
  timeFilter,
  onTimeFilterChange,
}) => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleTransactionPress = (transaction: TransactionItem) => {
    navigation.navigate("EditTransaction" as never, {
      transactionId: transaction._id,
    });
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);

      // Tính toán ngày bắt đầu và kết thúc dựa trên timeFilter
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (timeFilter === "week") {
        // Lấy ngày đầu tuần (Thứ 2)
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(
          now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
        );

        // Lấy ngày cuối tuần (Chủ Nhật)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Lấy ngày đầu tháng
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);

        // Lấy ngày cuối tháng
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      }

      console.log(
        `Fetching transactions for ${timeFilter}: ${startDate.toISOString()} to ${endDate.toISOString()}`
      );

      const response = await apiClient.get("/api/transactions/date-range", {
        params: {
          timeFilter,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      // Xử lý dữ liệu trả về từ API
      let transactionsData = [];
      if (response.data && response.data.transactions) {
        if (
          typeof response.data.transactions === "object" &&
          !Array.isArray(response.data.transactions)
        ) {
          // Chuyển đổi từ {date: transaction[]} sang mảng phẳng
          const flattenedTransactions = [];
          for (const date in response.data.transactions) {
            if (
              Object.prototype.hasOwnProperty.call(
                response.data.transactions,
                date
              )
            ) {
              const transactionsForDate = response.data.transactions[date];
              if (Array.isArray(transactionsForDate)) {
                flattenedTransactions.push(...transactionsForDate);
              }
            }
          }
          transactionsData = flattenedTransactions;
        } else if (Array.isArray(response.data.transactions)) {
          transactionsData = response.data.transactions;
        }
      } else if (Array.isArray(response.data)) {
        transactionsData = response.data;
      }

      setTransactions(transactionsData);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [timeFilter]);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View>
      <View style={styles.timeFilterContainer}>
        <TouchableOpacity
          style={[
            styles.timeFilterButton,
            timeFilter === "week" && styles.timeFilterButtonActive,
          ]}
          onPress={() => onTimeFilterChange("week")}
        >
          <Text
            style={[
              styles.timeFilterText,
              timeFilter === "week" && styles.timeFilterTextActive,
            ]}
          >
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timeFilterButton,
            timeFilter === "month" && styles.timeFilterButtonActive,
          ]}
          onPress={() => onTimeFilterChange("month")}
        >
          <Text
            style={[
              styles.timeFilterText,
              timeFilter === "month" && styles.timeFilterTextActive,
            ]}
          >
            Month
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsList}>
        {transactions.length > 0 ? (
          transactions.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.transactionItem}
              onPress={() => handleTransactionPress(item)}
            >
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={item.type === "income" ? "arrow-down" : "arrow-up"}
                  size={24}
                  color={item.type === "income" ? "#00C897" : "#FF6B6B"}
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{item.title}</Text>
                <Text style={styles.transactionCategory}>
                  {item.category.name}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  item.type === "income"
                    ? styles.incomeText
                    : styles.expenseText,
                ]}
              >
                {item.type === "income" ? "+" : "-"}
                {formatVND(item.amount)}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyTransactionsContainer}>
            <Ionicons name="document-text-outline" size={40} color="#CCCCCC" />
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptyDescription}>
              No transactions for this {timeFilter}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const screenWidth = Dimensions.get("window").width;

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const [hideBalance, setHideBalance] = useState(false);
  const [timeRange, setTimeRange] = useState<"week" | "month">("month");
  const [timeFilter, setTimeFilter] = useState<"week" | "month">("week");
  const [currentReport, setCurrentReport] = useState<"trending" | "spending">(
    "trending"
  );
  const [selectedChartType, setSelectedChartType] = useState<
    "income" | "expense"
  >("expense");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    previousStartDate: new Date(),
    previousEndDate: new Date(),
  });

  const [userData, setUserData] = useState({
    userName: "",
    userAvatar: "",
    totalBalance: 0,
    totalExpense: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    lastMonthExpense: 0,
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [topSpending, setTopSpending] = useState<TopSpending[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  // Thêm Animated Value cho hiệu ứng chuyển đổi báo cáo
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(350)).current; // Chiều cao cố định ban đầu cho khối báo cáo

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      // Tính toán ngày bắt đầu và kết thúc dựa trên timeRange
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
      let previousStartDate: Date;
      let previousEndDate: Date;

      if (timeRange === "week") {
        // Lấy ngày đầu tuần (Thứ 2) theo múi giờ Việt Nam
        startDate = new Date(now);
        // Điều chỉnh theo múi giờ Việt Nam (UTC+7)
        startDate.setUTCHours(0, 0, 0, 0);
        startDate.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));

        // Lấy ngày cuối tuần (Chủ Nhật) theo múi giờ Việt Nam
        endDate = new Date(startDate);
        endDate.setUTCDate(startDate.getUTCDate() + 6);
        endDate.setUTCHours(23, 59, 59, 999);

        // Tính thời gian tuần trước
        previousStartDate = new Date(startDate);
        previousStartDate.setUTCDate(startDate.getUTCDate() - 7);
        previousEndDate = new Date(endDate);
        previousEndDate.setUTCDate(endDate.getUTCDate() - 7);
      } else {
        // Lấy ngày đầu tháng theo múi giờ Việt Nam
        startDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
        startDate.setUTCHours(0, 0, 0, 0);

        // Lấy ngày cuối tháng theo múi giờ Việt Nam
        endDate = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0);
        endDate.setUTCHours(23, 59, 59, 999);

        // Tính thời gian tháng trước
        previousStartDate = new Date(
          now.getUTCFullYear(),
          now.getUTCMonth() - 1,
          1
        );
        previousStartDate.setUTCHours(0, 0, 0, 0);
        previousEndDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), 0);
        previousEndDate.setUTCHours(23, 59, 59, 999);
      }

      // Save date ranges in state
      setDateRange({
        startDate,
        endDate,
        previousStartDate,
        previousEndDate,
      });

      console.log("📅 Start date (UTC):", startDate.toISOString());
      console.log("📅 End date (UTC):", endDate.toISOString());
      console.log(
        "📅 Previous start date (UTC):",
        previousStartDate.toISOString()
      );
      console.log("📅 Previous end date (UTC):", previousEndDate.toISOString());

      // Lấy dữ liệu hiện tại
      const [homeData, transactionsData, walletsData] = await Promise.all([
        fetchHomeData(timeRange),
        fetchTransactions(timeRange, startDate, endDate),
        fetchWallets(),
      ]);

      // Lấy dữ liệu kỳ trước để so sánh
      const previousTransactions = await fetchTransactions(
        timeRange,
        previousStartDate,
        previousEndDate
      );

      console.log("🔄 Current transactions:", transactionsData.length);
      console.log("🔄 Previous transactions:", previousTransactions.length);

      // Calculate totals based on actual transactions
      const income = transactionsData.reduce(
        (sum: number, transaction: TransactionItem) => {
          return transaction.type === "income" ? sum + transaction.amount : sum;
        },
        0
      );

      const expense = transactionsData.reduce(
        (sum: number, transaction: TransactionItem) => {
          return transaction.type === "expense"
            ? sum + transaction.amount
            : sum;
        },
        0
      );

      // Tính chính xác tổng chi tiêu kỳ trước
      const previousExpense = previousTransactions.reduce(
        (sum: number, transaction: TransactionItem) => {
          return transaction.type === "expense"
            ? sum + transaction.amount
            : sum;
        },
        0
      );

      console.log("💰 Current expense total:", expense);
      console.log("💰 Previous expense total:", previousExpense);

      // Calculate top spending categories from actual transactions data
      const categorySpending = calculateCategorySpending(transactionsData);

      const topCategories: TopSpending[] = Object.entries(categorySpending)
        .map(
          ([category, amount]): TopSpending => ({
            category,
            amount: Number(amount),
          })
        )
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      // Log top spending categories for verification
      console.log("🔝 Top spending categories:", topCategories);

      // Ensure wallets are properly processed before setting state
      if (walletsData && Array.isArray(walletsData)) {
        const processedWallets = walletsData.map((wallet) => ({
          ...wallet,
          _id: wallet._id || `temp-${Date.now()}`,
          name: wallet.name || "Unnamed Wallet",
          balance: typeof wallet.balance === "number" ? wallet.balance : 0,
          color: wallet.color || "#4CAF50",
          icon: wallet.icon || "wallet-outline",
        }));
        setWallets(processedWallets);

        // Calculate total balance from wallets
        const calculatedTotalBalance = processedWallets.reduce(
          (sum, wallet) => {
            // Only include wallets marked to be included in total
            if (wallet.isIncludedInTotal !== false) {
              return sum + (wallet.balance || 0);
            }
            return sum;
          },
          0
        );

        console.log(`💰 Calculated total balance: ${calculatedTotalBalance}`);

        // Update userData with calculated total balance
        setUserData((prevData) => ({
          ...prevData,
          ...homeData,
          totalBalance: calculatedTotalBalance,
          monthlyIncome: income,
          monthlyExpense: expense,
          lastMonthExpense: previousExpense > 0 ? previousExpense : 1,
        }));
      } else {
        setWallets([]);

        // Still update userData even if there are no wallets
        setUserData((prevData) => ({
          ...prevData,
          ...homeData,
          monthlyIncome: income,
          monthlyExpense: expense,
          lastMonthExpense: previousExpense > 0 ? previousExpense : 1,
        }));
      }

      // Update transactions and top spending categories
      setTransactions(transactionsData.slice(0, 5));
      setTopSpending(topCategories);
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Effect để lắng nghe sự kiện focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("🔄 HomeScreen focused - Reloading data...");
      loadHomeData();
    });

    return unsubscribe;
  }, [navigation, loadHomeData]);

  // Effect để xử lý isFocused
  useEffect(() => {
    if (isFocused) {
      loadHomeData();
    }
  }, [isFocused]);

  // Thêm effect để load lại dữ liệu khi timeRange thay đổi
  useEffect(() => {
    loadHomeData();
  }, [timeRange]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHomeData().finally(() => setRefreshing(false));
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.navigate("Login");
  };

  const handleNotificationPress = () => {
    navigation.navigate("NotificationScreen");
  };

  const handleAddTransaction = (type: "income" | "expense") => {
    navigation.navigate("AddTransaction", { type });
  };

  const handleSeeAllTransactions = () => {
    navigation.navigate("TransactionTab");
  };

  const handleSeeReports = () => {
    navigation.navigate("IncomeExpenseReportScreen");
  };

  const handleTimeFilterChange = (newFilter: "week" | "month") => {
    setTimeFilter(newFilter);

    // Cần load lại dữ liệu theo filter mới
    const now = new Date();
    let newStartDate: Date;
    let newEndDate: Date;
    let newPreviousStartDate: Date;
    let newPreviousEndDate: Date;

    if (newFilter === "week") {
      // Lấy ngày đầu tuần (Thứ 2)
      newStartDate = new Date(now);
      newStartDate.setHours(0, 0, 0, 0);
      newStartDate.setDate(
        now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
      );

      // Lấy ngày cuối tuần (Chủ Nhật)
      newEndDate = new Date(newStartDate);
      newEndDate.setDate(newStartDate.getDate() + 6);
      newEndDate.setHours(23, 59, 59, 999);

      // Tính thời gian tuần trước
      newPreviousStartDate = new Date(newStartDate);
      newPreviousStartDate.setDate(newStartDate.getDate() - 7);
      newPreviousEndDate = new Date(newEndDate);
      newPreviousEndDate.setDate(newEndDate.getDate() - 7);
    } else {
      // Lấy ngày đầu tháng
      newStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      newStartDate.setHours(0, 0, 0, 0);

      // Lấy ngày cuối tháng
      newEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      newEndDate.setHours(23, 59, 59, 999);

      // Tính thời gian tháng trước
      newPreviousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      newPreviousStartDate.setHours(0, 0, 0, 0);
      newPreviousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
      newPreviousEndDate.setHours(23, 59, 59, 999);
    }

    // Cập nhật ngày trong state
    setDateRange({
      startDate: newStartDate,
      endDate: newEndDate,
      previousStartDate: newPreviousStartDate,
      previousEndDate: newPreviousEndDate,
    });

    // Sau đó tải dữ liệu cho khoảng thời gian mới
    updateSpendingData(
      newFilter,
      newStartDate,
      newEndDate,
      newPreviousStartDate,
      newPreviousEndDate
    );
  };

  // Hàm mới để cập nhật dữ liệu chi tiêu dựa trên filter
  const updateSpendingData = async (
    filter: "week" | "month",
    startDate: Date,
    endDate: Date,
    previousStartDate: Date,
    previousEndDate: Date
  ) => {
    try {
      console.log(`📊 Updating spending data for ${filter}`);
      console.log(
        `📅 Period: ${startDate.toISOString()} to ${endDate.toISOString()}`
      );
      console.log(
        `📅 Previous: ${previousStartDate.toISOString()} to ${previousEndDate.toISOString()}`
      );

      // Lấy dữ liệu cho khoảng thời gian hiện tại
      const currentTransactions = await fetchTransactions(
        filter,
        startDate,
        endDate
      );

      // Lấy dữ liệu cho khoảng thời gian trước đó để so sánh
      const previousTransactions = await fetchTransactions(
        filter,
        previousStartDate,
        previousEndDate
      );

      // Tính toán chi tiêu và thu nhập cho khoảng thời gian hiện tại
      const currentExpense = currentTransactions.reduce(
        (sum: number, transaction: TransactionItem) =>
          transaction.type === "expense" ? sum + transaction.amount : sum,
        0
      );

      // Tính toán thu nhập cho khoảng thời gian hiện tại
      const currentIncome = currentTransactions.reduce(
        (sum: number, transaction: TransactionItem) =>
          transaction.type === "income" ? sum + transaction.amount : sum,
        0
      );

      // Tính toán chi tiêu cho khoảng thời gian trước đó
      const previousExpense = previousTransactions.reduce(
        (sum: number, transaction: TransactionItem) =>
          transaction.type === "expense" ? sum + transaction.amount : sum,
        0
      );

      console.log(`💰 Current ${filter} expense: ${currentExpense}`);
      console.log(`💰 Current ${filter} income: ${currentIncome}`);
      console.log(`💰 Previous ${filter} expense: ${previousExpense}`);

      // Cập nhật userData với dữ liệu mới
      setUserData((prevData) => ({
        ...prevData,
        monthlyIncome: currentIncome,
        monthlyExpense: currentExpense,
        lastMonthExpense: previousExpense > 0 ? previousExpense : 1, // Tránh chia cho 0
      }));
    } catch (error) {
      console.error("Error updating spending data:", error);
    }
  };

  const calculateCategorySpending = (transactions: TransactionItem[]) => {
    return transactions.reduce((acc: Record<string, number>, transaction) => {
      if (transaction.type === "expense") {
        const categoryName =
          typeof transaction.category === "string"
            ? transaction.category
            : transaction.category.name;
        acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
      }
      return acc;
    }, {});
  };

  // Hàm để chuyển đổi giữa các báo cáo với hiệu ứng
  const handleNavigateReport = (direction: "next" | "prev") => {
    // Bắt đầu hiệu ứng fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false, // Để có thể animate layout properties
    }).start(() => {
      // Sau khi mờ đi, cập nhật loại báo cáo
      if (direction === "next") {
        setCurrentReport("spending");
      } else {
        setCurrentReport("trending");
      }

      // Reset vị trí slide cho hiệu ứng tiếp theo
      slideAnim.setValue(direction === "next" ? -20 : 20);

      // Chạy hiệu ứng fade in và slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    });
  };

  // Updated percentage change calculation with max cap
  const calculateChangePercentage = () => {
    // Handle case where there is no previous data
    if (!userData.lastMonthExpense || userData.lastMonthExpense <= 0) {
      // If no expenses in previous period, but there are in current => 100% increase
      return userData.monthlyExpense > 0 ? 100 : 0;
    }

    // Calculate percentage change and return integer value
    const change = Math.round(
      ((userData.monthlyExpense - userData.lastMonthExpense) /
        userData.lastMonthExpense) *
        100
    );

    // Cap the maximum percentage at 100%
    return Math.min(Math.abs(change), 100) * (change < 0 ? -1 : 1);
  };

  // Phần trăm thay đổi
  const changePercentage = calculateChangePercentage();
  // Xác định nếu chi tiêu tăng hay giảm
  const isDecreased = changePercentage < 0;

  // Thêm hàm để tạo dữ liệu cho biểu đồ - sửa lại phần xử lý dữ liệu
  const generateChartData = (
    transactions: TransactionItem[],
    dateRange: any,
    selectedChartType: "income" | "expense"
  ) => {
    // Lấy ngày đầu tháng và ngày hiện tại
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Đảm bảo có giao dịch để xử lý
    if (!transactions || transactions.length === 0) {
      // Trả về dữ liệu mẫu nếu không có giao dịch
      return {
        labels: ["", "", "", ""],
        datasets: [
          {
            data: [0, 0, 0, 0],
            color: (opacity = 1) =>
              selectedChartType === "income"
                ? `rgba(0, 200, 151, ${opacity})`
                : `rgba(255, 107, 107, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    }

    // Lọc giao dịch theo loại và trong tháng hiện tại
    const filteredTransactions = transactions.filter((t) => {
      const transDate = new Date(t.date);
      return (
        t.type === selectedChartType &&
        transDate >= startOfMonth &&
        transDate <= today
      );
    });

    // Sắp xếp theo thứ tự thời gian
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Tạo các điểm dữ liệu cho biểu đồ
    let dataPoints: DataPoint[] = [];
    let cumulativeAmount = 0;

    // Luôn bắt đầu từ 0 vào đầu tháng
    dataPoints.push({
      x: startOfMonth.getTime(),
      y: 0,
    });

    // Thêm mỗi giao dịch vào dữ liệu tích lũy
    for (const transaction of sortedTransactions) {
      cumulativeAmount += transaction.amount;
      dataPoints.push({
        x: new Date(transaction.date).getTime(),
        y: cumulativeAmount,
      });
    }

    // Đảm bảo biểu đồ có đủ điểm để vẽ đẹp
    if (dataPoints.length < 2) {
      if (dataPoints.length === 0) {
        // Nếu không có điểm nào, tạo điểm bắt đầu và kết thúc
        dataPoints = [
          { x: startOfMonth.getTime(), y: 0 },
          { x: today.getTime(), y: 0 },
        ];
      } else {
        // Nếu chỉ có một điểm, thêm điểm kết thúc
        dataPoints.push({
          x: today.getTime(),
          y: dataPoints[dataPoints.length - 1].y,
        });
      }
    }

    // Thêm điểm cuối cùng nếu điểm cuối chưa phải là hôm nay
    const lastPoint = dataPoints[dataPoints.length - 1];
    if (lastPoint.x < today.getTime()) {
      dataPoints.push({
        x: today.getTime(),
        y: lastPoint.y,
      });
    }

    // Đảm bảo có đủ điểm để vẽ đường đẹp (tối thiểu 4 điểm)
    while (dataPoints.length < 4) {
      // Tạo thêm các điểm trung gian
      const totalDuration = today.getTime() - startOfMonth.getTime();
      const step = totalDuration / (4 - 1);

      const newDataPoints: DataPoint[] = [dataPoints[0]]; // Giữ lại điểm đầu tiên

      for (let i = 1; i < 4 - 1; i++) {
        const timestamp = startOfMonth.getTime() + i * step;

        // Tìm giá trị y phù hợp cho timestamp này
        let yValue = 0;
        for (let j = 0; j < dataPoints.length - 1; j++) {
          if (
            timestamp >= dataPoints[j].x &&
            timestamp <= dataPoints[j + 1].x
          ) {
            // Nội suy tuyến tính để có đường mượt
            const ratio =
              (timestamp - dataPoints[j].x) /
              (dataPoints[j + 1].x - dataPoints[j].x);
            yValue =
              dataPoints[j].y + ratio * (dataPoints[j + 1].y - dataPoints[j].y);
            break;
          }
        }

        newDataPoints.push({ x: timestamp, y: yValue });
      }

      newDataPoints.push(dataPoints[dataPoints.length - 1]); // Giữ lại điểm cuối cùng
      dataPoints = newDataPoints;
    }

    // Tối ưu hóa số lượng điểm (chọn tối đa 6 điểm)
    if (dataPoints.length > 6) {
      const step = Math.ceil(dataPoints.length / 6);
      const optimizedPoints = [];

      for (let i = 0; i < dataPoints.length; i += step) {
        if (optimizedPoints.length < 5) {
          optimizedPoints.push(dataPoints[i]);
        }
      }

      // Luôn giữ lại điểm cuối cùng
      if (
        optimizedPoints[optimizedPoints.length - 1] !==
        dataPoints[dataPoints.length - 1]
      ) {
        optimizedPoints.push(dataPoints[dataPoints.length - 1]);
      }

      dataPoints = optimizedPoints;
    }

    // Chuyển đổi thành định dạng cho LineChart
    const values = dataPoints.map((point: DataPoint) => point.y);

    // Tạo mảng labels trống (không hiển thị ngày)
    const labels = dataPoints.map(() => "");

    return {
      labels: labels,
      datasets: [
        {
          data: values,
          color: (opacity = 1) =>
            selectedChartType === "income"
              ? `rgba(0, 200, 151, ${opacity})`
              : `rgba(255, 107, 107, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  // Add a compact formatter for chart axis values
  const formatCompact = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // Add a simple formatter for currency display with only one đ symbol
  const formatSimpleCurrency = (value: number): string => {
    // Format number with thousands separators
    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Hi, {userData.userName}</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>
              {hideBalance ? "••••••••" : formatVND(userData.totalBalance)}
            </Text>
            <TouchableOpacity
              onPress={() => setHideBalance(!hideBalance)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={hideBalance ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#000000"
              />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={handleNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Wallets Overview */}
        <View style={[styles.section, styles.firstSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Wallets</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("WalletScreen" as never)}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.walletsCard}>
            {wallets.length > 0 ? (
              wallets.map((wallet) => (
                <View key={wallet._id} style={styles.walletItem}>
                  <View style={styles.walletIconContainer}>
                    <View
                      style={[
                        styles.walletIcon,
                        { backgroundColor: wallet.color || "#FF9500" },
                      ]}
                    >
                      <Ionicons
                        name={(wallet.icon as any) || "wallet-outline"}
                        size={20}
                        color="#FFF"
                      />
                    </View>
                    <Text style={styles.walletName}>
                      {wallet.name || "Cash"}
                    </Text>
                  </View>
                  <Text style={styles.walletBalance}>
                    {formatVND(wallet.balance)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyWalletContainer}>
                <Ionicons name="wallet-outline" size={40} color="#CCCCCC" />
                <Text style={styles.emptyText}>No wallets found</Text>
                <Text style={styles.emptyDescription}>
                  Add a wallet to start tracking your finances
                </Text>
                <TouchableOpacity
                  style={styles.addWalletButton}
                  onPress={() => {
                    const parent = navigation.getParent();
                    if (parent) {
                      (parent.navigate as any)("CreateWalletScreen");
                    }
                  }}
                >
                  <Text style={styles.addWalletButtonText}>Add Wallet</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Monthly Report */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Report this month</Text>
            <TouchableOpacity onPress={handleSeeReports}>
              <Text style={styles.seeAllText}>See reports</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reportCard}>
            {/* Khối báo cáo với kích thước cố định và hiệu ứng animation */}
            <Animated.View
              style={[
                styles.reportContentContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                  height: heightAnim,
                },
              ]}
            >
              {/* Trending Report - Đồ thị đường thu nhập và chi tiêu */}
              {currentReport === "trending" && (
                <>
                  {/* Total spent and income */}
                  <View style={styles.summaryContainer}>
                    <TouchableOpacity
                      style={styles.summaryColumn}
                      onPress={() => setSelectedChartType("expense")}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.summaryLabel}>Total spent</Text>
                      <Text
                        style={[styles.summaryAmount, styles.expenseAmount]}
                      >
                        {formatVND(userData.monthlyExpense)}
                      </Text>
                      <View
                        style={[
                          styles.summaryBar,
                          styles.expenseBar,
                          selectedChartType === "expense" &&
                            styles.summaryBarSelected,
                        ]}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.summaryColumn}
                      onPress={() => setSelectedChartType("income")}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.summaryLabel}>Total income</Text>
                      <Text style={[styles.summaryAmount, styles.incomeAmount]}>
                        {formatVND(userData.monthlyIncome)}
                      </Text>
                      <View
                        style={[
                          styles.summaryBar,
                          styles.incomeBar,
                          selectedChartType === "income" &&
                            styles.summaryBarSelected,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Chart container with maximum value label */}
                  <View style={styles.chartContainerWithMax}>
                    {/* Chart display */}
                    <View style={styles.chartWrapper}>
                      {/* Real line chart with gradient background */}
                      <LineChart
                        data={generateChartData(
                          transactions,
                          dateRange,
                          selectedChartType
                        )}
                        width={screenWidth - 60}
                        height={150}
                        chartConfig={{
                          backgroundColor: "#ffffff",
                          backgroundGradientFrom: "#ffffff",
                          backgroundGradientTo: "#ffffff",
                          decimalPlaces: 0,
                          color: (opacity = 1) =>
                            selectedChartType === "income"
                              ? `rgba(0, 200, 151, ${opacity})`
                              : `rgba(255, 107, 107, ${opacity})`,
                          labelColor: (opacity = 0.5) =>
                            `rgba(128, 128, 128, ${opacity})`,
                          style: {
                            borderRadius: 16,
                          },
                          propsForDots: {
                            r: "6",
                            strokeWidth: "2",
                            stroke:
                              selectedChartType === "income"
                                ? "#00C897"
                                : "#FF6B6B",
                          },
                          propsForBackgroundLines: {
                            stroke: "#F0F0F0",
                            strokeDasharray: "5, 5",
                          },
                          propsForLabels: {
                            fontSize: 0, // Hide all labels
                          },
                          fillShadowGradient:
                            selectedChartType === "income"
                              ? "#00C897"
                              : "#FF6B6B",
                          fillShadowGradientOpacity: 0.3,
                          useShadowColorFromDataset: false,
                        }}
                        bezier
                        style={styles.lineChart}
                        fromZero
                        withInnerLines={false}
                        withOuterLines={false}
                        withHorizontalLines={true}
                        withVerticalLines={false}
                        withHorizontalLabels={false}
                        withVerticalLabels={false}
                        withDots={true}
                        segments={0}
                      />
                    </View>

                    {/* Maximum value positioned above the highest point (end of chart) */}
                    <View style={styles.maxValueContainer}>
                      <Text
                        style={[
                          styles.maxValueLabelText,
                          {
                            color:
                              selectedChartType === "income"
                                ? "#00C897"
                                : "#FF6B6B",
                          },
                        ]}
                      >
                        {formatCompact(
                          selectedChartType === "income"
                            ? userData.monthlyIncome
                            : userData.monthlyExpense
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* Date display */}
                  <View style={styles.chartDateContainer}>
                    <Text style={styles.chartDateLabel}>01/04</Text>
                    <Text style={styles.chartDateLabel}>30/04</Text>
                  </View>

                  {/* Legend */}
                  <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          selectedChartType === "income"
                            ? styles.incomeDot
                            : styles.expenseDot,
                        ]}
                      />
                      <Text style={styles.legendText}>This month</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={styles.legendDotInactive} />
                      <Text style={styles.legendText}>
                        Previous 3-month average
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.helpIcon}>
                      <Ionicons
                        name="help-circle-outline"
                        size={16}
                        color="#888"
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Spending Report - Biểu đồ cột so sánh chi tiêu */}
              {currentReport === "spending" && (
                <>
                  {/* Tab selector (Week/Month) */}
                  <View style={styles.tabSelector}>
                    <TouchableOpacity
                      style={[
                        styles.tabButton,
                        timeFilter === "week" && styles.tabButtonActive,
                      ]}
                      onPress={() => handleTimeFilterChange("week")}
                    >
                      <Text
                        style={[
                          styles.tabButtonText,
                          timeFilter === "week" && styles.tabButtonTextActive,
                        ]}
                      >
                        Week
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.tabButton,
                        timeFilter === "month" && styles.tabButtonActive,
                      ]}
                      onPress={() => handleTimeFilterChange("month")}
                    >
                      <Text
                        style={[
                          styles.tabButtonText,
                          timeFilter === "month" && styles.tabButtonTextActive,
                        ]}
                      >
                        Month
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Chi tiêu hiện tại so với kỳ trước */}
                  <View style={styles.spendingReportContainer}>
                    {/* Header với thông tin tổng chi tiêu và tỷ lệ thay đổi */}
                    <View style={styles.spendingHeaderContainer}>
                      <View>
                        <Text style={styles.spendingReportAmountText}>
                          {formatSimpleCurrency(userData.monthlyExpense)} đ
                        </Text>
                        <View style={styles.spendingTitleContainer}>
                          <Text style={styles.spendingTitleText}>
                            Total spent this {timeFilter}
                          </Text>
                          {userData.lastMonthExpense > 0 && (
                            <View style={styles.changePercentageWrapper}>
                              <Ionicons
                                name={
                                  isDecreased
                                    ? "arrow-down-outline"
                                    : "arrow-up-outline"
                                }
                                size={18}
                                color={isDecreased ? "#4CAF50" : "#FF6B6B"}
                              />
                              <Text
                                style={[
                                  styles.percentageChangeText,
                                  {
                                    color: isDecreased ? "#4CAF50" : "#FF6B6B",
                                  },
                                ]}
                              >
                                {Math.abs(changePercentage)}%
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Bar Chart Container */}
                    <View style={styles.barChartMainContainer}>
                      {/* Y-axis maximum value */}
                      <Text style={styles.barChartMaxValue}>
                        {formatCompact(
                          userData.lastMonthExpense > userData.monthlyExpense
                            ? userData.lastMonthExpense
                            : userData.monthlyExpense
                        )}
                      </Text>

                      {/* Bar Chart với đường ngang và các cột */}
                      <View style={styles.barChartContent}>
                        <View style={styles.barChartHorizontalLine} />

                        <View style={styles.barChartColumns}>
                          {/* Previous period bar - Kỳ trước */}
                          <View style={styles.barChartColumnWrapper}>
                            {userData.lastMonthExpense > 0 && (
                              <View
                                style={[
                                  styles.barChartBar,
                                  styles.barChartPrevious,
                                  {
                                    height: Math.min(
                                      (userData.lastMonthExpense /
                                        Math.max(
                                          userData.lastMonthExpense,
                                          userData.monthlyExpense,
                                          1000 // Giá trị tối thiểu để tránh chia cột quá nhỏ
                                        )) *
                                        160,
                                      160
                                    ),
                                  },
                                ]}
                              />
                            )}
                            <Text style={styles.barChartLabel}>
                              Last {timeFilter}
                            </Text>
                            {userData.lastMonthExpense > 0 && (
                              <Text style={styles.barChartValue}>
                                {formatCompact(userData.lastMonthExpense)}
                              </Text>
                            )}
                          </View>

                          {/* Current period bar - Kỳ này */}
                          <View style={styles.barChartColumnWrapper}>
                            {userData.monthlyExpense > 0 && (
                              <View
                                style={[
                                  styles.barChartBar,
                                  styles.barChartCurrent,
                                  {
                                    height: Math.min(
                                      (userData.monthlyExpense /
                                        Math.max(
                                          userData.lastMonthExpense,
                                          userData.monthlyExpense,
                                          1000 // Giá trị tối thiểu để tránh chia cột quá nhỏ
                                        )) *
                                        160,
                                      160
                                    ),
                                  },
                                ]}
                              />
                            )}
                            <Text style={styles.barChartLabel}>
                              This {timeFilter}
                            </Text>
                            {userData.monthlyExpense > 0 && (
                              <Text style={styles.barChartValue}>
                                {formatCompact(userData.monthlyExpense)}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </Animated.View>

            {/* Report navigation */}
            <View style={styles.reportNavigation}>
              <TouchableOpacity onPress={() => handleNavigateReport("prev")}>
                <Ionicons
                  name="chevron-back-outline"
                  size={24}
                  color="#4CAF50"
                />
              </TouchableOpacity>
              <Text style={styles.reportTitle}>
                {currentReport === "trending"
                  ? "Trending Report"
                  : "Spending Report"}
              </Text>
              <TouchableOpacity onPress={() => handleNavigateReport("next")}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={24}
                  color="#4CAF50"
                />
              </TouchableOpacity>
            </View>

            {/* Report indicator dots */}
            <View style={styles.indicatorContainer}>
              <View
                style={[
                  styles.indicator,
                  currentReport === "trending" && styles.indicatorActive,
                ]}
              />
              <View
                style={[
                  styles.indicator,
                  currentReport === "spending" && styles.indicatorActive,
                ]}
              />
            </View>
          </View>
        </View>

        {/* Top Spending */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Spending</Text>
          </View>
          <View style={styles.topSpendingCard}>
            <View style={styles.timeRangeSelector}>
              <TouchableOpacity
                style={[
                  styles.timeRangeButton,
                  timeRange === "week" && styles.timeRangeButtonActive,
                ]}
                onPress={() => setTimeRange("week")}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    timeRange === "week" && styles.timeRangeTextActive,
                  ]}
                >
                  Week
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeRangeButton,
                  timeRange === "month" && styles.timeRangeButtonActive,
                ]}
                onPress={() => setTimeRange("month")}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    timeRange === "month" && styles.timeRangeTextActive,
                  ]}
                >
                  Month
                </Text>
              </TouchableOpacity>
            </View>
            {topSpending.length > 0 ? (
              topSpending.map((item, index) => (
                <View key={index} style={styles.spendingItem}>
                  <View style={styles.spendingIcon}>
                    <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.spendingDetails}>
                    <Text style={styles.spendingCategory}>{item.category}</Text>
                    <Text style={styles.spendingAmount}>
                      {formatVND(item.amount)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No spending data available</Text>
            )}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={handleSeeAllTransactions}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsCard}>
            <TransactionList
              timeFilter={timeFilter}
              onTimeFilterChange={handleTimeFilterChange}
            />
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddTransaction("expense")}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  balanceText: {
    fontSize: 18,
    color: "#000000",
    opacity: 1,
    fontWeight: "700",
    marginRight: 8,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  contentContainer: {
    paddingTop: 15,
  },
  section: {
    marginBottom: 20,
  },
  firstSection: {
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 14,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 4,
    marginBottom: 15,
    alignSelf: "center",
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryColumn: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666666",
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  expenseAmount: {
    color: "#FF6B6B",
  },
  incomeAmount: {
    color: "#00C897",
  },
  summaryBar: {
    height: 4,
    width: "50%",
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    marginTop: 5,
  },
  summaryBarSelected: {
    width: "70%",
    height: 5,
  },
  expenseBar: {
    backgroundColor: "#FF6B6B",
  },
  incomeBar: {
    backgroundColor: "#00C897",
  },
  amountDisplayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateText: {
    color: "#888888",
    fontSize: 14,
  },
  chartContainer: {
    height: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  lineChart: {
    borderRadius: 10,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  expenseDot: {
    backgroundColor: "#FF6B6B",
  },
  incomeDot: {
    backgroundColor: "#00C897",
  },
  legendDotInactive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CCCCCC",
    marginRight: 5,
  },
  legendText: {
    color: "#666666",
    fontSize: 10,
  },
  reportNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 2,
  },
  indicatorActive: {
    backgroundColor: colors.primary,
  },
  topSpendingCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  timeRangeSelector: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 4,
    marginBottom: 15,
    alignSelf: "center",
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeRangeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  timeRangeTextActive: {
    color: "#FFFFFF",
  },
  noDataText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  timeFilterContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 4,
    marginBottom: 15,
    alignSelf: "center",
  },
  timeFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  timeFilterButtonActive: {
    backgroundColor: colors.primary,
  },
  timeFilterText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  timeFilterTextActive: {
    color: "#FFFFFF",
  },
  transactionsList: {
    maxHeight: 400, // Giới hạn chiều cao của danh sách
  },
  walletsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  walletItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  walletIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF9500",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  walletName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  emptyWalletContainer: {
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
    marginTop: 10,
    marginBottom: 5,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#888888",
    marginBottom: 15,
    textAlign: "center",
  },
  addWalletButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  addWalletButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
  transactionsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  transactionCategory: {
    fontSize: 14,
    color: "#666666",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  incomeText: {
    color: "#00C897",
  },
  expenseText: {
    color: "#FF6B6B",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIcon: {
    padding: 5,
  },
  spendingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  spendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  spendingDetails: {
    flex: 1,
  },
  spendingCategory: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  spendingAmount: {
    fontSize: 14,
    color: "#FF6B6B",
  },
  spendingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
  },
  spendingReportContainer: {
    marginTop: 15,
  },
  spendingHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginHorizontal: 15,
  },
  spendingReportAmountText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  spendingTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  spendingTitleText: {
    fontSize: 12,
    color: "#888888",
  },
  changePercentageWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  percentageChangeText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 3,
  },
  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  barChartColumn: {
    flex: 1,
  },
  barChartBarContainer: {
    height: 120,
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    marginBottom: 5,
    justifyContent: "flex-end",
  },
  barChartBar: {
    backgroundColor: "#FF6B6B",
    borderRadius: 5,
    width: "70%",
    alignSelf: "center",
  },
  barChartPrevBar: {
    backgroundColor: "#FFCDD2",
    borderRadius: 5,
    width: "70%",
    alignSelf: "center",
  },
  barChartCurrBar: {
    backgroundColor: "#FF6B6B",
    borderRadius: 5,
    width: "70%",
    alignSelf: "center",
  },
  barChartBarInactive: {
    backgroundColor: "#cccccc",
  },
  barChartLabel: {
    marginTop: 10,
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
  },
  barChartValue: {
    color: "#555555",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
    fontWeight: "500",
  },
  reportContentContainer: {
    width: "100%",
    minHeight: 350,
    padding: 10,
  },
  helpIcon: {
    padding: 5,
  },
  chartContainerWithMax: {
    marginVertical: 15,
    paddingVertical: 5,
  },
  chartWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    height: 170,
  },
  maxValueContainer: {
    position: "absolute",
    top: 2,
    right: -10,
    alignItems: "flex-end",
    paddingRight: 5,
    backgroundColor: "white",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  maxValueLabelText: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  chartContentContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chartDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingHorizontal: 10,
  },
  chartDateLabel: {
    fontSize: 8,
    color: "#888888",
  },
  barChartMainContainer: {
    height: 250,
    marginTop: 30,
    marginHorizontal: 15,
    position: "relative",
  },
  barChartMaxValue: {
    position: "absolute",
    top: 0,
    right: -15,
    fontSize: 11,
    color: "#555555",
    backgroundColor: "white",
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  barChartZeroValue: {
    position: "absolute",
    bottom: 45,
    right: -15,
    fontSize: 11,
    color: "#555555",
    backgroundColor: "white",
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  barChartContent: {
    height: 200,
    paddingBottom: 30,
    position: "relative",
  },
  barChartHorizontalLine: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  barChartColumns: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: "100%",
  },
  barChartColumnWrapper: {
    width: "35%",
    height: 160,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barChartPrevious: {
    backgroundColor: "#FFCDD2",
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  barChartCurrent: {
    backgroundColor: "#FF6B6B", // Darker red for current period
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  emptyTransactionsContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
});

export default HomeScreen;
