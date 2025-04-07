import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface AppHeaderProps {
  showBackButton?: boolean;
  showAvatar?: boolean;
  backgroundColor?: string;
  textColor?: string;
  customLeftComponent?: React.ReactNode;
  customRightComponent?: React.ReactNode;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showBackButton = false,
  showAvatar = true,
  backgroundColor = "#00D09E",
  textColor = "#000000",
  customLeftComponent,
  customRightComponent,
  onBackPress,
  onNotificationPress,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    }
  };

  const currentHour = new Date().getHours();
  let greeting = "Good Morning";
  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good Afternoon";
  } else if (currentHour >= 17) {
    greeting = "Good Evening";
  }

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          <Text style={[styles.welcomeText, { color: textColor }]}>
            Hi, Welcome Back
          </Text>
          <Text style={[styles.greetingText, { color: textColor }]}>
            {greeting}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleNotificationPress}
        >
          <View style={styles.notificationIconContainer}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={textColor}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 28,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#FFFFFF",
    opacity: 0.7,
    marginTop: 2,
  },
  notificationButton: {
    marginLeft: 16,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppHeader;
