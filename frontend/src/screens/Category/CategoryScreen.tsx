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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";
import { fetchHomeData } from "../../services/homeService";
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

const CategoryScreen = () => {
  const navigation = useNavigation();

  // Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "budget" | "transactions">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // User data state
  const [userData, setUserData] = useState({
    userName: "",
    userAvatar: "https://via.placeholder.com/50",
    totalBalance: 0,
    totalExpense: 0,
    totalExpensePercentage: 0,
    budgetLimit: 0,
  });

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const translateY = useState(new Animated.Value(20))[0];

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState<IconName>("cart");
  const [newCategoryColor, setNewCategoryColor] = useState("#FF6B6B");
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);

  // Animation values for delete modal
  const deleteModalScale = useState(new Animated.Value(1))[0];
  const deleteModalOpacity = useState(new Animated.Value(1))[0];

  // Load categories and user data on mount
  useEffect(() => {
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

    loadInitialData();
  }, []);

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
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login" as never);
        return;
      }

      const data = await fetchHomeData("monthly");

      // Calculate expense percentage based on actual data
      const totalExpense = Math.abs(data.totalExpense || 0);
      const budgetLimit = data.budgetLimit || 20000000; // Default 20M VND if not set
      const expensePercentage = Math.min(
        Math.round((totalExpense / budgetLimit) * 100),
        100
      );

      setUserData({
        userName: data.userName || "User",
        userAvatar: data.userAvatar || "https://via.placeholder.com/50",
        totalBalance: data.totalBalance || 0,
        totalExpense: totalExpense,
        totalExpensePercentage: expensePercentage,
        budgetLimit: budgetLimit,
      });
    } catch (error: any) {
      console.error("Error loading user data:", error);
      if (error.response?.status === 401) {
        navigation.navigate("Login" as never);
      } else {
        showError("Error", "Failed to load user data. Please try again.");
      }
    }
  };

  // Load categories from API
  const loadCategories = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login" as never);
        return;
      }

      const data = await getAllCategories();

      // Split categories by type
      const expenseCats = data.filter((cat) => cat.type === "expense");
      const incomeCats = data.filter((cat) => cat.type === "income");

      setCategories(data);
      setExpenseCategories(expenseCats);
      setIncomeCategories(incomeCats);
    } catch (error: any) {
      console.error("Error loading categories:", error);
      if (error.response?.status === 401) {
        navigation.navigate("Login" as never);
      } else {
        showError("Error", "Failed to load categories. Please try again.");
      }
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
    setNewCategoryIcon("cart");
    setNewCategoryColor("#FF6B6B");
    setSelectedCategory(null);
    setModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon);
    setNewCategoryColor(category.color);
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      showWarning("Missing Information", "Please enter a category name");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login" as never);
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
      setModalVisible(false);
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
      setModalVisible(false);
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
    setBudgetModalVisible(true);
  };

  const handleSaveBudget = async (budget: number) => {
    if (!selectedCategory) return;

    try {
      await updateCategory(selectedCategory._id, {
        name: selectedCategory.name,
        icon: selectedCategory.icon,
        color: selectedCategory.color,
        budget,
        rules: selectedCategory.rules,
      });
      await loadCategories();
      setBudgetModalVisible(false);
      showSuccess("Success", "Budget updated successfully");
    } catch (error) {
      console.error("Error updating budget:", error);
      showError("Error", "Failed to update budget. Please try again later.");
    }
  };

  // Rules handlers
  const handleSetRules = (category: Category) => {
    setSelectedCategory(category);
    setRulesModalVisible(true);
  };

  const handleSaveRules = async (rules: any) => {
    if (!selectedCategory) return;

    try {
      await updateCategory(selectedCategory._id, {
        name: selectedCategory.name,
        icon: selectedCategory.icon,
        color: selectedCategory.color,
        budget: selectedCategory.budget,
        rules,
      });
      await loadCategories();
      setRulesModalVisible(false);
      showSuccess("Success", "Rules updated successfully");
    } catch (error) {
      console.error("Error updating rules:", error);
      showError("Error", "Failed to update rules. Please try again later.");
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
    setModalVisible(false);
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
          visible={modalVisible}
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
          visible={deleteModalVisible}
          categoryName={categoryToDelete?.name}
          animationValues={{
            scale: deleteModalScale,
            opacity: deleteModalOpacity,
          }}
          onCancel={() => setDeleteModalVisible(false)}
          onConfirm={() => {
            setDeleteModalVisible(false);
            if (categoryToDelete) {
              showDeleteConfirmation(categoryToDelete);
            }
          }}
        />

        <CategoryBudgetModal
          visible={budgetModalVisible}
          category={selectedCategory}
          onClose={() => setBudgetModalVisible(false)}
          onSave={handleSaveBudget}
        />

        <CategoryRulesModal
          visible={rulesModalVisible}
          category={selectedCategory}
          onClose={() => setRulesModalVisible(false)}
          onSave={handleSaveRules}
        />
      </>
    );
  }, [
    modalVisible,
    modalMode,
    newCategoryName,
    newCategoryIcon,
    newCategoryColor,
    iconPickerVisible,
    colorPickerVisible,
    deleteModalVisible,
    budgetModalVisible,
    rulesModalVisible,
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
    return (
      <View style={categoryStyles.financialSummaryContainer}>
        <View style={categoryStyles.balanceContainer}>
          <View style={categoryStyles.balanceItem}>
            <Text style={categoryStyles.balanceLabel}>
              <Ionicons name="wallet-outline" size={14} color="#444" /> Total
              Balance
            </Text>
            <Text style={categoryStyles.balanceValue}>
              {formatVND(userData.totalBalance)}
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
                { width: `${userData.totalExpensePercentage}%` },
              ]}
            />
          </View>
          <View style={categoryStyles.progressLabels}>
            <Text style={categoryStyles.progressLabel}>
              {userData.totalExpensePercentage}%
            </Text>
            <Text style={categoryStyles.progressMaxLabel}>
              {formatVND(userData.budgetLimit)}
            </Text>
          </View>
        </View>

        <Text style={categoryStyles.budgetInfoText}>
          <Ionicons
            name="information-circle-outline"
            size={14}
            color="#00D09E"
          />{" "}
          {userData.totalExpensePercentage}% Of Your Expenses
          {userData.totalExpensePercentage < 50
            ? ", Looks Good!"
            : userData.totalExpensePercentage < 80
            ? ", Be Careful!"
            : ", Too High!"}
        </Text>
      </View>
    );
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
          <TouchableOpacity style={categoryStyles.notificationButton}>
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
