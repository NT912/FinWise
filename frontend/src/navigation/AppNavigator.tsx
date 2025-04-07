import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LaunchScreen from "../screens/LaunchScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import SettingsScreen from "../screens/Profile/SettingsScreen";
import NotificationScreen from "../screens/NotificationScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import EditProfileScreen from "../screens/Profile/EditProfileScreen";
import SecurityScreen from "../screens/Profile/SecurityScreen";
import NotificationSettingsScreen from "../screens/Profile/NotificationSettingsScreen";
import HelpScreen from "../screens/Profile/HelpScreen";
import DeleteAccountScreen from "../screens/Profile/DeleteAccountScreen";
import TermsAndConditionsScreen from "../screens/Profile/TermsAndConditionsScreen";
import LogoutScreen from "../screens/Profile/LogoutScreen";
import ChangePasswordScreen from "../screens/Profile/ChangePasswordScreen";
import { User } from "../types";
import NotificationsSettingsScreen from "../screens/Profile/NotificationSettingsScreen";
import ExampleTabScreen from "../screens/ExampleTabScreen";
import CategoryDetailScreen from "../screens/Category/CategoryDetailScreen";
import AddTransactionScreen from "../screens/Transaction/AddTransactionScreen";
import MainLayout from "../components/MainLayout";

export type RootStackParamList = {
  Launch: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Main: undefined;
  Categories: undefined;
  Savings: undefined;
  Settings: undefined;
  Notifications: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string; resetCode: string };
  MainApp: undefined;
  PrivacyPolicyScreen: undefined;
  SettingsScreen: undefined;
  EditProfile: {
    user: User;
  };
  SecurityScreen: undefined;
  NotificationSettingsScreen: undefined;
  HelpScreen: undefined;
  LogoutScreen: undefined;
  DeleteAccountScreen: undefined;
  TermsAndConditionsScreen: undefined;
  ExampleTabScreen: undefined;
  ChangePasswordScreen: undefined;
  Security: undefined;
  NotificationsSettings: undefined;
  ChangePassword: undefined;
  CategoryDetail: undefined;
  AddTransaction: undefined;
  TransactionDetail: { transactionId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

// Main Stack sử dụng MainLayout cho màn hình chính
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Main" component={MainLayout} />
    <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
    <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
    <Stack.Screen name="Categories" component={CategoriesScreen} />
    <Stack.Screen name="Notifications" component={NotificationScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    <Stack.Screen name="SecurityScreen" component={SecurityScreen} />
    <Stack.Screen
      name="NotificationSettingsScreen"
      component={NotificationSettingsScreen}
    />
    <Stack.Screen name="HelpScreen" component={HelpScreen} />
    <Stack.Screen name="LogoutScreen" component={LogoutScreen} />
    <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />
    <Stack.Screen
      name="TermsAndConditionsScreen"
      component={TermsAndConditionsScreen}
    />
    <Stack.Screen name="ExampleTabScreen" component={ExampleTabScreen} />
    <Stack.Screen
      name="ChangePasswordScreen"
      component={ChangePasswordScreen}
    />
    <Stack.Screen name="Security" component={SecurityScreen} />
    <Stack.Screen
      name="NotificationsSettings"
      component={NotificationsSettingsScreen}
    />
    <Stack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra token khi component mount
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setUserToken(token);
      } catch (error) {
        console.error("Error checking token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  // Hiển thị màn hình loading nếu đang kiểm tra token
  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#fff" },
      }}
      initialRouteName="Launch"
    >
      <Stack.Screen name="Launch" component={LaunchScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

      {/* Các màn hình chính sau khi đăng nhập */}
      <Stack.Screen name="MainApp" component={MainStack} />
    </Stack.Navigator>
  );
}
