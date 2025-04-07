import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  View,
  StyleSheet,
  StatusBar,
  Animated,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { fetchHomeData } from "../../services/homeService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppHeader from "../../components/common/AppHeader";
import BalanceOverview from "./BalanceOverview";
import StatisticsOverview from "./StatisticsOverview";
import FilterButtons from "../../components/FilterButtons";
import LoadingIndicator from "../../components/LoadingIndicator";

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<
    "Daily" | "Weekly" | "Monthly"
  >("Monthly");

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const translateY = useState(new Animated.Value(20))[0];

  const [userData, setUserData] = useState({
    userName: "",
    userAvatar: "",
    totalBalance: 7783.0,
    totalExpense: 1187.4,
    savingsOnGoals: 0,
    revenueLostWeek: 4000.0,
    foodLastWeek: 100.0,
  });

  useEffect(() => {
    loadHomeData();
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
        totalBalance: data.totalBalance ?? 7783.0,
        totalExpense: data.totalExpense ?? 1187.4,
        savingsOnGoals: data.savingsOnGoals ?? 0,
        revenueLostWeek: data.revenueLostWeek ?? 4000.0,
        foodLastWeek: data.foodLastWeek ?? 100.0,
      });
    } catch (error) {
      console.error("Error loading home data:", error);
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00D09E" />
      <View style={styles.greenBackground}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContainer}>
            <AppHeader textColor="#000000" />
            <BalanceOverview
              totalBalance={userData.totalBalance}
              totalExpense={userData.totalExpense}
            />
          </View>
        </SafeAreaView>
      </View>

      <Animated.ScrollView
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: translateY }],
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00D09E"]}
            tintColor="#00D09E"
          />
        }
      >
        <View style={styles.content}>
          <StatisticsOverview
            savingsOnGoals={userData.savingsOnGoals}
            revenueLostWeek={userData.revenueLostWeek}
            foodLastWeek={userData.foodLastWeek}
          />

          <View style={styles.filterContainer}>
            <FilterButtons
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  greenBackground: {
    backgroundColor: "#00D09E",
    paddingBottom: 16,
  },
  safeArea: {
    paddingTop: -20,
  },
  headerContainer: {
    paddingTop: 0,
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
  },
  content: {
    maxHeight: 430,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});

export default HomeScreen;
