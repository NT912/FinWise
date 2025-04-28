import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LineChart, BarChart } from "react-native-chart-kit";
import { colors } from "../../theme";
import { fetchMonthlyReport } from "../../services/transactionService";
import { formatVND } from "../../utils/formatters";
import { RootStackParamList } from "../../navigation/types";

const screenWidth = Dimensions.get("window").width;

interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  periods: Array<{ label: string; income: number; expense: number }>;
}

interface Period {
  key: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
}

interface Category {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  count: number;
}

interface ReportData {
  period: "weekly" | "monthly" | "yearly";
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  timeRange: {
    start: string;
    end: string;
  };
  periods: Period[];
  categories: {
    income: Category[];
    expense: Category[];
  };
}

type PeriodFilter = "weekly" | "monthly" | "yearly";

interface MonthInfo {
  key: string;
  monthName: string;
}

const IncomeExpenseReportScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("monthly");
  const [viewType, setViewType] = useState<"chart" | "summary">("chart");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(
    "all"
  );
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMonthlyReport(
        periodFilter,
        selectedWalletId || undefined
      );
      console.log("API Response Data:", data);
      console.log("Current Period Filter:", periodFilter);

      if (data && data.periods) {
        console.log(
          "Raw periods data from API:",
          data.periods.map((p: Period) => ({
            key: p.key,
            label: p.label,
            income: p.income,
            expense: p.expense,
          }))
        );

        // Tạo thủ công dữ liệu cho 6 tháng gần đây nếu là monthly
        if (periodFilter === "monthly") {
          const monthOrder = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          // Lấy thời gian hiện tại
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth(); // 0-11
          const currentYear = currentDate.getFullYear();

          // Tạo danh sách 6 tháng gần đây
          const last6Months: Period[] = [];

          for (let i = 5; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const month = date.getMonth(); // 0-11
            const year = date.getFullYear();
            const monthStr = `${year}-${(month + 1)
              .toString()
              .padStart(2, "0")}`;

            // Tìm dữ liệu cho tháng này từ API
            const existingData = data.periods.find((p: Period) => {
              // Chuẩn hóa định dạng key nếu cần
              let periodKey = p.key;
              if (p.key.match(/^(\d{2})-(\d{4})$/)) {
                // Chuyển từ MM-YYYY sang YYYY-MM
                const [month, year] = p.key.split("-");
                periodKey = `${year}-${month}`;
              }

              // So sánh tháng hiện tại với tháng từ API
              return periodKey === monthStr || p.label === monthOrder[month];
            });

            // Nếu không tìm thấy, tạo dữ liệu trống
            if (existingData) {
              // Đảm bảo key đúng định dạng
              existingData.key = monthStr;
              // Đảm bảo label đúng tên tháng
              existingData.label = monthOrder[month];
              last6Months.push(existingData);
            } else {
              last6Months.push({
                key: monthStr,
                label: monthOrder[month],
                income: 0,
                expense: 0,
                balance: 0,
              });
            }
          }

          // Sắp xếp từ tháng xa nhất đến tháng gần nhất
          last6Months.sort((a, b) => a.key.localeCompare(b.key));

          // Ghi đè danh sách tháng
          data.periods = last6Months;

          console.log(
            "Generated 6 months data:",
            data.periods.map((p: Period) => `${p.label} (${p.key})`)
          );
        } else if (periodFilter === "weekly") {
          // Đảm bảo key có định dạng YYYY-MM-DD cho weekly
          data.periods = data.periods.filter((period: Period) => {
            // Kiểm tra xem key có đúng định dạng không
            return /^\d{4}-\d{2}-\d{2}$/.test(period.key);
          });

          // Sắp xếp theo thời gian tăng dần
          data.periods.sort((a: Period, b: Period) =>
            a.key.localeCompare(b.key)
          );
        } else if (periodFilter === "yearly") {
          // Đảm bảo key có định dạng YYYY cho yearly
          data.periods = data.periods.filter((period: Period) => {
            // Kiểm tra xem key có đúng định dạng không
            return /^\d{4}$/.test(period.key);
          });

          // Sắp xếp theo thời gian tăng dần
          data.periods.sort((a: Period, b: Period) =>
            a.key.localeCompare(b.key)
          );
        }
      }

      setReportData(data);
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodFilter, selectedWalletId]);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const renderChartData = () => {
    if (!reportData || !reportData.periods || reportData.periods.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [0],
            color: () => "rgba(0, 200, 151, 1)",
            strokeWidth: 2,
          },
          {
            data: [0],
            color: () => "rgba(255, 107, 107, 1)",
            strokeWidth: 2,
          },
        ],
        legend: ["Income (mil)", "Expense (mil)"],
      };
    }

    // Log ra dữ liệu gốc để kiểm tra
    console.log(
      "Chart data periods:",
      reportData.periods.map((p) => `${p.label} (${p.key})`)
    );

    // Sử dụng dữ liệu trực tiếp - không cần sắp xếp lại vì đã sắp xếp từ loadData
    const sortedPeriods = [...reportData.periods];

    // Log ra dữ liệu sau khi sắp xếp
    console.log(
      "Final chart periods:",
      sortedPeriods.map((p) => `${p.label} (${p.key})`)
    );

    const labels = sortedPeriods.map((period) => period.label);
    const incomeData = sortedPeriods.map((period) => period.income / 1000000);
    const expenseData = sortedPeriods.map((period) => period.expense / 1000000);

    if (chartType === "line") {
      return {
        labels,
        datasets: [
          {
            data: incomeData,
            color: () => "rgba(0, 200, 151, 1)", // Green for income
            strokeWidth: 2,
          },
          {
            data: expenseData,
            color: () => "rgba(255, 107, 107, 1)", // Red for expense
            strokeWidth: 2,
          },
        ],
        legend: ["Income (mil)", "Expense (mil)"],
      };
    } else {
      return {
        labels,
        datasets: [
          {
            data: incomeData,
          },
          {
            data: expenseData,
          },
        ],
        barColors: ["rgba(0, 200, 151, 1)", "rgba(255, 107, 107, 1)"],
        legend: ["Income (mil)", "Expense (mil)"],
      };
    }
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    barPercentage: 0.7,
    propsForLabels: {
      fontSize: 10,
      fontWeight: "600",
    },
    style: {
      borderRadius: 16,
    },
  };

  const renderPeriodFilter = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          periodFilter === "weekly" && styles.activeFilterButton,
        ]}
        onPress={() => setPeriodFilter("weekly")}
      >
        <Text
          style={[
            styles.filterText,
            periodFilter === "weekly" && styles.activeFilterText,
          ]}
        >
          Week
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          periodFilter === "monthly" && styles.activeFilterButton,
        ]}
        onPress={() => setPeriodFilter("monthly")}
      >
        <Text
          style={[
            styles.filterText,
            periodFilter === "monthly" && styles.activeFilterText,
          ]}
        >
          Month
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          periodFilter === "yearly" && styles.activeFilterButton,
        ]}
        onPress={() => setPeriodFilter("yearly")}
      >
        <Text
          style={[
            styles.filterText,
            periodFilter === "yearly" && styles.activeFilterText,
          ]}
        >
          Year
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderViewTypeSelector = () => (
    <View style={styles.viewTypeContainer}>
      <TouchableOpacity
        style={[
          styles.viewTypeButton,
          viewType === "chart" && styles.activeViewTypeButton,
        ]}
        onPress={() => setViewType("chart")}
      >
        <Ionicons
          name="bar-chart-outline"
          size={20}
          color={viewType === "chart" ? "#fff" : "#000"}
        />
        <Text
          style={[
            styles.viewTypeText,
            viewType === "chart" && styles.activeViewTypeText,
          ]}
        >
          Chart
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.viewTypeButton,
          viewType === "summary" && styles.activeViewTypeButton,
        ]}
        onPress={() => setViewType("summary")}
      >
        <Ionicons
          name="list-outline"
          size={20}
          color={viewType === "summary" ? "#fff" : "#000"}
        />
        <Text
          style={[
            styles.viewTypeText,
            viewType === "summary" && styles.activeViewTypeText,
          ]}
        >
          Summary
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderChartTypeSelector = () => (
    <View style={styles.chartTypeContainer}>
      <TouchableOpacity
        style={[
          styles.chartTypeButton,
          chartType === "line" && styles.activeChartTypeButton,
        ]}
        onPress={() => setChartType("line")}
      >
        <Ionicons
          name="trending-up-outline"
          size={20}
          color={chartType === "line" ? colors.primary : "#666"}
        />
        <Text
          style={[
            styles.chartTypeText,
            chartType === "line" && styles.activeChartTypeText,
          ]}
        >
          Line
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.chartTypeButton,
          chartType === "bar" && styles.activeChartTypeButton,
        ]}
        onPress={() => setChartType("bar")}
      >
        <Ionicons
          name="stats-chart-outline"
          size={20}
          color={chartType === "bar" ? colors.primary : "#666"}
        />
        <Text
          style={[
            styles.chartTypeText,
            chartType === "bar" && styles.activeChartTypeText,
          ]}
        >
          Bar
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderChart = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!reportData || !reportData.periods || reportData.periods.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            No data available for this period
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Income vs Expense</Text>
          {renderChartTypeSelector()}
        </View>
        <View style={styles.chart}>
          {chartType === "line" ? (
            <LineChart
              data={renderChartData()}
              width={screenWidth - 48}
              height={220}
              chartConfig={{
                ...chartConfig,
                fillShadowGradientOpacity: 0.2,
              }}
              bezier
              style={{ marginHorizontal: -12, marginLeft: -24 }}
            />
          ) : (
            <BarChart
              data={renderChartData()}
              width={screenWidth - 72}
              height={220}
              chartConfig={{
                ...chartConfig,
                barPercentage: 0.7,
                propsForLabels: {
                  fontSize: 10,
                },
              }}
              showBarTops
              fromZero
              style={{ marginHorizontal: 0, marginLeft: 8 }}
              yAxisLabel=""
              yAxisSuffix=""
              withInnerLines={false}
            />
          )}
        </View>
      </View>
    );
  };

  const renderSummary = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!reportData || !reportData.periods || reportData.periods.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            No data available for this period
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Income</Text>
          <Text style={[styles.summaryAmount, styles.incomeAmount]}>
            {formatVND(reportData.summary.totalIncome)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Expense</Text>
          <Text style={[styles.summaryAmount, styles.expenseAmount]}>
            {formatVND(reportData.summary.totalExpense)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Balance</Text>
          <Text
            style={[
              styles.summaryAmount,
              reportData.summary.balance >= 0
                ? styles.incomeAmount
                : styles.expenseAmount,
            ]}
          >
            {formatVND(Math.abs(reportData.summary.balance))}
          </Text>
        </View>

        {reportData.categories.expense.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Top Expenses</Text>
            {reportData.categories.expense
              .slice(0, 5)
              .map((category, index) => (
                <View key={`expense-${index}`} style={styles.categoryItem}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: category.color || "#FF6B6B" },
                    ]}
                  >
                    <Ionicons
                      name={(category.icon as any) || "pricetag-outline"}
                      size={18}
                      color="#FFF"
                    />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryPercentage}>
                      {Math.round(
                        (category.total / reportData.summary.totalExpense) * 100
                      )}
                      %
                    </Text>
                  </View>
                  <Text style={styles.categoryAmount}>
                    {formatVND(category.total)}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {reportData.categories.income.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Top Income</Text>
            {reportData.categories.income.slice(0, 5).map((category, index) => (
              <View key={`income-${index}`} style={styles.categoryItem}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: category.color || "#00C897" },
                  ]}
                >
                  <Ionicons
                    name={(category.icon as any) || "cash-outline"}
                    size={18}
                    color="#FFF"
                  />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryPercentage}>
                    {Math.round(
                      (category.total / reportData.summary.totalIncome) * 100
                    )}
                    %
                  </Text>
                </View>
                <Text style={styles.categoryAmount}>
                  {formatVND(category.total)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Chọn ví
  const handleSelectWallet = () => {
    navigation.navigate("WalletScreen", {
      onSelectWallet: (walletId: string) => setSelectedWalletId(walletId),
      selectedWalletId: selectedWalletId,
      showAllWalletsOption: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Income & Expense Report</Text>
        <TouchableOpacity
          style={styles.walletFilterButton}
          onPress={handleSelectWallet}
        >
          <Ionicons name="wallet-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Filtering options */}
        <View style={styles.optionsContainer}>
          {renderPeriodFilter()}
          {renderViewTypeSelector()}
        </View>

        {/* Report content */}
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollViewContent}
        >
          {viewType === "chart" ? renderChart() : renderSummary()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  walletFilterButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
    marginBottom: -50,
  },
  scrollViewContent: {
    paddingBottom: 50,
  },
  optionsContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: "#555",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "600",
  },
  viewTypeContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 4,
  },
  viewTypeButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  activeViewTypeButton: {
    backgroundColor: colors.primary,
  },
  viewTypeText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 4,
  },
  activeViewTypeText: {
    color: "#fff",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  chartContainer: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 8,
    padding: 16,
    paddingLeft: 8,
    paddingRight: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "flex-start",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
    paddingLeft: 6,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  chartTypeContainer: {
    flexDirection: "row",
  },
  chartTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  activeChartTypeButton: {
    backgroundColor: "#f0f8ff",
  },
  chartTypeText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  activeChartTypeText: {
    color: colors.primary,
    fontWeight: "600",
  },
  chart: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: "100%",
    overflow: "hidden",
  },
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    color: "#666",
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  incomeAmount: {
    color: "#00C897",
  },
  expenseAmount: {
    color: "#FF6B6B",
  },
  categorySection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  categoryPercentage: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyContainer: {
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});

export default IncomeExpenseReportScreen;
