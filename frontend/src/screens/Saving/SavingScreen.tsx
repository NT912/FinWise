import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { formatVND } from "../../utils/format";
import { API_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

interface CategoryData {
  id: string;
  name: string;
  totalAmount: number;
  color: string;
}

interface SavingsData {
  totalSavings: number;
  categories: CategoryData[];
  monthlyData: {
    labels: string[];
    data: number[];
  };
}

const SavingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [savingAmount, setSavingAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savingsData, setSavingsData] = useState<SavingsData>({
    totalSavings: 0,
    categories: [],
    monthlyData: {
      labels: [],
      data: [],
    },
  });
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    loadSavingsData();
    // Get current month
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const currentDate = new Date();
    setCurrentMonth(monthNames[currentDate.getMonth()]);
  }, [selectedPeriod]);

  const loadSavingsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(
        `${API_URL}/api/savings/summary?period=${selectedPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch savings data");
      }

      const data = await response.json();
      if (data.success) {
        setSavingsData(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch savings data");
      }
    } catch (error) {
      console.error("Error loading savings data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load savings data"
      );
      // Set default data when there's an error
      setSavingsData({
        totalSavings: 0,
        categories: [],
        monthlyData: {
          labels: [],
          data: [],
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const handleAddSaving = () => {
    setIsModalVisible(true);
  };

  const handleSaveSaving = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      if (!savingAmount || isNaN(Number(savingAmount))) {
        throw new Error("Please enter a valid amount");
      }

      const response = await fetch(`${API_URL}/api/savings/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          goalName: `${currentMonth} Savings`,
          targetAmount: parseInt(savingAmount),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create saving goal");
      }

      setIsModalVisible(false);
      setSavingAmount("");
      await loadSavingsData(); // Reload data after saving
    } catch (error) {
      console.error("Error saving amount:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save amount"
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#00D09E" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D09E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00D09E" />

      {/* Green Section */}
      <View style={styles.greenSection}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddSaving}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Saving Goals</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Savings Overview */}
        <View style={styles.savingsCard}>
          <Text style={styles.cardTitle}>Total Savings</Text>
          <Text style={styles.savingsSubtitle}>{currentMonth}'s Savings</Text>
          <Text style={styles.savingsAmount}>
            {formatVND(savingsData.totalSavings)}
          </Text>
        </View>
      </View>

      {/* White Section */}
      <View style={styles.whiteSection}>
        <ScrollView style={styles.content}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {["daily", "weekly", "monthly"].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => handlePeriodChange(period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period && styles.periodButtonTextActive,
                  ]}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Monthly Trend Chart */}
          {savingsData.monthlyData.labels.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Monthly Savings Trend</Text>
              <LineChart
                data={{
                  labels: savingsData.monthlyData.labels,
                  datasets: [{ data: savingsData.monthlyData.data }],
                }}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: "#FFFFFF",
                  backgroundGradientFrom: "#FFFFFF",
                  backgroundGradientTo: "#FFFFFF",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 208, 158, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#00D09E",
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
          )}

          {/* Category Distribution */}
          {savingsData.categories.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Category Distribution</Text>
              <PieChart
                data={savingsData.categories.map((category) => ({
                  name: category.name,
                  population: category.totalAmount,
                  color: category.color,
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 12,
                }))}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: "#FFFFFF",
                  backgroundGradientFrom: "#FFFFFF",
                  backgroundGradientTo: "#FFFFFF",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                style={styles.chart}
              />
            </View>
          )}

          {/* Category List */}
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Categories</Text>
            {savingsData.categories.length > 0 ? (
              savingsData.categories.map((category) => (
                <View key={category.id} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <View
                      style={[
                        styles.categoryColor,
                        { backgroundColor: category.color },
                      ]}
                    />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <Text style={styles.categoryAmount}>
                    {formatVND(category.totalAmount)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No saving goals yet</Text>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Add Saving Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Monthly Saving Goal</Text>
            <Text style={styles.modalSubtitle}>
              Enter your saving goal for {currentMonth}
            </Text>
            {error && <Text style={styles.modalErrorText}>{error}</Text>}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={savingAmount}
                onChangeText={setSavingAmount}
              />
              <Text style={styles.currencyText}>VND</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  setError(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveSaving}
              >
                <Text style={styles.saveButtonText}>Set Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  greenSection: {
    backgroundColor: "#00D09E",
    paddingBottom: 16,
  },
  whiteSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  notificationButton: {
    padding: 4,
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  periodButtonActive: {
    backgroundColor: "#00D09E",
  },
  periodButtonText: {
    color: "#64748B",
    fontWeight: "500",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  savingsCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    margin: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  savingsSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00D09E",
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    margin: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    color: "#1E293B",
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#00D09E",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  currencyText: {
    padding: 12,
    color: "#64748B",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
  },
  saveButton: {
    backgroundColor: "#00D09E",
  },
  cancelButtonText: {
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
  },
  saveButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    padding: 16,
  },
  modalErrorText: {
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 12,
  },
});

export default SavingScreen;
