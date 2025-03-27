import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../../types";

interface CategoryItemProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryItem = ({ category, onEdit, onDelete }: CategoryItemProps) => {
  return (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => onEdit(category)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryLeft}>
        <View
          style={[styles.iconContainer, { backgroundColor: category.color }]}
        >
          <Ionicons name={category.icon as any} size={24} color="#FFF" />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
      </View>

      <View style={styles.categoryRight}>
        {category.isDefault ? (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(category)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  categoryRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  defaultBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 10,
  },
  defaultText: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  deleteButton: {
    padding: 8,
    marginRight: 5,
  },
});

export default CategoryItem;
