import axios from "axios";
import { API_URL } from "../config";

export interface SavingsData {
  totalSavings: number;
  monthlyGoal: number;
  progress: number;
  lineChartData: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
  scatterChartData: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
  pieChartData: {
    labels: string[];
    data: number[];
    colors: string[];
  };
}

const generateDailyLabels = () => {
  const labels = [];
  for (let i = 1; i <= 31; i++) {
    labels.push(i.toString());
  }
  return labels;
};

const generateWeeklyLabels = () => {
  return ["Week 1", "Week 2", "Week 3", "Week 4"];
};

const generateMonthlyLabels = () => {
  return [
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
};

export const fetchSavingsData = async (
  period: string
): Promise<SavingsData> => {
  try {
    const response = await axios.get(
      `${API_URL}/api/home?timeFilter=${period}`
    );
    const { savingsOnGoals } = response.data;

    // Generate labels based on period
    const labels =
      period === "daily"
        ? generateDailyLabels()
        : period === "weekly"
        ? generateWeeklyLabels()
        : generateMonthlyLabels();

    // Mock data for charts (replace with real data from API)
    const lineChartData = {
      labels,
      datasets: [
        {
          data: labels.map(() => Math.floor(Math.random() * 10000000)),
        },
      ],
    };

    const scatterChartData = {
      labels,
      datasets: [
        {
          data: labels.map(() => Math.floor(Math.random() * 10000000)),
        },
      ],
    };

    const pieChartData = {
      labels: [
        "Food",
        "Transport",
        "Entertainment",
        "Bills",
        "Shopping",
        "Others",
      ],
      data: [30, 20, 15, 15, 10, 10],
      colors: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
      ],
    };

    return {
      totalSavings: savingsOnGoals,
      monthlyGoal: 10000000,
      progress: Math.min((savingsOnGoals / 10000000) * 100, 100),
      lineChartData,
      scatterChartData,
      pieChartData,
    };
  } catch (error) {
    console.error("Error fetching savings data:", error);
    throw error;
  }
};
