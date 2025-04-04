import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { fetchHomeData } from "../../services/homeService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "./Header";
import BalanceOverview from "./BalanceOverview";
import SavingsGoals from "./SavingsGoals";
import FilterButtons from "../../components/FilterButtons";
import LoadingIndicator from "../../components/LoadingIndicator";
import homeStyles from "../../styles/home/homeStyles";

type SavingGoal = {
  _id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
};

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<
    "Daily" | "Weekly" | "Monthly"
  >("Monthly");

  const [userData, setUserData] = useState({
    userName: "",
    userAvatar: "",
    totalBalance: 0,
    totalExpense: 0,
    savingsGoals: [] as SavingGoal[],
  });

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async (filter = "monthly") => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const data = await fetchHomeData(filter);
      setUserData({
        userName: data.userName,
        userAvatar: data.userAvatar || "https://via.placeholder.com/50",
        totalBalance: data.totalBalance ?? 0,
        totalExpense: data.totalExpense ?? 0,
        savingsGoals: data.savingsGoals ?? [],
      });
    } catch (error) {
      console.error("🚨 Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData(selectedFilter);
    setRefreshing(false);
  };

  if (loading) return <LoadingIndicator />;

  return (
    <SafeAreaView style={homeStyles.safeArea}>
      <FlatList
        data={[{ id: "1" }]} // Dummy data for FlatList
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00C897", "#FFD700"]}
            progressBackgroundColor={"#F5F5F5"}
            tintColor="#00C897"
          />
        }
        ListHeaderComponent={
          <>
            <Header
              userName={userData.userName}
              userAvatar={userData.userAvatar}
            />
            <BalanceOverview
              totalBalance={userData.totalBalance}
              totalExpense={userData.totalExpense}
            />
            <SavingsGoals savingsGoals={userData.savingsGoals} />
            <FilterButtons
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          </>
        }
        renderItem={() => null}
        contentContainerStyle={homeStyles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
