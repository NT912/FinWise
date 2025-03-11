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
  return (
    <View style={styles.filterContainer}>
      {["Daily", "Weekly", "Monthly"].map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            selectedFilter === filter && styles.filterButtonActive,
          ]}
          onPress={() =>
            onFilterChange(filter as "Daily" | "Weekly" | "Monthly")
          }
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === filter && styles.filterTextActive,
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
