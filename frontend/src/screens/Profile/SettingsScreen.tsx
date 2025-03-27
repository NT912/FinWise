import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import commonProfileStyles from "../../styles/profile/commonProfileStyles";

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const settingsItems = [
    {
      icon: "notifications-outline",
      title: "Notification Settings",
      description: "Manage your notifications",
      onPress: () => navigation.navigate("NotificationSettingsScreen"),
    },
    {
      icon: "shield-outline",
      title: "Change Password",
      description: "Update your account password",
      onPress: () => navigation.navigate("ChangePassword"),
    },
    {
      icon: "trash-outline",
      title: "Delete Account",
      description: "Permanently delete your account",
      onPress: () => navigation.navigate("DeleteAccountScreen"),
      isDanger: true,
    },
  ];

  return (
    <SafeAreaView style={commonProfileStyles.container}>
      <View style={commonProfileStyles.enhancedHeader}>
        <TouchableOpacity
          style={commonProfileStyles.enhancedBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={commonProfileStyles.enhancedHeaderTitle}>Settings</Text>
      </View>

      <ScrollView
        style={commonProfileStyles.scrollView}
        contentContainerStyle={commonProfileStyles.scrollContent}
      >
        <View style={commonProfileStyles.section}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                commonProfileStyles.menuItem,
                index === settingsItems.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={item.onPress}
            >
              <View style={commonProfileStyles.menuIcon}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={item.isDanger ? "#FF6B6B" : "#00C897"}
                />
              </View>
              <View style={commonProfileStyles.menuContent}>
                <Text
                  style={[
                    commonProfileStyles.menuTitle,
                    item.isDanger && { color: "#FF6B6B" },
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={commonProfileStyles.menuDescription}>
                  {item.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
