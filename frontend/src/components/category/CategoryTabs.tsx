import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CategoryTabsProps {
  activeTab: "expense" | "income";
  onTabChange: (tab: "expense" | "income") => void;
}

const CategoryTabs = ({ activeTab, onTabChange }: CategoryTabsProps) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "expense" && styles.activeTabButton,
        ]}
        onPress={() => onTabChange("expense")}
      >
        <MaterialCommunityIcons
          name="cart-outline"
          size={22}
          color={activeTab === "expense" ? "#00C897" : "#888"}
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "expense" && styles.activeTabText,
          ]}
        >
          Expense
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "income" && styles.activeTabButton,
        ]}
        onPress={() => onTabChange("income")}
      >
        <MaterialCommunityIcons
          name="cash-plus"
          size={22}
          color={activeTab === "income" ? "#00C897" : "#888"}
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "income" && styles.activeTabText,
          ]}
        >
          Income
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginHorizontal: 16,
    marginBottom: 15,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: "rgba(0, 200, 151, 0.15)",
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#888",
  },
  activeTabText: {
    color: "#00C897",
    fontWeight: "bold",
  },
});

export default CategoryTabs;
