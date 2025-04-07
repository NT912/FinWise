import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type StatisticsOverviewProps = {
  savingsOnGoals: number;
  revenueLostWeek: number;
  foodLastWeek: number;
};

const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({
  savingsOnGoals,
  revenueLostWeek,
  foodLastWeek,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.statisticsCard}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="car-outline" size={24} color="#00D09E" />
          </View>
          <Text style={styles.label}>Savings</Text>
          <Text style={styles.sublabel}>On Goals</Text>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.statisticsItem}>
            <Ionicons name="cash-outline" size={20} color="#00D09E" />
            <Text style={styles.itemLabel}>Revenue Last Week</Text>
            <Text style={styles.amount}>${revenueLostWeek.toFixed(2)}</Text>
          </View>

          <View style={styles.statisticsItem}>
            <Ionicons name="restaurant-outline" size={20} color="#00D09E" />
            <Text style={styles.itemLabel}>Food Last Week</Text>
            <Text style={[styles.amount, { color: "#FF0000" }]}>
              -${foodLastWeek.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
  },
  statisticsCard: {
    backgroundColor: "#00D09E",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftSection: {
    alignItems: "center",
    flex: 1,
  },
  rightSection: {
    flex: 2,
    marginLeft: 20,
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  sublabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 2,
  },
  statisticsItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 8,
    flex: 1,
  },
  amount: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default StatisticsOverview;
