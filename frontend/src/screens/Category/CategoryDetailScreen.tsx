import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  Image,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatVND } from "../../utils/formatters";
import { getTransactionsByCategory } from "../../services/transactionService";
import categoryService from "../../services/categoryService";
import { Transaction } from "../../types";
import { Category } from "../../types/category";
import { formatDate } from "../../utils/dateUtils";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useMainLayout } from "../../components/MainLayout";
import TabBar from "../../components/TabBar";

type RouteParams = {
  CategoryDetail: {
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
  };
};

const CategoryDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<RouteParams, "CategoryDetail">>();
  const { categoryId, categoryName, categoryIcon, categoryColor } =
    route.params;
  const mainLayout = useMainLayout();

  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [totalIncome, setTotalIncome] = useState(7783.0);
  const [totalExpense, setTotalExpense] = useState(1187.4);
  const [budgetLimit, setBudgetLimit] = useState(20000); // Default 20K
  const [expensePercentage, setExpensePercentage] = useState(30);

  // Grouped transactions by month
  const [groupedTransactions, setGroupedTransactions] = useState<{
    [key: string]: Transaction[];
  }>({});

  // Load transactions
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login" as never);
        return;
      }

      // Get category details
      const categoryData = await categoryService.getCategoryById(categoryId);
      setCategory(categoryData);

      // Set budget limit if available
      if (categoryData.budget) {
        setBudgetLimit(categoryData.budget);
      }

      // Get transactions for this category
      const data = await getTransactionsByCategory(categoryId);
      setTransactions(data);

      // Calculate total income and expense for this category
      const income = data
        .filter((t: Transaction) => t.type === "income")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const expense = data
        .filter((t: Transaction) => t.type === "expense")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      setTotalIncome(income || 7783.0);
      setTotalExpense(expense || 1187.4);

      // Calculate expense percentage
      const percentage = Math.min(
        Math.round((expense / budgetLimit) * 100),
        100
      );
      setExpensePercentage(percentage || 30);

      // Group transactions by month
      const grouped = data.reduce(
        (acc: { [key: string]: Transaction[] }, transaction: Transaction) => {
          const date = new Date(transaction.date);
          const monthYear = date.toLocaleString("default", {
            month: "long",
          });

          if (!acc[monthYear]) {
            acc[monthYear] = [];
          }

          acc[monthYear].push(transaction);
          return acc;
        },
        {}
      );

      // Sort each month's transactions by date (newest first)
      Object.keys(grouped).forEach((key) => {
        grouped[key].sort(
          (a: Transaction, b: Transaction) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

      setGroupedTransactions(grouped);
    } catch (error) {
      console.error("Error loading transactions:", error);

      // Sample data for demonstration
      setTotalIncome(7783.0);
      setTotalExpense(1187.4);
      setExpensePercentage(30);

      // Create sample data
      const mockData: Transaction[] = [
        {
          _id: "1",
          title: "Dinner",
          amount: 26.0,
          type: "expense",
          date: "2024-04-30T18:27:00.000Z",
          category: category || {
            _id: "food-123",
            name: "Food",
            icon: "restaurant-outline",
            color: "#00D09E",
            type: "expense",
            userId: "user-123",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Transaction,
        {
          _id: "2",
          title: "Delivery Pizza",
          amount: 18.35,
          type: "expense",
          date: "2024-04-24T15:00:00.000Z",
          category: category || {
            _id: "food-123",
            name: "Food",
            icon: "restaurant-outline",
            color: "#00D09E",
            type: "expense",
            userId: "user-123",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Transaction,
        {
          _id: "3",
          title: "Lunch",
          amount: 15.4,
          type: "expense",
          date: "2024-04-15T12:30:00.000Z",
          category: category || {
            _id: "food-123",
            name: "Food",
            icon: "restaurant-outline",
            color: "#00D09E",
            type: "expense",
            userId: "user-123",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Transaction,
        {
          _id: "4",
          title: "Brunch",
          amount: 12.13,
          type: "expense",
          date: "2024-04-08T09:30:00.000Z",
          category: category || {
            _id: "food-123",
            name: "Food",
            icon: "restaurant-outline",
            color: "#00D09E",
            type: "expense",
            userId: "user-123",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Transaction,
        {
          _id: "5",
          title: "Dinner",
          amount: 27.2,
          type: "expense",
          date: "2024-03-31T20:50:00.000Z",
          category: category || {
            _id: "food-123",
            name: "Food",
            icon: "restaurant-outline",
            color: "#00D09E",
            type: "expense",
            userId: "user-123",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Transaction,
      ];

      // Group sample data by month
      const grouped = mockData.reduce(
        (acc: { [key: string]: Transaction[] }, transaction: Transaction) => {
          const date = new Date(transaction.date);
          const monthYear = date.toLocaleString("default", {
            month: "long",
          });

          if (!acc[monthYear]) {
            acc[monthYear] = [];
          }

          acc[monthYear].push(transaction);
          return acc;
        },
        {}
      );

      setGroupedTransactions(grouped);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryId, navigation, budgetLimit]);

  // Load data on mount
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  // Handle adding a new expense
  const handleAddExpense = () => {
    navigation.navigate("AddTransaction", {
      preSelectedCategory: categoryId,
      type: category?.type || "expense",
    } as never);
  };

  // Handle going back
  const handleGoBack = () => {
    if (mainLayout) {
      // Ensure Category tab is selected when going back
      mainLayout.setActiveTab("Category");
    }
    navigation.goBack();
  };

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isExpense = item.type === "expense";
    const amount = isExpense
      ? `-$${item.amount.toFixed(2)}`
      : `+$${item.amount.toFixed(2)}`;

    // Format the date
    const transactionDate = new Date(item.date);
    const formattedTime = transactionDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const formattedDate = formatDate(transactionDate);

    // Use a type assertion to handle potential title property issue
    const transaction = item as any;
    const transactionTitle =
      transaction.title || item.category?.name || "Transaction";

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() =>
          navigation.navigate("TransactionDetail", {
            transactionId: item._id,
          } as never)
        }
      >
        <View style={styles.transactionIconContainer}>
          <Ionicons name="restaurant-outline" size={24} color="#FFFFFF" />
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{transactionTitle}</Text>
          <Text style={styles.transactionDate}>
            {`${formattedTime} - ${formattedDate}`}
          </Text>
        </View>

        <Text style={styles.transactionAmount}>{amount}</Text>
      </TouchableOpacity>
    );
  };

  // Render month section
  const renderMonthSection = ({ item }: { item: string }) => {
    const monthTransactions = groupedTransactions[item];

    return (
      <View style={styles.monthSection}>
        <Text style={styles.monthTitle}>{item}</Text>
        {monthTransactions.map((transaction) => (
          <View key={transaction._id}>
            {renderTransactionItem({ item: transaction })}
          </View>
        ))}
      </View>
    );
  };

  // Render main content
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D09E" />
        </View>
      );
    }

    if (Object.keys(groupedTransactions).length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={60} color="#CCCCCC" />
          <Text style={styles.emptyText}>No transactions found</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
            <Text style={styles.addButtonText}>Add First Transaction</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <FlatList
          data={Object.keys(groupedTransactions)}
          keyExtractor={(item) => item}
          renderItem={renderMonthSection}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />

        <TouchableOpacity
          style={styles.addExpenseButton}
          onPress={handleAddExpense}
        >
          <Text style={styles.addExpenseButtonText}>Add Expenses</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Handle tab change
  const handleTabChange = (tabName: string) => {
    if (mainLayout) {
      mainLayout.setActiveTab(tabName as any);

      // Navigate to the corresponding screen based on the tab
      switch (tabName) {
        case "Home":
          navigation.navigate("Home" as never);
          break;
        case "Category":
          navigation.navigate("Category" as never);
          break;
        case "Charts":
          navigation.navigate("Charts" as never);
          break;
        case "Profile":
          navigation.navigate("Profile" as never);
          break;
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00D09E" />

      {/* Header section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Financial summary */}
      <View style={styles.financialSummary}>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <View style={styles.balanceLabel}>
              <Ionicons name="checkmark-circle" size={16} color="white" />
              <Text style={styles.balanceLabelText}>Total Balance</Text>
            </View>
            <Text style={styles.balanceValue}>${totalIncome.toFixed(2)}</Text>
          </View>

          <View style={styles.balanceItem}>
            <View style={styles.balanceLabel}>
              <Ionicons name="arrow-down" size={16} color="white" />
              <Text style={styles.balanceLabelText}>Total Expense</Text>
            </View>
            <Text style={styles.expenseValue}>-${totalExpense.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.budgetSection}>
          <Text style={styles.budgetPercentage}>{expensePercentage}%</Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${expensePercentage}%` as unknown as number },
              ]}
            />
          </View>
          <Text style={styles.budgetLimit}>${budgetLimit.toFixed(2)}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Ionicons name="checkmark-circle" size={16} color="#00D09E" />
          <Text style={styles.statusText}>
            {expensePercentage}% Of Your Expenses, Looks Good.
          </Text>
        </View>
      </View>

      {/* Content container */}
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  notificationButton: {
    padding: 4,
  },
  financialSummary: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  balanceItem: {
    alignItems: "flex-start",
  },
  balanceLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  balanceLabelText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 4,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  expenseValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  budgetSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  budgetPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 4,
  },
  budgetLimit: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingBottom: 80, // Add padding to make room for tab bar
  },
  contentContainer: {
    flex: 1,
    position: "relative",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  monthSection: {
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#69BCFF",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: "#666",
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#00D09E",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#00D09E",
    borderRadius: 25,
  },
  addButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  addExpenseButton: {
    backgroundColor: "#00D09E",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    position: "absolute",
    bottom: 20,
    width: 150,
  },
  addExpenseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CategoryDetailScreen;
