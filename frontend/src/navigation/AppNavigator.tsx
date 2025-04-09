import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LaunchScreen from "../screens/LaunchScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import SecurityPinScreen from "../screens/Auth/SecurityPinScreen";
import ResetPasswordScreen from "../screens/Auth/ResetPasswordScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import CategoryScreen from "../screens/Category/CategoryScreen";
import ChartsScreen from "../screens/ChartsScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import SettingsScreen from "../screens/Profile/SettingsScreen";
import NotificationScreen from "../screens/NotificationScreen";
import EditProfileScreen from "../screens/Profile/EditProfileScreen";
import SecurityScreen from "../screens/Security/SecurityScreen";
import NotificationSettingsScreen from "../screens/Profile/NotificationSettingsScreen";
import HelpScreen from "../screens/Profile/HelpScreen";
import DeleteAccountScreen from "../screens/Profile/DeleteAccountScreen";
import TermsAndConditionsScreen from "../screens/Security/TermsAndConditionsScreen";
import LogoutScreen from "../screens/Profile/LogoutScreen";
import ChangePasswordScreen from "../screens/Profile/ChangePasswordScreen";
import CategoryDetailScreen from "../screens/Category/CategoryDetailScreen";
import AddTransactionScreen from "../screens/Transaction/AddTransactionScreen";
import { User } from "../types";
import CustomTabBar from "../components/CustomTabBar";
import ChangePinScreen from "../screens/Security/ChangePinScreen";

export type RootStackParamList = {
  Launch: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  TabNavigator: undefined;
  Categories: undefined;
  Settings: undefined;
  Notifications: undefined;
  ForgotPassword: undefined;
  SecurityPin: { email: string };
  ResetPassword: { email: string; resetCode: string };
  PrivacyPolicyScreen: undefined;
  SettingsScreen: undefined;
  EditProfile: { user: User };
  SecurityScreen: undefined;
  NotificationSettingsScreen: undefined;
  HelpScreen: undefined;
  LogoutScreen: undefined;
  DeleteAccountScreen: undefined;
  TermsAndConditionsScreen: undefined;
  ChangePasswordScreen: undefined;
  Security: undefined;
  ChangePin: undefined;
  TermsAndConditions: undefined;
  TermsOfUse: undefined;
  PrivacyPolicy: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  AddTransaction: undefined;
};

export type CategoryStackParamList = {
  Category: undefined;
  CategoryDetail: {
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
  };
  AddTransaction: {
    preSelectedCategory?: string;
    type?: string;
  };
};

export type ChartsStackParamList = {
  Charts: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  EditProfile: { user: User };
  Security: undefined;
  NotificationSettings: undefined;
  Help: undefined;
  Terms: undefined;
  ChangePassword: undefined;
  DeleteAccount: undefined;
  Logout: undefined;
};

interface AppNavigatorProps {
  initialAuthenticated?: boolean;
  forceLogin?: boolean;
}

const Stack = createStackNavigator<RootStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const CategoryStack = createStackNavigator<CategoryStackParamList>();
const ChartsStack = createStackNavigator<ChartsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator();

// Home Stack
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="AddTransaction" component={AddTransactionScreen} />
  </HomeStack.Navigator>
);

// Category Stack
const CategoryStackNavigator = () => (
  <CategoryStack.Navigator screenOptions={{ headerShown: false }}>
    <CategoryStack.Screen name="Category" component={CategoryScreen} />
    <CategoryStack.Screen
      name="CategoryDetail"
      component={CategoryDetailScreen}
    />
    <CategoryStack.Screen
      name="AddTransaction"
      component={AddTransactionScreen}
    />
  </CategoryStack.Navigator>
);

// Charts Stack
const ChartsStackNavigator = () => (
  <ChartsStack.Navigator screenOptions={{ headerShown: false }}>
    <ChartsStack.Screen name="Charts" component={ChartsScreen} />
  </ChartsStack.Navigator>
);

// Profile Stack
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="Security" component={SecurityScreen} />
    <ProfileStack.Screen
      name="NotificationSettings"
      component={NotificationSettingsScreen}
    />
    <ProfileStack.Screen name="Help" component={HelpScreen} />
    <ProfileStack.Screen name="Terms" component={TermsAndConditionsScreen} />
    <ProfileStack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
    />
    <ProfileStack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    <ProfileStack.Screen name="Logout" component={LogoutScreen} />
  </ProfileStack.Navigator>
);

// Tab Navigator - This is where our TabBar lives
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
    }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
    <Tab.Screen name="CategoryTab" component={CategoryStackNavigator} />
    <Tab.Screen name="ChartsTab" component={ChartsStackNavigator} />
    <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
  </Tab.Navigator>
);

export default function AppNavigator({
  initialAuthenticated = false,
  forceLogin = false,
}: AppNavigatorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra token khi component mount
    const checkToken = async () => {
      try {
        // Nếu forceLogin = true, luôn luôn đặt userToken = null
        if (forceLogin) {
          console.log("🔒 Bắt buộc đăng nhập theo cài đặt");
          setUserToken(null);
        } else {
          // Nếu initialAuthenticated được cung cấp, sử dụng giá trị đó
          if (initialAuthenticated) {
            const token = await AsyncStorage.getItem("token");
            setUserToken(token);
          } else {
            // Nếu không, kiểm tra token trong AsyncStorage
            const token = await AsyncStorage.getItem("token");
            setUserToken(token);
          }
        }
      } catch (error) {
        console.error("Error checking token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [initialAuthenticated, forceLogin]);

  // Hiển thị màn hình loading nếu đang kiểm tra token
  if (isLoading) {
    return null;
  }

  // Luôn bắt đầu với màn hình Launch
  const initialRoute = "Launch";

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#fff" },
      }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="Launch" component={LaunchScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SecurityPin" component={SecurityPinScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

      {/* Main tab navigator that contains the TabBar */}
      <Stack.Screen
        name="TabNavigator"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      {/* Other screens not directly accessible through tabs */}
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePin"
        component={ChangePinScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TermsAndConditions"
        component={TermsAndConditionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TermsOfUse"
        component={require("../screens/Auth/TermsOfUseScreen").default}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={require("../screens/Auth/PrivacyPolicyScreen").default}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
