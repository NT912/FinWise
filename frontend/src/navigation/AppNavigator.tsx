import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LaunchScreen from "../screens/LaunchScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import SettingsScreen from "../screens/Profile/SettingsScreen";
import NotificationScreen from "../screens/NotificationScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import TabNavigator from "./TabNavigator";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import EditProfileScreen from "../screens/Profile/EditProfileScreen";
import SecurityScreen from "../screens/Profile/SecurityScreen";
import NotificationSettingsScreen from "../screens/Profile/NotificationSettingsScreen";
import HelpScreen from "../screens/Profile/HelpScreen";
import DeleteAccountScreen from "../screens/Profile/DeleteAccountScreen";
import FaceIDScreen from "../screens/Profile/FaceIDScreen";
import TermsAndConditionsScreen from "../screens/Profile/TermsAndConditionsScreen";
import LogoutScreen from "../screens/Profile/LogoutScreen";
import ChangePasswordScreen from "../screens/Profile/ChangePasswordScreen";
import { User } from "../types";
import NotificationsSettingsScreen from "../screens/Profile/NotificationSettingsScreen";
import ScanReceiptScreen from "../screens/ScanReceiptScreen";
import BiometricAuthGate from "../components/auth/BiometricAuthGate";
import ExampleTabScreen from "../screens/ExampleTabScreen";

export type RootStackParamList = {
  Launch: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Home: undefined;
  Transactions: undefined;
  Categories: undefined;
  Savings: undefined;
  Settings: undefined;
  Notifications: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string; resetCode: string };
  MainApp: undefined;
  Charts: undefined;
  Profile: undefined;
  PrivacyPolicyScreen: undefined;
  SettingsScreen: undefined;
  EditProfile: {
    user: User;
  };
  SecurityScreen: undefined;
  NotificationSettingsScreen: undefined;
  HelpScreen: undefined;
  LogoutScreen: undefined;
  FaceIDScreen: undefined;
  DeleteAccountScreen: undefined;
  TermsAndConditionsScreen: undefined;
  ExampleTabScreen: undefined;
  Main: undefined;
  ChangePasswordScreen: undefined;
  Security: undefined;
  NotificationsSettings: undefined;
  ChangePassword: undefined;
  ScanReceipt: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#00C897",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  );
};

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

  // Wrap the navigator with BiometricAuthGate only for authenticated routes
  return (
    <BiometricAuthGate>
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
        <Stack.Screen name="Home" component={MainTabs} />
        <Stack.Screen name="Transactions" component={TransactionsScreen} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="MainApp" component={TabNavigator} />
        {userToken && (
          <>
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
            <Stack.Screen name="SecurityScreen" component={SecurityScreen} />
            <Stack.Screen
              name="NotificationSettingsScreen"
              component={NotificationSettingsScreen}
            />
            <Stack.Screen name="HelpScreen" component={HelpScreen} />
            <Stack.Screen name="LogoutScreen" component={LogoutScreen} />
            <Stack.Screen name="FaceIDScreen" component={FaceIDScreen} />
            <Stack.Screen
              name="DeleteAccountScreen"
              component={DeleteAccountScreen}
            />
            <Stack.Screen
              name="TermsAndConditionsScreen"
              component={TermsAndConditionsScreen}
            />
            <Stack.Screen
              name="ExampleTabScreen"
              component={ExampleTabScreen}
            />
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
            <Stack.Screen name="ScanReceipt" component={ScanReceiptScreen} />
          </>
        )}
      </Stack.Navigator>
    </BiometricAuthGate>
  );
}
