import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import HomeScreen from "../screens/Home/HomeScreen";
import CategoryScreen from "../screens/Category/CategoryScreen";
import ChartsScreen from "../screens/ChartsScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import ScanReceiptScreen from "../screens/ScanReceiptScreen";

const Tab = createBottomTabNavigator();

const CustomCameraButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={styles.cameraButton}
  >
    <Ionicons name="camera" size={32} color="#fff" />
  </TouchableOpacity>
);

export default function TabNavigator({ navigation }: any) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false, // Ẩn tên tab
        tabBarStyle: styles.tabBarStyle,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Category") {
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

      {/* Tab 2: Categories */}
      <Tab.Screen name="Category" component={CategoryScreen} />

      {/* Nút Camera ở giữa */}
      <Tab.Screen
        name="Scan"
        component={ScanReceiptScreen}
        options={{
          tabBarButton: (props) => (
            <CustomCameraButton
              onPress={() => navigation.navigate("ScanReceipt")}
            />
          ),
        }}
      />

      {/* Tab 4: Charts */}
      <Tab.Screen name="Charts" component={ChartsScreen} />

      {/* Tab 5: Profile */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    position: "absolute",
    height: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#fff",
    elevation: 5,
  },
  cameraButton: {
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
  },
});
