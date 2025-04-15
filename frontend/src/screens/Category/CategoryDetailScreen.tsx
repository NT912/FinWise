import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Animated,
  Easing,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useIsFocused,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatVND } from "../../utils/formatters";
import {
  getTransactionsByCategory,
  deleteTransaction,
} from "../../services/transactionService";
import * as categoryService from "../../services/categoryService";
import { Transaction } from "../../types";
import { Category } from "../../types/category";
import { formatDate } from "../../utils/dateUtils";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useMainLayout } from "../../components/MainLayout";
import TabBar from "../../components/TabBar";
import {
  Swipeable,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useToast } from "../../components/ToastProvider";

type RouteParams = {
  CategoryDetail: {
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    transactionAdded?: boolean;
    timestamp?: number;
  };
};

const CategoryDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<RouteParams, "CategoryDetail">>();
  const { categoryId, categoryName, categoryIcon, categoryColor } =
    route.params;
  const mainLayout = useMainLayout();
  const isFocused = useIsFocused();
  const toast = useToast();

  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [expensePercentage, setExpensePercentage] = useState(0);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState("");

  // Grouped transactions by month
  const [groupedTransactions, setGroupedTransactions] = useState<{
    [key: string]: Transaction[];
  }>({});

  // Add animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Tham chiếu đến Swipeable hiện tại đang mở
  const swipeableRef = useRef<Swipeable | null>(null);

  // State cho hiệu ứng nhấn nút
  const [pressedButtons, setPressedButtons] = useState<{
    [key: string]: { edit: boolean; delete: boolean };
  }>({});

  // States cho modal xác nhận xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );

  // Animation values cho modal xóa
  const deleteModalScale = useRef(new Animated.Value(0.85)).current;
  const deleteModalOpacity = useRef(new Animated.Value(0)).current;
  const deleteModalBackdropOpacity = useRef(new Animated.Value(0)).current;

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
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = data
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      setTotalIncome(income || 0);
      setTotalExpense(expense || 0);

      // Calculate expense percentage
      const percentage = Math.min(
        Math.round((expense / (categoryData.budget || 20000)) * 100),
        100
      );
      setExpensePercentage(percentage || 0);

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
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

      setGroupedTransactions(grouped);
    } catch (error) {
      console.error("❌ Lỗi khi tải giao dịch:", error);
      setTransactions([]);
      setGroupedTransactions({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryId, navigation]);

  // Load data on mount and when categoryId changes or when screen is focused
  useEffect(() => {
    if (isFocused) {
      loadTransactions();
    }
  }, [categoryId, isFocused, loadTransactions]);

  // Start pulse animation for button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

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

  // Handle budget edit
  const handleBudgetEdit = () => {
    setIsEditingBudget(true);
    setNewBudget(budgetLimit.toString());
  };

  // Format input value while typing (for display only)
  const formatInputValue = (value: string) => {
    if (!value) return "";
    // Add thousand separators but keep it as a continuous string without spaces
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleBudgetInputChange = (text: string) => {
    // Remove all non-numeric characters
    const numericValue = text.replace(/\D/g, "");
    // Format as currency
    setNewBudget(numericValue);
  };

  const handleSaveBudget = async () => {
    try {
      const numericBudget = parseInt(newBudget.replace(/\D/g, "")) || 0;
      setBudgetLimit(numericBudget);

      // Update category budget in backend
      if (category) {
        await categoryService.updateCategory(categoryId, {
          ...category,
          budget: numericBudget,
        });
      }

      // Recalculate expense percentage
      const percentage = Math.min(
        Math.round((totalExpense / numericBudget) * 100),
        100
      );
      setExpensePercentage(percentage);

      setIsEditingBudget(false);
    } catch (error) {
      console.error("Error updating budget:", error);
    }
  };

  // Animate button on press
  const animateButtonPress = () => {
    // Xóa haptic feedback

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animate button release
  const animateButtonRelease = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle add expense with animation
  const handleAddExpenseWithAnimation = () => {
    animateButtonRelease();
    handleAddExpense();
  };

  // Đóng Swipeable đang mở
  const closeOpenSwipeable = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
      swipeableRef.current = null;
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (transactionId: string) => {
    closeOpenSwipeable();

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction(transactionId);

              // Update data after deletion
              loadTransactions();

              // Show success message
              Alert.alert("Success", "Transaction deleted successfully");
            } catch (error) {
              console.error("Error deleting transaction:", error);
              Alert.alert(
                "Error",
                "Unable to delete transaction. Please try again later."
              );
            }
          },
        },
      ]
    );
  };

  // Open delete confirmation modal
  const openDeleteModal = (transactionId: string) => {
    closeOpenSwipeable();
    setTransactionToDelete(transactionId);
    setShowDeleteModal(true);

    // Animate modal appearance with improved timing
    Animated.parallel([
      Animated.timing(deleteModalBackdropOpacity, {
        toValue: 0.6,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(deleteModalScale, {
        toValue: 1,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.timing(deleteModalOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    // Animate modal disappearance with smoother exit
    Animated.parallel([
      Animated.timing(deleteModalBackdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(deleteModalScale, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(deleteModalOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    });
  };

  // Confirm transaction deletion
  const confirmDelete = async () => {
    // Check if there's a transaction to delete
    if (!transactionToDelete) return;

    try {
      // Add subtle shake animation before deleting
      Animated.sequence([
        Animated.timing(deleteModalScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(deleteModalScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setDeleteLoading(true);

      // Wait 300ms to show loading state
      await new Promise((resolve) => setTimeout(resolve, 300));

      await deleteTransaction(transactionToDelete);

      // Close the modal with animation
      closeDeleteModal();

      // Update transactions after deletion
      loadTransactions();

      // Reset state
      setDeleteLoading(false);

      // Show success message after modal is closed
      setTimeout(() => {
        toast.showToast("Transaction deleted successfully", "success");
      }, 300);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setDeleteLoading(false);

      // Close modal before showing error
      closeDeleteModal();

      setTimeout(() => {
        toast.showToast(
          "Unable to delete transaction. Please try again later.",
          "error"
        );
      }, 300);
    }
  };

  // Handle edit transaction
  const handleEditTransaction = (transactionId: string) => {
    closeOpenSwipeable();
    // Navigate to edit transaction screen
    navigation.navigate("EditTransaction", {
      transactionId: transactionId,
    });
  };

  // Handle pressing edit button
  const handlePressEditButton = (transactionId: string, pressed: boolean) => {
    setPressedButtons((prev) => ({
      ...prev,
      [transactionId]: {
        ...(prev[transactionId] || { edit: false, delete: false }),
        edit: pressed,
      },
    }));
  };

  // Handle pressing delete button
  const handlePressDeleteButton = (transactionId: string, pressed: boolean) => {
    setPressedButtons((prev) => ({
      ...prev,
      [transactionId]: {
        ...(prev[transactionId] || { edit: false, delete: false }),
        delete: pressed,
      },
    }));
  };

  // Render right action buttons when swiping
  const renderRightActions = (
    transactionId: string,
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    // Get current pressed state for this item
    const buttonState = pressedButtons[transactionId] || {
      edit: false,
      delete: false,
    };

    // Animation for buttons
    const trans = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [80, 40, 0],
      extrapolate: "clamp",
    });

    // Opacity animation
    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.4, 0.8, 1],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View
          style={[
            styles.swipeActionWrapper,
            styles.editActionWrapper,
            {
              transform: [{ translateX: trans }],
              opacity: opacity,
            },
            buttonState.edit && styles.buttonPressed,
          ]}
        >
          <TouchableOpacity
            style={styles.swipeAction}
            onPress={() => handleEditTransaction(transactionId)}
            onPressIn={() => handlePressEditButton(transactionId, true)}
            onPressOut={() => handlePressEditButton(transactionId, false)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.actionText}>Sửa</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.swipeActionWrapper,
            styles.deleteActionWrapper,
            {
              transform: [{ translateX: trans }],
              opacity: opacity,
            },
            buttonState.delete && styles.buttonPressed,
          ]}
        >
          <TouchableOpacity
            style={styles.swipeAction}
            onPress={() => openDeleteModal(transactionId)}
            onPressIn={() => handlePressDeleteButton(transactionId, true)}
            onPressOut={() => handlePressDeleteButton(transactionId, false)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
            <Text style={styles.actionText}>Xóa</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isExpense = item.type === "expense";
    const amount = isExpense
      ? `-${formatVND(item.amount)}`
      : `+${formatVND(item.amount)}`;

    // Format the date
    const transactionDate = new Date(item.date);
    const formattedTime = transactionDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const formattedDate = formatDate(transactionDate);

    // Display transaction title
    const transactionTitle =
      item.title || item.note || item.category?.name || "Giao dịch";

    // Use category icon if available or fallback to default
    const categoryIcon = item.category?.icon || "receipt-outline";
    const categoryColor = item.category?.color || "#69BCFF";

    return (
      <View style={styles.transactionItemContainer}>
        <Swipeable
          ref={(ref) => {
            if (ref && swipeableRef.current !== ref) {
              closeOpenSwipeable();
              swipeableRef.current = ref;
            }
          }}
          renderRightActions={(progress) =>
            renderRightActions(item._id || "", progress)
          }
          overshootRight={false}
          friction={2}
          rightThreshold={40}
        >
          <TouchableOpacity
            style={styles.transactionItem}
            onPress={() =>
              navigation.navigate("EditTransaction", {
                transactionId: item._id || "",
              })
            }
          >
            <View
              style={[
                styles.transactionIconContainer,
                { backgroundColor: categoryColor },
              ]}
            >
              <Ionicons name={categoryIcon as any} size={24} color="#FFFFFF" />
            </View>

            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>{transactionTitle}</Text>
              <Text style={styles.transactionDate}>
                {`${formattedTime} - ${formattedDate}`}
              </Text>
            </View>

            <Text
              style={[
                styles.transactionAmount,
                { color: isExpense ? "#FF3B30" : "#34C759" },
              ]}
            >
              {amount}
            </Text>
          </TouchableOpacity>
        </Swipeable>
      </View>
    );
  };

  // Render month section - bọc từng transaction trong một View riêng biệt
  const renderMonthSection = ({ item }: { item: string }) => {
    const monthTransactions = groupedTransactions[item];

    return (
      <View style={styles.monthSection}>
        <Text style={styles.monthTitle}>{item}</Text>
        {monthTransactions.map((transaction) => (
          <View key={transaction._id || Math.random().toString()}>
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
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }}
          >
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddExpenseWithAnimation}
              onPressIn={animateButtonPress}
              onPressOut={animateButtonRelease}
              activeOpacity={0.8}
            >
              <Ionicons name="add-outline" size={20} color="white" />
              <Text style={styles.addButtonText}>Add First Transaction</Text>
            </TouchableOpacity>
          </Animated.View>
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

        <Animated.View
          style={[
            styles.fabContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: Animated.multiply(pulseAnim, -3) },
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addExpenseButton}
            onPress={handleAddExpenseWithAnimation}
            onPressIn={animateButtonPress}
            onPressOut={animateButtonRelease}
          >
            <View style={styles.buttonInner}>
              <Ionicons name="add-circle" size={22} color="white" />
              <Text style={styles.addExpenseButtonText}>Add Transaction</Text>
            </View>

            <Animated.View
              style={[
                styles.buttonRipple,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: opacityAnim.interpolate({
                    inputRange: [0.8, 1],
                    outputRange: [0.2, 0],
                  }),
                },
              ]}
            />
          </TouchableOpacity>
        </Animated.View>
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                <Ionicons name="checkmark-circle" size={16} color="black" />
                <Text style={styles.balanceLabelText}>Total Income</Text>
              </View>
              <Text style={styles.balanceValue}>{formatVND(totalIncome)}</Text>
            </View>

            <View style={styles.balanceItem}>
              <View style={styles.balanceLabel}>
                <Ionicons name="arrow-down" size={16} color="black" />
                <Text style={styles.balanceLabelText}>Total Expense</Text>
              </View>
              <Text style={styles.expenseValue}>
                -{formatVND(totalExpense)}
              </Text>
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
            <TouchableOpacity onPress={handleBudgetEdit}>
              <Text style={styles.budgetLimit}>{formatVND(budgetLimit)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusContainer}>
            <Ionicons name="checkmark-circle" size={16} color="#00D09E" />
            <Text style={styles.statusText}>
              {expensePercentage}% Of Your Expenses, Looks Good.
            </Text>
          </View>
        </View>

        {/* Budget Edit Modal */}
        <Modal
          visible={isEditingBudget}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsEditingBudget(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContent}
              keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Ionicons name="wallet-outline" size={24} color="#00D09E" />
                  <Text style={styles.modalTitle}>Update Category Budget</Text>
                </View>
                <TouchableOpacity onPress={() => setIsEditingBudget(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Budget Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₫</Text>
                  <TextInput
                    style={styles.budgetInput}
                    value={formatInputValue(newBudget)}
                    onChangeText={handleBudgetInputChange}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#999"
                    autoFocus={true}
                  />
                </View>

                <Text style={styles.formattedPreview}>
                  {formatVND(parseInt(newBudget) || 0)}
                </Text>
                <Text style={styles.inputHelper}>
                  Enter the amount you want to set as budget for this category
                </Text>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsEditingBudget(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveBudget}
                >
                  <Text style={styles.saveButtonText}>Save Budget</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* Content container */}
        <View style={styles.content}>{renderContent()}</View>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <View style={styles.modalContainer}>
            <Animated.View
              style={[
                styles.modalBackdrop,
                { opacity: deleteModalBackdropOpacity },
              ]}
              pointerEvents={showDeleteModal ? "auto" : "none"}
            >
              <TouchableWithoutFeedback onPress={closeDeleteModal}>
                <View style={styles.backdropTouchable} />
              </TouchableWithoutFeedback>
            </Animated.View>

            <Animated.View
              style={[
                styles.deleteModalContent,
                {
                  opacity: deleteModalOpacity,
                  transform: [{ scale: deleteModalScale }],
                },
              ]}
            >
              <View style={styles.deleteModalHeader}>
                <Ionicons name="trash-outline" size={40} color="#FFFFFF" />
                <Text style={styles.deleteModalTitle}>Confirm Delete</Text>
              </View>

              <View style={styles.deleteModalBody}>
                <Text style={styles.modalText}>
                  Are you sure you want to delete this transaction? This action
                  cannot be undone.
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteModalCancelButton]}
                    onPress={closeDeleteModal}
                    disabled={deleteLoading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={confirmDelete}
                    disabled={deleteLoading}
                    activeOpacity={0.8}
                  >
                    {deleteLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#FFFFFF"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
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
    color: "black",
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
    color: "black",
    marginLeft: 4,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "black",
  },
  expenseValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "black",
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
    color: "black",
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "black",
    borderRadius: 4,
  },
  budgetLimit: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
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
  transactionItemContainer: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 0, // Removed since parent handles the border radius
    marginBottom: 0, // Remove margin as it's handled by container
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: 76,
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 22,
    backgroundColor: "#00D09E",
    borderRadius: 30,
    shadowColor: "#00D09E",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    minWidth: 180,
  },
  addButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  addExpenseButton: {
    backgroundColor: "#00D09E",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00D09E",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,
    elevation: 11,
    position: "relative",
    overflow: "hidden",
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  addExpenseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 0,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalBody: {
    marginBottom: 20,
  },
  budgetInput: {
    flex: 1,
    fontSize: 24,
    color: "#333",
    fontWeight: "600",
    padding: 0,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 15,
    marginBottom: 15,
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    flex: 1,
    alignItems: "center",
    minWidth: 100,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  saveButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#00D09E",
    shadowColor: "#00D09E",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1.5,
    alignItems: "center",
    minWidth: 140,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  inputLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
  },
  currencySymbol: {
    fontSize: 20,
    color: "#333",
    marginRight: 8,
  },
  formattedPreview: {
    fontSize: 16,
    color: "#00D09E",
    marginTop: 8,
    fontWeight: "600",
    textAlign: "right",
  },
  inputHelper: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
  },
  fabContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    shadowColor: "#00D09E",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.51,
    shadowRadius: 13.16,
    elevation: 20,
  },
  buttonRipple: {
    position: "absolute",
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    borderRadius: 30,
    zIndex: 1,
  },
  swipeActionsContainer: {
    flexDirection: "row",
    width: 140,
    height: 76,
    overflow: "hidden",
  },
  swipeActionWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 76,
  },
  editActionWrapper: {
    backgroundColor: "#3498db",
  },
  deleteActionWrapper: {
    backgroundColor: "#e74c3c",
    marginLeft: 1,
  },
  swipeAction: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1001,
  },
  deleteModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 0,
    width: "85%",
    maxWidth: 320,
    zIndex: 1002,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: "hidden",
  },
  deleteModalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#ff6b6b",
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  deleteModalBody: {
    padding: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 12,
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 14,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    flex: 1,
  },
  deleteModalCancelButton: {
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  deleteButton: {
    backgroundColor: "#ff6b6b",
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  backdropTouchable: {
    width: "100%",
    height: "100%",
  },
});

export default CategoryDetailScreen;
