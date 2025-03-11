import React from "react";
import { View, Text } from "react-native";
import * as Progress from "react-native-progress";
import homeStyles from "../../styles/home/homeStyles";

// Định nghĩa kiểu dữ liệu cho props
type BalanceOverviewProps = {
  totalBalance: number;
  totalExpense: number;
};

const BalanceOverview: React.FC<BalanceOverviewProps> = ({
  totalBalance,
  totalExpense,
}) => {
  return (
    <View style={homeStyles.balanceCard}>
      <View style={homeStyles.balanceRow}>
        <Text style={homeStyles.balanceLabel}>Total Balance</Text>
        <Text style={homeStyles.balanceLabel}>Total Expense</Text>
      </View>
      <View style={homeStyles.balanceRow}>
        <Text style={homeStyles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
        <Text style={homeStyles.expenseAmount}>
          -${totalExpense.toFixed(2)}
        </Text>
      </View>

      {/* Thanh tiến trình ngân sách */}
      <Progress.Bar
        progress={totalBalance > 0 ? totalExpense / totalBalance : 0}
        width={300}
        height={12}
        color="#fff"
        borderRadius={10}
        style={homeStyles.progressBar}
      />
    </View>
  );
};

export default BalanceOverview;
