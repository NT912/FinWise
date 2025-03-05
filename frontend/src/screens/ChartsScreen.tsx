import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import {
  BarChart,
  LineChart,
  PieChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  Pie,
} from "recharts";
import { fetchChartData } from "../services/apiService";

export default function ChartsScreen() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        const data = await fetchChartData();
        setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Financial Overview</Text>

      {/* Biểu đồ thanh - Thu nhập & Chi tiêu */}
      <Text style={styles.chartTitle}>Income vs Expenses</Text>
      <BarChart width={320} height={250} data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="income" fill="#4CAF50" />
        <Bar dataKey="expense" fill="#F44336" />
      </BarChart>

      {/* Biểu đồ đường - Xu hướng chi tiêu */}
      <Text style={styles.chartTitle}>Spending Trends</Text>
      <LineChart width={320} height={250} data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="expense" stroke="#FF9800" />
      </LineChart>

      {/* Biểu đồ tròn - Phân bổ chi tiêu */}
      <Text style={styles.chartTitle}>Expense Breakdown</Text>
      <PieChart width={320} height={250}>
        <Pie
          data={chartData}
          dataKey="amount"
          nameKey="category"
          fill="#2196F3"
          label
        />
      </PieChart>
    </View>
  );
}

// 🎨 CSS
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#E3FFF8" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#007AFF",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
});
