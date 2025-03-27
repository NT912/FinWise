import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import categoryStyles from "../../styles/category/categoryStyles";

interface EmptyCategoriesProps {
  categoryType: string;
  onAddPress: () => void;
}

const EmptyCategories = ({
  categoryType,
  onAddPress,
}: EmptyCategoriesProps) => {
  // Chọn icon phù hợp dựa vào loại danh mục
  const iconName = categoryType === "expense" ? "cart-outline" : "cash-plus";

  return (
    <View style={categoryStyles.emptyContainer}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={iconName}
          size={70}
          color="#00C897"
          style={styles.icon}
        />
      </View>
      <Text style={categoryStyles.emptyText}>
        No {categoryType} categories found. {"\n"}
        Would you like to add a new category?
      </Text>
      <TouchableOpacity style={categoryStyles.emptyButton} onPress={onAddPress}>
        <Ionicons name="add-circle" size={20} color="#00C897" />
        <Text style={categoryStyles.emptyButtonText}>Add New Category</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(0, 200, 151, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#00C897",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  icon: {
    opacity: 0.8,
  },
});

export default EmptyCategories;
