import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  Animated,
  StatusBar,
  View,
  TextInput,
  Platform,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { NavigationProp } from "@react-navigation/native";
import {
  RootStackParamList,
  CategoryStackParamList,
  HomeStackParamList,
} from "../../navigation/AppNavigator";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";
import { fetchHomeData, fetchTransactions } from "../../services/homeService";
import { IconName } from "../../types";
import { Category } from "../../types/category";
import LoadingIndicator from "../../components/LoadingIndicator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkCurrentToken } from "../../services/apiService";
import {
  showSuccess,
  showError,
  showWarning,
  showConfirmation,
} from "../../services/alertService";
import { formatVND } from "../../utils/formatters";
import * as savingService from "../../services/savingService";

// Import styles
import categoryStyles from "../../styles/category/categoryStyles";

// Import custom components
import AppHeader from "../../components/common/AppHeader";
import CategoryTabs from "../../components/category/CategoryTabs";
import CategoryItem from "../../components/category/CategoryItem";
import CategoryFormModal from "../../components/category/CategoryFormModal";
import DeleteConfirmationModal from "../../components/category/DeleteConfirmationModal";
import EmptyCategories from "../../components/category/EmptyCategories";
import CategoryBudgetModal from "../../components/category/CategoryBudgetModal";
import CategoryRulesModal from "../../components/category/CategoryRulesModal";
import IconPicker from "../../components/category/IconPicker";
import ColorPicker from "../../components/category/ColorPicker";
import TabBar from "../../components/TabBar";

// Import the getCategoryColor utility
import { getCategoryColor, CATEGORY_COLORS } from "../../utils/categoryColors";

// Thêm styles cho CategoryItem dùng trong CategoryScreen
const styles = StyleSheet.create({
  categoryItemContainer: {
    width: "32%",
    aspectRatio: 1,
    backgroundColor: "#00D09E",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    margin: "0.6%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#007AFF",
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
  },
});

