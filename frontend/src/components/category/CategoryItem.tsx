import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../../types";
import categoryStyles from "../../styles/category/categoryStyles";
import { CATEGORY_COLORS } from "../../utils/categoryColors";
import { IconName } from "../../types";

interface CategoryItemProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onSetBudget: (category: Category) => void;
  onSetRules: (category: Category) => void;
}

// Function to get the appropriate icon for each category
const getCategoryIcon = (
  categoryName: string,
  defaultIcon: IconName
): IconName => {
  const name = categoryName.toLowerCase();

  if (name.includes("food")) return "restaurant-outline" as IconName;
  if (name.includes("transport")) return "bus-outline" as IconName;
  if (name.includes("medicine") || name.includes("health"))
    return "medical-outline" as IconName;
  if (name.includes("groceries")) return "basket-outline" as IconName;
  if (name.includes("rent") || name.includes("housing"))
    return "home-outline" as IconName;
  if (name.includes("gift")) return "gift-outline" as IconName;
  if (name.includes("saving")) return "wallet-outline" as IconName;
  if (name.includes("entertainment")) return "ticket-outline" as IconName;
  if (name.includes("more")) return "add-outline" as IconName;

  // Return the original icon if no match
  return defaultIcon;
};

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  onEdit,
  onDelete,
  onSetBudget,
  onSetRules,
}) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const progress = category.budget
    ? Math.min((category.transactionCount || 0) / category.budget, 1)
    : 0;

  // State cho xóa danh mục
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  // Xử lý khi người dùng ấn giữ
  const handleLongPress = () => {
    if (category.isDefault) {
      Alert.alert("Cannot Delete", "Default categories cannot be deleted", [
        { text: "OK", style: "cancel" },
      ]);
      return;
    }

    setIsLongPress(true);
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}" category?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setIsLongPress(false),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(category);
            setIsLongPress(false);
          },
        },
      ]
    );
  };

  const handlePressIn = () => {
    longPressTimeout.current = setTimeout(handleLongPress, 3000); // 3 giây
  };

  const handlePressOut = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  // Navigate to category detail screen
  const handleCategoryPress = () => {
    if (category.isAddButton) {
      onSetBudget(category); // This will trigger the add category modal
    } else {
      // Navigate to category detail screen
      navigation.navigate("CategoryDetail", {
        categoryId: category._id,
        categoryName: category.name,
        categoryIcon: category.icon,
        categoryColor: category.color,
      });
    }
  };

  // Get the appropriate icon name based on category
  const iconName = getCategoryIcon(category.name, category.icon);

  // Nếu là nút "More", không hiển thị ellipsis menu
  if (category.isAddButton) {
    return (
      <TouchableOpacity
        style={[
          styles.categoryItemContainer,
          isLongPress && { borderColor: "#ff3b30", borderWidth: 2 },
        ]}
        onPress={handleCategoryPress}
      >
        <View style={styles.categoryIcon}>
          <Ionicons name={iconName} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.categoryItemContainer,
        isLongPress && { borderColor: "#ff3b30", borderWidth: 2 },
      ]}
      onPress={handleCategoryPress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={3000}
    >
      <View style={styles.categoryContent}>
        <View style={styles.categoryIcon}>
          <Ionicons name={iconName} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryItemContainer: {
    width: "32%",
    aspectRatio: 1,
    backgroundColor: "#63B0FF",
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
  categoryContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
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

export default CategoryItem;
