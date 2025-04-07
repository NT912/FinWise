import React, { useState, useContext, createContext } from "react";
import { View, StyleSheet } from "react-native";
import TabBar from "./TabBar";
import HomeScreen from "../screens/Home/HomeScreen";
import CategoryScreen from "../screens/Category/CategoryScreen";
import ChartsScreen from "../screens/ChartsScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

type TabName = "Home" | "Category" | "Charts" | "Profile";

// Context cho việc truy cập Tab từ các component con
type MainLayoutContextType = {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
};

export const MainLayoutContext = createContext<MainLayoutContextType>({
  activeTab: "Home",
  setActiveTab: () => {},
});

/**
 * Layout chính quản lý hiển thị các tab cố định và nội dung tương ứng
 */
const MainLayout = () => {
  const [activeTab, setActiveTab] = useState<TabName>("Home");

  // Render nội dung dựa trên tab đang được chọn
  const renderContent = () => {
    switch (activeTab) {
      case "Home":
        return <HomeScreen />;
      case "Category":
        return <CategoryScreen />;
      case "Charts":
        return <ChartsScreen />;
      case "Profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Xử lý khi tab thay đổi
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabName);
  };

  // Giá trị context
  const contextValue = {
    activeTab,
    setActiveTab,
  };

  return (
    <MainLayoutContext.Provider value={contextValue}>
      <View style={styles.container}>
        <View style={styles.content}>{renderContent()}</View>
        <TabBar activeTab={activeTab} onChangeTab={handleTabChange} />
      </View>
    </MainLayoutContext.Provider>
  );
};

// Hook tùy chỉnh để dễ dàng sử dụng MainLayoutContext
export const useMainLayout = () => useContext(MainLayoutContext);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
});

export default MainLayout;