// Add modal styles
const modalStyles = StyleSheet.create({
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
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
  budgetInput: {
    flex: 1,
    fontSize: 24,
    color: "#333",
    fontWeight: "600",
    padding: 0,
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
});

const CategoryScreen = () => {
  const navigation =
    useNavigation<
      NavigationProp<RootStackParamList & CategoryStackParamList>
    >();
  const isFocused = useIsFocused();

  // Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "budget" | "transactions">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [isRulesModalVisible, setIsRulesModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isIconPickerVisible, setIsIconPickerVisible] = useState(false);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<IconName>(
    "home" as IconName
  );
  const [selectedColor, setSelectedColor] = useState("#00D09E");
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "expense" | "income",
    icon: "home" as IconName,
    color: "#00D09E",
    budget: 0,
    rules: [] as string[],
  });

  // User data state
  const [userData, setUserData] = useState({
    userName: "",
    userAvatar: "",
    totalIncome: 0,
    totalExpense: 0,
  });

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const translateY = useState(new Animated.Value(20))[0];

  // Modal states
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] =
    useState<IconName>("cart-outline");
  const [newCategoryColor, setNewCategoryColor] = useState("#FF6B6B");
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);

  // Animation values for delete modal
  const deleteModalScale = useState(new Animated.Value(1))[0];
  const deleteModalOpacity = useState(new Animated.Value(1))[0];

  // New state for total budget
  const [totalBudget, setTotalBudget] = useState<number>(0);

  // Load initial data
  useEffect(() => {
    if (isFocused) {
      loadInitialData();
    }
  }, [isFocused]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadUserData(), loadCategories()]);
      startContentAnimation();
    } catch (error) {
      console.error("Error loading initial data:", error);
      showError("Error", "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort categories
  const getFilteredAndSortedCategories = useCallback(() => {
    // Hiển thị tất cả categories thay vì lọc theo tab
    let filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort categories
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "budget") {
        return sortOrder === "asc"
          ? (a.budget || 0) - (b.budget || 0)
          : (b.budget || 0) - (a.budget || 0);
      } else {
        return sortOrder === "asc"
          ? (a.transactionCount || 0) - (b.transactionCount || 0)
          : (b.transactionCount || 0) - (a.transactionCount || 0);
      }
    });

    // Define standard categories with correct icons
    const standardCategories = [
      { name: "Food", icon: "restaurant-outline" as IconName },
      { name: "Transport", icon: "bus-outline" as IconName },
      { name: "Medicine", icon: "medical-outline" as IconName },
      { name: "Groceries", icon: "basket-outline" as IconName },
      { name: "Rent", icon: "home-outline" as IconName },
      { name: "Gifts", icon: "gift-outline" as IconName },
      { name: "Savings", icon: "wallet-outline" as IconName },
      { name: "Entertainment", icon: "ticket-outline" as IconName },
      { name: "More", icon: "add-outline" as IconName },
    ];

    // Thêm nút "Add Category" như một item cuối cùng
    const addCategoryItem: Category = {
      _id: "add-category-button",
      name: "More",
      icon: "add-outline" as IconName,
      color: "#63B0FF",
      type: "expense",
      isAddButton: true,
      userId: "placeholder",
    };

    // Cập nhật màu sắc và icon cho tất cả các categories
    const updatedFiltered = filtered.map((category) => {
      const standardCategory = standardCategories.find(
        (sc) => sc.name.toLowerCase() === category.name.toLowerCase()
      );

      return {
        ...category,
        color: "#63B0FF", // Consistent blue color for all categories
        icon: standardCategory ? standardCategory.icon : category.icon,
      };
    });

    return [...updatedFiltered, addCategoryItem];
  }, [categories, searchQuery, sortBy, sortOrder]);

  // Load user data from API
  const loadUserData = async () => {
    try {
      const homeData = await fetchHomeData();

      // Calculate total income from transactions
      const transactions = await fetchTransactions();
      const totalIncome = transactions.reduce(
        (sum: number, transaction: { type: string; amount: number }) => {
          if (transaction.type === "income") {
            return sum + transaction.amount;
          }
          return sum;
        },
        0
      );

      setUserData({
        userName: homeData.userName || "User",
        userAvatar: homeData.userAvatar || "",
        totalIncome: totalIncome,
        totalExpense: homeData.totalExpense || 0,
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Load categories from API
  const loadCategories = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      showError("Error", "Failed to load categories");
    }
  };

  // Start content animation
  const startContentAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadUserData(), loadCategories()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
      showError("Error", "Failed to refresh data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Category form handlers
  const handleAddCategory = () => {
    setModalMode("add");
    setNewCategoryName("");
    setNewCategoryIcon("cart-outline");
    setNewCategoryColor("#FF6B6B");
    setSelectedCategory(null);
    setIsModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon);
    setNewCategoryColor(category.color);
    setIsModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      showWarning("Missing Information", "Please enter a category name");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      // Decode token to get userId
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userId = decodedToken.userId;

      if (modalMode === "add") {
        const newCategory = {
          name: newCategoryName.trim(),
          icon: newCategoryIcon,
          color: newCategoryColor,
          type: "expense" as "expense" | "income",
          userId: userId,
        };
        await createCategory(newCategory);
        showSuccess("Success", "New category created successfully");
      } else if (modalMode === "edit" && selectedCategory) {
        const updatedCategory = {
          name: newCategoryName.trim(),
          icon: newCategoryIcon,
          color: newCategoryColor,
          budget: selectedCategory.budget,
          rules: selectedCategory.rules,
          userId: userId,
        };
        await updateCategory(selectedCategory._id, updatedCategory);
        showSuccess("Success", "Category updated successfully");
      }

      // Close modal first
      setIsModalVisible(false);
      setIconPickerVisible(false);
      setColorPickerVisible(false);

      // Then reload categories
      await loadCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);

      // Handle specific error cases
      if (error.response?.data?.message === "Category name already exists") {
        showError(
          "Name Already Exists",
          "A category with this name already exists. Please choose a different name."
        );
        return;
      }

      // If we get here, it means the category was created but we couldn't parse the response
      // This is a non-critical error since the category was actually created
      console.log("Category was created but response parsing failed:", error);
      showSuccess("Success", "New category created successfully");
      setIsModalVisible(false);
      setIconPickerVisible(false);
      setColorPickerVisible(false);
      await loadCategories();
    }
  };

  // Delete handlers
  const showDeleteConfirmation = (category: Category) => {
    if (category.isDefault) {
      showWarning("Cannot Delete", "Default categories cannot be deleted");
      return;
    }

    showConfirmation(
      "Confirm Deletion",
      `Are you sure you want to delete the category "${category.name}"?`,
      async () => {
        try {
          await deleteCategory(category._id);
          await loadCategories();
          showSuccess("Success", "Category deleted successfully");
        } catch (error) {
          console.error("Error deleting category:", error);
          showError(
            "Error",
            "Failed to delete category. Please try again later."
          );
        }
      },
      {
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "error",
      }
    );
  };

  // Budget handlers
  const handleSetBudget = (category: Category) => {
    setSelectedCategory(category);
    setIsBudgetModalVisible(true);
  };

  const handleUpdateBudget = async () => {
    if (!selectedCategory) return;

    try {
      await updateCategory(selectedCategory._id, { budget: formData.budget });
      showSuccess("Success", "Budget updated successfully");
      setIsBudgetModalVisible(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error) {
      handleError(error, "Failed to update budget");
    }
  };

  // Rules handlers
  const handleSetRules = (category: Category) => {
    setSelectedCategory(category);
    setIsRulesModalVisible(true);
  };

  const handleUpdateRules = async () => {
    if (!selectedCategory) return;

    try {
      const formattedRules = formData.rules.map((rule) => ({
        keyword: rule,
        isEnabled: true,
      }));
      await updateCategory(selectedCategory._id, { rules: formattedRules });
      showSuccess("Success", "Rules updated successfully");
      setIsRulesModalVisible(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error) {
      handleError(error, "Failed to update rules");
    }
  };

  // Icon and Color picker handlers
  const handleIconPickerToggle = useCallback(() => {
    console.log("Toggling icon picker");
    setIconPickerVisible((prev) => {
      const newValue = !prev;
      console.log("Icon picker visibility changing to:", newValue);
      return newValue;
    });
  }, []);

  const handleColorPickerToggle = useCallback(() => {
    console.log("Toggling color picker");
    setColorPickerVisible((prev) => {
      const newValue = !prev;
      console.log("Color picker visibility changing to:", newValue);
      return newValue;
    });
  }, []);

  const handleIconChange = useCallback((icon: IconName) => {
    console.log("Icon changed to:", icon);
    setNewCategoryIcon(icon);
    setIconPickerVisible(false);
  }, []);

  const handleColorChange = useCallback((color: string) => {
    console.log("Color changed to:", color);
    setNewCategoryColor(color);
    setColorPickerVisible(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    console.log("Closing category modal");
    setIsModalVisible(false);
    setIconPickerVisible(false);
    setColorPickerVisible(false);
  }, []);

  // Render category item
  const renderCategoryItem = ({ item }: { item: Category }) => {
    if (item.isAddButton) {
      return (
        <TouchableOpacity
          style={styles.categoryItemContainer}
          onPress={handleAddCategory}
        >
          <View style={styles.categoryIcon}>
            <Ionicons name={item.icon} size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.categoryName}>{item.name}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <CategoryItem
        category={item}
        onEdit={handleEditCategory}
        onDelete={showDeleteConfirmation}
        onSetBudget={handleSetBudget}
        onSetRules={handleSetRules}
      />
    );
  };

  // Render modals
  const renderModals = useCallback(() => {
    return (
      <>
        <CategoryFormModal
          visible={isModalVisible}
          mode={modalMode}
          onClose={handleCloseModal}
          onSave={handleSaveCategory}
          name={newCategoryName}
          onNameChange={setNewCategoryName}
          icon={newCategoryIcon}
          onIconChange={handleIconChange}
          color={newCategoryColor}
          onColorChange={handleColorChange}
          iconPickerVisible={iconPickerVisible}
          onIconPickerToggle={handleIconPickerToggle}
          colorPickerVisible={colorPickerVisible}
          onColorPickerToggle={handleColorPickerToggle}
        />

        {iconPickerVisible && (
          <IconPicker
            visible={iconPickerVisible}
            onClose={handleIconPickerToggle}
            onSelectIcon={handleIconChange}
            selectedIcon={newCategoryIcon}
            selectedColor={newCategoryColor}
          />
        )}

        {colorPickerVisible && (
          <ColorPicker
            visible={colorPickerVisible}
            onClose={handleColorPickerToggle}
            onSelectColor={handleColorChange}
            selectedColor={newCategoryColor}
          />
        )}

        <DeleteConfirmationModal
          visible={isDeleteModalVisible}
          categoryName={categoryToDelete?.name}
          animationValues={{
            scale: deleteModalScale,
            opacity: deleteModalOpacity,
          }}
          onCancel={() => setIsDeleteModalVisible(false)}
          onConfirm={() => {
            setIsDeleteModalVisible(false);
            if (categoryToDelete) {
              showDeleteConfirmation(categoryToDelete);
            }
          }}
        />

        <CategoryBudgetModal
          visible={isBudgetModalVisible}
          category={selectedCategory}
          onClose={() => setIsBudgetModalVisible(false)}
          onSave={handleUpdateBudget}
        />

        <CategoryRulesModal
          visible={isRulesModalVisible}
          category={selectedCategory}
          onClose={() => setIsRulesModalVisible(false)}
          onSave={handleUpdateRules}
        />
      </>
    );
  }, [
    isModalVisible,
    modalMode,
    newCategoryName,
    newCategoryIcon,
    newCategoryColor,
    iconPickerVisible,
    colorPickerVisible,
    isDeleteModalVisible,
    isBudgetModalVisible,
    isRulesModalVisible,
    categoryToDelete,
    selectedCategory,
  ]);

  // Add button component inside the content container
  const renderAddButton = () => {
    // Đã di chuyển nút thêm danh mục vào thanh toolbar, nên không cần hiển thị floating button nữa
    return null;
  };

  // Render financial summary component
  const renderFinancialSummary = () => {
    const expensePercentage =
      userData.totalIncome > 0
        ? Math.min(
            Math.round((userData.totalExpense / userData.totalIncome) * 100),
            100
          )
        : 0;

    return (
      <View style={categoryStyles.financialSummaryContainer}>
        <View style={categoryStyles.balanceContainer}>
          <View style={categoryStyles.balanceItem}>
            <Text style={categoryStyles.balanceLabel}>
              <Ionicons name="wallet-outline" size={14} color="#444" /> Total
              Income
            </Text>
            <Text style={categoryStyles.balanceValue}>
              {formatVND(userData.totalIncome)}
            </Text>
          </View>

          <View style={categoryStyles.balanceDivider} />

          <View style={categoryStyles.balanceItem}>
            <Text style={categoryStyles.balanceLabel}>
              <Ionicons name="trending-down-outline" size={14} color="#444" />{" "}
              Total Expense
            </Text>
            <Text style={[categoryStyles.balanceValue, { color: "#e74c3c" }]}>
              {formatVND(userData.totalExpense)}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={categoryStyles.progressContainer}>
          <View style={categoryStyles.progressBar}>
            <View
              style={[
                categoryStyles.progressFill,
                { width: `${expensePercentage}%` },
              ]}
            />
          </View>
          <View
            style={[
              categoryStyles.progressLabels,
              { justifyContent: "space-between", alignItems: "center" },
            ]}
          ></View>
        </View>

        <Text style={categoryStyles.budgetInfoText}>
          <Ionicons
            name="information-circle-outline"
            size={14}
            color="#00D09E"
          />{" "}
          {expensePercentage}% Of Your Income
          {expensePercentage < 50
            ? ", Looks Good!"
            : expensePercentage < 80
            ? ", Be Careful!"
            : ", Too High!"}
        </Text>
      </View>
    );
  };

  const handleError = (error: any, message: string) => {
    console.error(message, error);
    showError("Error", message);
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      await deleteCategory(category._id);
      showSuccess("Success", "Category deleted successfully");
      loadCategories();
    } catch (error) {
      handleError(error, "Failed to delete category");
    }
  };

  // Thêm hàm xử lý khi nhấn vào nút thông báo
  const handleNotificationPress = () => {
    // Điều hướng trực tiếp đến màn hình NotificationScreen ở root navigator
    navigation.navigate("NotificationScreen" as any);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={[categoryStyles.container, { backgroundColor: "#00D09E" }]}
      >
        <StatusBar barStyle="light-content" backgroundColor="#00D09E" />

        <View style={categoryStyles.categoryHeader}>
          <View style={{ width: 40 }} />
          <Text
            style={[
              categoryStyles.headerText,
              { flex: 1, textAlign: "center", color: "#000000" },
            ]}
          >
            Categories
          </Text>
          <TouchableOpacity
            style={categoryStyles.notificationButton}
            onPress={handleNotificationPress}
          >
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {renderFinancialSummary()}

        <View
          style={[
            categoryStyles.contentContainer,
            {
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              paddingHorizontal: 12,
              paddingTop: 20,
              paddingBottom: 0,
              marginTop: 0,
              flex: 1,
              justifyContent: "flex-start",
            },
          ]}
        >
          <View
            style={[
              categoryStyles.mainContainer,
              { flex: 1, justifyContent: "flex-start", paddingBottom: 0 },
            ]}
          >
            <View
              style={[
                categoryStyles.sectionHeader,
                { marginBottom: 0, paddingBottom: 0 },
              ]}
            >
              <Text style={categoryStyles.sectionTitle}>Categories</Text>
              <Text style={categoryStyles.sectionDescription}>
                {
                  getFilteredAndSortedCategories().filter(
                    (cat) => !cat.isAddButton
                  ).length
                }{" "}
                categories
              </Text>
            </View>

            {loading ? (
              <LoadingIndicator />
            ) : (
              <Animated.View
                style={[
                  categoryStyles.listContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }, { translateY }],
                    flex: 1,
                    marginTop: 0,
                    justifyContent: "flex-start",
                    paddingBottom: 0,
                  },
                ]}
              >
                <FlatList
                  data={getFilteredAndSortedCategories()}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item) => item._id}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                  ListEmptyComponent={
                    <EmptyCategories onAddCategory={handleAddCategory} />
                  }
                  contentContainerStyle={[
                    categoryStyles.listContent,
                    {
                      flexGrow: 1,
                      paddingBottom: 0,
                      paddingTop: 0,
                      justifyContent: "flex-start",
                    },
                  ]}
                  numColumns={3}
                  columnWrapperStyle={{ justifyContent: "flex-start" }}
                  showsVerticalScrollIndicator={false}
                />
              </Animated.View>
            )}

            {renderAddButton()}
          </View>
        </View>

        {renderModals()}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default CategoryScreen;
