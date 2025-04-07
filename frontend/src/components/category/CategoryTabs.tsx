import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CategoryTabsProps {
  activeTab: "expense" | "income";
  onTabChange: (tab: "expense" | "income") => void;
  sortBy: "name" | "budget" | "transactions";
  onSortChange: (sortBy: "name" | "budget" | "transactions") => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeTab,
  onTabChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "expense" && styles.activeTab]}
          onPress={() => onTabChange("expense")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "expense" && styles.activeTabText,
            ]}
          >
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "income" && styles.activeTab]}
          onPress={() => onTabChange("income")}
        >
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

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "name" && styles.activeSortButton,
          ]}
          onPress={() => onSortChange("name")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "name" && styles.activeSortButtonText,
            ]}
          >
            Name
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "budget" && styles.activeSortButton,
          ]}
          onPress={() => onSortChange("budget")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "budget" && styles.activeSortButtonText,
            ]}
          >
            Budget
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "transactions" && styles.activeSortButton,
          ]}
          onPress={() => onSortChange("transactions")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "transactions" && styles.activeSortButtonText,
            ]}
          >
            Transactions
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginHorizontal: 4,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#E6F9F2",
    borderWidth: 1,
    borderColor: "#00D09E",
    ...Platform.select({
      ios: {
        shadowColor: "#00D09E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#00D09E",
    fontWeight: "600",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  activeSortButton: {
    backgroundColor: "#00D09E",
    borderColor: "#00D09E",
  },
  sortButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  activeSortButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
});

export default CategoryTabs;
