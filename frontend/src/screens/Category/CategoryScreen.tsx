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
import { Category } from "../../types";
import LoadingIndicator from "../../components/LoadingIndicator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkCurrentToken } from "../../services/apiService";

// Import styles
import categoryStyles from "../../styles/category/categoryStyles";

// Import custom components
import CategoryHeader from "../../components/category/CategoryHeader";
import CategoryTabs from "../../components/category/CategoryTabs";
import CategoryItem from "../../components/category/CategoryItem";
import CategoryFormModal from "../../components/category/CategoryFormModal";
import DeleteConfirmationModal from "../../components/category/DeleteConfirmationModal";
import EmptyCategories from "../../components/category/EmptyCategories";

const CategoryScreen = () => {
  const navigation = useNavigation();

  // Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);

  // User data state
  const [userData, setUserData] = useState({
    userName: "",
    userAvatar: "https://via.placeholder.com/50", // Default placeholder
  });

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const translateY = useState(new Animated.Value(20))[0];

  // Tab state
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("cart");
  const [newCategoryColor, setNewCategoryColor] = useState("#FF6B6B");
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  // Load categories and user data on mount
  useEffect(() => {
    loadUserData();
    loadCategories();
  }, []);

  // Load user data from API
  const loadUserData = async () => {
    try {
      // Check authentication
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login" as never);
        return;
      }

      // Fetch user data from API
      const data = await fetchHomeData("monthly");
      console.log("User data fetched:", data); // Debug log

      const newUserData = {
        userName: data.userName || "User",
        userAvatar: data.userAvatar || "https://via.placeholder.com/50",
      };

      setUserData(newUserData);
      console.log("Updated user data:", newUserData); // Debug log với dữ liệu mới
    } catch (error) {
      console.error("Error loading user data:", error);
      // Fallback to default values if API call fails
      setUserData({
        userName: "User",
        userAvatar: "https://via.placeholder.com/50",
      });
    }
  };

  // Fetch categories from API
  const loadCategories = async () => {
    try {
      console.log("🔍 CategoryScreen - Bắt đầu tải danh sách danh mục...");
      setLoading(true);

      // Kiểm tra token hiện tại
      const hasToken = await checkCurrentToken();
      console.log("🔑 CategoryScreen - Trạng thái token:", hasToken);

      console.log("📊 CategoryScreen - Đang gọi API getAllCategories()...");
      const result = await getAllCategories();
      console.log(
        `📊 CategoryScreen - Đã tải ${result.length} danh mục thành công!`
      );
      setCategories(result);

      // Filter categories by type
      const expenseResult = result.filter((cat) => cat.type === "expense");
      const incomeResult = result.filter((cat) => cat.type === "income");
      console.log(
        `📊 Chi tiết: ${expenseResult.length} danh mục chi tiêu, ${incomeResult.length} danh mục thu nhập`
      );

      setExpenseCategories(expenseResult);
      setIncomeCategories(incomeResult);

      // Animate content when data is loaded
      startContentAnimation();
    } catch (error: any) {
      console.error("❌ Error loading categories:", error);

      // Log chi tiết hơn về lỗi
      console.error("❌ Chi tiết lỗi:", {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        stack: error.stack,
      });

      Alert.alert("Error", `Failed to load categories: ${error.message}`);
    } finally {
      setLoading(false);
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

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), loadCategories()]);
    setRefreshing(false);
  }, []);

  // ========== Category Form Handlers ==========
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
    // Validate inputs
    if (!newCategoryName.trim()) {
      Alert.alert("Invalid Input", "Please enter a category name");
      return;
    }

    try {
      if (modalMode === "add") {
        // Create new category
        await createCategory({
          name: newCategoryName.trim(),
          icon: newCategoryIcon,
          color: newCategoryColor,
          type: activeTab,
        });
        Alert.alert("Success", "Category created successfully");
      } else if (modalMode === "edit" && selectedCategory) {
        // Update existing category
        await updateCategory(selectedCategory._id, {
          name: newCategoryName.trim(),
          icon: newCategoryIcon,
          color: newCategoryColor,
        });
        Alert.alert("Success", "Category updated successfully");
      }

      // Refresh categories and close modal
      await loadCategories();
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving category:", error);
      Alert.alert("Error", "Failed to save category. Please try again later.");
    }
  };

  // ========== Delete Handlers ==========
  const showDeleteConfirmation = (category: Category) => {
    if (category.isDefault) {
      Alert.alert("Cannot Delete", "Default categories cannot be deleted.");
      return;
    }

    setCategoryToDelete(category);
    setDeleteModalVisible(true);

    // Start animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDeleteCancel = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDeleteModalVisible(false);
      setCategoryToDelete(null);
    });
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete._id);
      setDeleteModalVisible(false);
      setCategoryToDelete(null);
      // Refresh the list
      loadCategories();
      Alert.alert("Success", "Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      Alert.alert(
        "Error",
        "Failed to delete category. Please try again later."
      );
    }
  };

  // Show loading indicator while fetching data
  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={categoryStyles.container}>
      <StatusBar backgroundColor="#E3FFF8" barStyle="dark-content" />

      {/* Header */}
      <CategoryHeader
        title="Categories"
        subtitle="Manage your income and expense categories"
        userName={userData.userName}
        userAvatar={userData.userAvatar}
      />

      {/* Tabs */}
      <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content with animations */}
      <Animated.View
        style={[
          {
            flex: 1,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: translateY }],
          },
        ]}
      >
        <FlatList
          data={activeTab === "expense" ? expenseCategories : incomeCategories}
          renderItem={({ item, index }) => (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: Animated.multiply(
                      translateY,
                      new Animated.Value((index + 1) * 0.15)
                    ),
                  },
                ],
              }}
            >
              <CategoryItem
                category={item}
                onEdit={handleEditCategory}
                onDelete={showDeleteConfirmation}
              />
            </Animated.View>
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#00C897"]}
              tintColor="#00C897"
              progressBackgroundColor="#E3FFF8"
            />
          }
          ListEmptyComponent={
            <EmptyCategories
              categoryType={activeTab}
              onAddPress={handleAddCategory}
            />
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Floating action button */}
        <TouchableOpacity
          style={categoryStyles.floatingButton}
          onPress={handleAddCategory}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Category Form Modal */}
      <CategoryFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveCategory}
        mode={modalMode}
        categoryName={newCategoryName}
        onCategoryNameChange={setNewCategoryName}
        categoryIcon={newCategoryIcon}
        categoryColor={newCategoryColor}
        onShowIconPicker={() => setIconPickerVisible(!iconPickerVisible)}
        onShowColorPicker={() => setColorPickerVisible(!colorPickerVisible)}
        iconPickerVisible={iconPickerVisible}
        colorPickerVisible={colorPickerVisible}
        onIconSelect={(icon: string) => {
          setNewCategoryIcon(icon);
          setIconPickerVisible(false);
        }}
        onColorSelect={(color: string) => {
          setNewCategoryColor(color);
          setColorPickerVisible(false);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        categoryName={categoryToDelete?.name || ""}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteCategory}
        animationValues={{ fadeAnim, scaleAnim }}
      />
    </SafeAreaView>
  );
};

export default CategoryScreen;
