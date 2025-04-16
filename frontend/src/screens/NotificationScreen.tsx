import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";

// Dữ liệu mẫu cho thông báo
const notificationData = [
  {
    id: "1",
    type: "reminder",
    title: "Reminder!",
    message: "Set up your automatic savings to meet your savings goal...",
    date: "17:00 - April 24",
    time: "Today",
    icon: "notifications",
    iconColor: "#00D09E",
    iconBgColor: "#E5F8F0",
  },
  {
    id: "2",
    type: "update",
    title: "New Update",
    message: "Set up your automatic savings to meet your savings goal...",
    date: "17:00 - April 24",
    time: "Today",
    icon: "star",
    iconColor: "#00D09E",
    iconBgColor: "#E5F8F0",
  },
  {
    id: "3",
    type: "transaction",
    title: "Transactions",
    message: "A new transaction has been registered",
    details: "Groceries | Pastry | +100.00",
    date: "17:00 - April 24",
    time: "Yesterday",
    icon: "wallet",
    iconColor: "#00D09E",
    iconBgColor: "#E5F8F0",
  },
  {
    id: "4",
    type: "reminder",
    title: "Reminder!",
    message: "Set up your automatic savings to meet your savings goal...",
    date: "17:00 - April 24",
    time: "Yesterday",
    icon: "notifications",
    iconColor: "#00D09E",
    iconBgColor: "#E5F8F0",
  },
  {
    id: "5",
    type: "expense",
    title: "Expense Record",
    message: "We recommend that you be more attentive to your expenses.",
    date: "17:00 - April 24",
    time: "This Weekend",
    icon: "trending-up",
    iconColor: "#00D09E",
    iconBgColor: "#E5F8F0",
  },
  {
    id: "6",
    type: "transaction",
    title: "Transactions",
    message: "A new transaction has been registered",
    details: "Food | -370.45",
    date: "17:00 - April 24",
    time: "This Weekend",
    icon: "wallet",
    iconColor: "#00D09E",
    iconBgColor: "#E5F8F0",
  },
];

// Nhóm thông báo theo thời gian
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  details?: string;
  date: string;
  time: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
}

interface GroupedNotifications {
  [key: string]: Notification[];
}

const groupNotificationsByTime = (
  notifications: Notification[]
): GroupedNotifications => {
  const grouped: GroupedNotifications = {};

  notifications.forEach((notification) => {
    if (!grouped[notification.time]) {
      grouped[notification.time] = [];
    }
    grouped[notification.time].push(notification);
  });

  return grouped;
};

const NotificationScreen = () => {
  const navigation = useNavigation();
  const groupedNotifications = groupNotificationsByTime(notificationData);

  // Icon component cho mỗi loại thông báo
  const NotificationIcon = ({
    type,
    iconName,
    iconColor,
    iconBgColor,
  }: {
    type: string;
    iconName: string;
    iconColor: string;
    iconBgColor: string;
  }) => {
    let icon = iconName;

    switch (type) {
      case "reminder":
        icon = "notifications";
        break;
      case "update":
        icon = "star";
        break;
      case "transaction":
        icon = "wallet";
        break;
      case "expense":
        icon = "trending-up";
        break;
      default:
        icon = "notifications";
    }

    return (
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: iconBgColor || "#E5F8F0" },
        ]}
      >
        <Ionicons name={icon as any} size={24} color={iconColor || "#00D09E"} />
      </View>
    );
  };

  // Component cho mỗi thông báo
  const NotificationItem = ({
    notification,
  }: {
    notification: Notification;
  }) => (
    <View style={styles.notificationItem}>
      <NotificationIcon
        type={notification.type}
        iconName={notification.icon}
        iconColor={notification.iconColor}
        iconBgColor={notification.iconBgColor}
      />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        {notification.details && (
          <Text style={styles.notificationDetails}>{notification.details}</Text>
        )}
      </View>
      <Text style={styles.notificationDate}>{notification.date}</Text>
    </View>
  );

  const handleBack = () => {
    // Sử dụng goBack() để quay lại màn hình trước đó
    navigation.goBack();
  };

  // Hàm chuyển đến các tab chính
  const navigateToTab = (tabName: string) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "TabNavigator",
            state: {
              routes: [{ name: tabName }],
              index:
                tabName === "HomeTab"
                  ? 0
                  : tabName === "CategoryTab"
                  ? 1
                  : tabName === "SavingTab"
                  ? 2
                  : 3,
            },
          },
        ],
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00D09E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Danh sách thông báo */}
      <View style={styles.mainContent}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {Object.keys(groupedNotifications).map((timeGroup) => (
            <View key={timeGroup} style={styles.timeGroup}>
              <Text style={styles.timeGroupTitle}>{timeGroup}</Text>
              {groupedNotifications[timeGroup].map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* TabBar style navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigateToTab("HomeTab")}
        >
          <Ionicons name="home-outline" size={24} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigateToTab("CategoryTab")}
        >
          <Ionicons name="list-outline" size={24} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigateToTab("SavingTab")}
        >
          <Ionicons name="wallet-outline" size={24} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigateToTab("ProfileTab")}
        >
          <Ionicons name="person-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  mainContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Giữ lại khoảng cách phù hợp cho tab bar
  },
  timeGroup: {
    marginBottom: 20,
  },
  timeGroupTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginBottom: 10,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 1,
    borderLeftColor: "#E5E5E5",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    paddingRight: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  notificationDetails: {
    fontSize: 14,
    color: "#00D09E",
    fontWeight: "500",
  },
  notificationDate: {
    fontSize: 12,
    color: "#999",
    alignSelf: "flex-end",
  },
  tabBar: {
    flexDirection: "row",
    height: 80,
    backgroundColor: "#DFF7E2",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    paddingBottom: 20,
    paddingHorizontal: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
});

export default NotificationScreen;
