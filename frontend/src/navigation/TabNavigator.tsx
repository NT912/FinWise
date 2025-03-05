import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import ChartsScreen from "../screens/ChartsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ScanReceiptScreen from "../screens/ScanReceiptScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator({ navigation }: any) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false, // Ẩn tên tab
        tabBarStyle: {
          position: "absolute",
          height: 80,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: "#fff",
          elevation: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Transactions") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Charts") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#00C897",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Ẩn header
      })}
    >
      {/* Tab 1: Home */}
      <Tab.Screen name="Home" component={HomeScreen} />

      {/* Tab 2: Transactions */}
      <Tab.Screen name="Transactions" component={TransactionsScreen} />

      {/* Nút Camera ở giữa */}
      <Tab.Screen
        name="Scan"
        component={ScanReceiptScreen}
        options={{
          tabBarButton: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("ScanReceipt")}
              style={{
                top: -30,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#00C897",
                height: 70,
                width: 70,
                borderRadius: 35,
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <Ionicons name="camera" size={32} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Tab 3: Charts */}
      <Tab.Screen name="Charts" component={ChartsScreen} />

      {/* Tab 4: Profile */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
