import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TabBarProps = {
  activeTab: string;
  onChangeTab?: (tabName: string) => void;
};

/**
 * Component hiển thị thanh tab cố định ở dưới màn hình
 * @param activeTab Tab đang được chọn
 * @param onChangeTab Callback khi tab được chọn
 */
const TabBar = ({ activeTab = "Home", onChangeTab }: TabBarProps) => {
  // Xử lý sự kiện khi tab được nhấn
  const handleTabPress = (tabName: string) => {
    if (onChangeTab) {
      onChangeTab(tabName);
    }
  };

  return (
    <View style={styles.tabBarContainer}>
      <TouchableOpacity
        style={[
          styles.tabItem,
          activeTab === "Home" && styles.tabItemActive,
          activeTab === "Home" && styles.tabItemActiveLeft,
        ]}
        onPress={() => handleTabPress("Home")}
      >
        <Ionicons
          name={activeTab === "Home" ? "home" : "home-outline"}
          size={28}
          color={activeTab === "Home" ? "#00D09E" : "#555"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabItem,
          activeTab === "Category" && styles.tabItemActive,
        ]}
        onPress={() => handleTabPress("Category")}
      >
        <Ionicons
          name={activeTab === "Category" ? "list" : "list-outline"}
          size={28}
          color={activeTab === "Category" ? "#00D09E" : "#555"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabItem, activeTab === "Charts" && styles.tabItemActive]}
        onPress={() => handleTabPress("Charts")}
      >
        <Ionicons
          name={activeTab === "Charts" ? "bar-chart" : "bar-chart-outline"}
          size={28}
          color={activeTab === "Charts" ? "#00D09E" : "#555"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabItem,
          activeTab === "Profile" && styles.tabItemActive,
          activeTab === "Profile" && styles.tabItemActiveRight,
        ]}
        onPress={() => handleTabPress("Profile")}
      >
        <Ionicons
          name={activeTab === "Profile" ? "person" : "person-outline"}
          size={28}
          color={activeTab === "Profile" ? "#00D09E" : "#555"}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    height: 80,
    backgroundColor: "#DFF7E2",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    zIndex: 1000,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 12,
  },
  tabItemActive: {
    borderTopColor: "#00D09E",
    borderTopWidth: 3,
  },
  tabItemActiveLeft: {
    borderTopColor: "#00D09E",
    borderTopWidth: 3,
    borderTopLeftRadius: 30,
  },
  tabItemActiveRight: {
    borderTopColor: "#00D09E",
    borderTopWidth: 3,
    borderTopRightRadius: 30,
  },
});

export default TabBar;
