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
import settingsStyles from "../../styles/profile/settingsStyles";

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={settingsStyles.container}>
      <View style={settingsStyles.header}>
        <TouchableOpacity
          style={{ padding: 5 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={settingsStyles.title}>Settings</Text>
      </View>

      <ScrollView>
        <View style={settingsStyles.menuContainer}>
          <TouchableOpacity
            style={settingsStyles.menuItem}
            onPress={() => navigation.navigate("NotificationSettingsScreen")}
          >
            <View style={settingsStyles.menuIcon}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#00C897"
              />
            </View>
            <Text style={settingsStyles.menuText}>Notification Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={settingsStyles.menuItem}
            onPress={() => navigation.navigate("SecurityScreen")}
          >
            <View style={settingsStyles.menuIcon}>
              <Ionicons name="shield-outline" size={24} color="#00C897" />
            </View>
            <Text style={settingsStyles.menuText}>Password Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={settingsStyles.menuItem}
            onPress={() => navigation.navigate("DeleteAccountScreen")}
          >
            <View
              style={[settingsStyles.menuIcon, { backgroundColor: "#FFE5E5" }]}
            >
              <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
            </View>
            <Text style={[settingsStyles.menuText, settingsStyles.dangerText]}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
