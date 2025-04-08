import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../styles/home/homeStyles";

interface FilterButtonsProps {
  selectedFilter: "Daily" | "Weekly" | "Monthly";
  onFilterChange: (filter: "Daily" | "Weekly" | "Monthly") => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  // Validate that selectedFilter is one of the allowed values
  const validFilter = ["Daily", "Weekly", "Monthly"].includes(selectedFilter)
    ? selectedFilter
    : "Monthly"; // Default to Monthly if invalid

  return (
    <View style={styles.filterContainer}>
      {["Daily", "Weekly", "Monthly"].map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            validFilter === filter && styles.filterButtonActive,
          ]}
          onPress={() =>
            onFilterChange(filter as "Daily" | "Weekly" | "Monthly")
          }
        >
          <Text
            style={[
              styles.filterText,
              validFilter === filter && styles.filterTextActive,
            ]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default FilterButtons;
