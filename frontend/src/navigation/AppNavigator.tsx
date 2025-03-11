import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LaunchScreen from "../screens/LaunchScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import SavingsScreen from "../screens/SavingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import NotificationScreen from "../screens/NotificationScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import TabNavigator from "./TabNavigator";

export type RootStackParamList = {
  Launch: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Home: undefined;
  Transactions: undefined;
  Categories: undefined;
  Savings: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string; resetCode: string };
  MainApp: undefined;
  Charts: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#fff" },
      }}
    >
      <Stack.Screen name="Launch" component={LaunchScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Home" component={TabNavigator} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Savings" component={SavingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="MainApp" component={TabNavigator} />
    </Stack.Navigator>
  );
}
