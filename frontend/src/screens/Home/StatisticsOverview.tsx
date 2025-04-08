import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

type StatisticsOverviewProps = {
  savingsOnGoals?: number;
  revenueLostWeek?: number;
  foodLastWeek?: number;
  isLoading?: boolean;
  goalPercentage?: number;
};

const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({
  savingsOnGoals,
  revenueLostWeek,
  foodLastWeek,
  isLoading = false,
  goalPercentage = 0,
}) => {
  // Circular progress calculations
  const size = 60;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = goalPercentage / 100;
  const strokeDashoffset = circumference * (1 - progress);

  // Determine if we should show the progress circle
  const shouldShowProgress = !isLoading && goalPercentage > 0;

  return (
    <View style={styles.container}>
      <View style={styles.statisticsCard}>
        <View style={styles.leftSection}>
          <View style={styles.circularProgressContainer}>
            {shouldShowProgress ? (
              <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Progress Circle */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#000000"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  transform={`rotate(-90, ${size / 2}, ${size / 2})`}
                />
              </Svg>
            ) : null}
            <View style={styles.iconContainer}>
              <Ionicons name="car-outline" size={24} color="#000000" />
            </View>
          </View>
          <Text style={styles.label}>Savings</Text>
          <Text style={styles.sublabel}>On Goals</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.rightSection}>
          <View style={styles.statisticsItem}>
            <View style={styles.itemIconContainer}>
              <Ionicons name="cash-outline" size={18} color="#000000" />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemLabel}>Revenue Last Week</Text>
              {isLoading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text style={styles.amount}>
                  {revenueLostWeek !== undefined
                    ? `$${revenueLostWeek.toFixed(2)}`
                    : "-"}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.horizontalDivider} />

          <View style={styles.statisticsItem}>
            <View style={styles.itemIconContainer}>
              <Ionicons name="restaurant-outline" size={18} color="#000000" />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemLabel}>Food Last Week</Text>
              {isLoading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text style={styles.amount}>
                  {foodLastWeek !== undefined
                    ? `-$${foodLastWeek.toFixed(2)}`
                    : "-"}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statisticsCard: {
    backgroundColor: "#00D09E",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  rightSection: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "center",
  },
  divider: {
    width: 2,
    alignSelf: "stretch",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginVertical: 8,
  },
  horizontalDivider: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginVertical: 12,
  },
  circularProgressContainer: {
    width: 60,
    height: 60,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  label: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "700",
    textAlign: "center",
  },
  sublabel: {
    fontSize: 12,
    color: "#000000",
    opacity: 0.8,
    textAlign: "center",
  },
  statisticsItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 13,
    color: "#000000",
    opacity: 0.8,
    marginBottom: 2,
  },
  amount: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "700",
  },
});

export default StatisticsOverview;
