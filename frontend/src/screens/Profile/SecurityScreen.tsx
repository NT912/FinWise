import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getUserProfile } from "../../services/profileService";
import securityStyles from "../../styles/profile/securityStyles";

const SecurityScreen = ({ navigation }: { navigation: any }) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await getUserProfile(); // Refresh user data silently
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <SafeAreaView style={securityStyles.container}>
      <View style={securityStyles.header}>
        <TouchableOpacity
          style={securityStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={securityStyles.title}>Security</Text>
      </View>

      <ScrollView
        style={securityStyles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00C897"]}
            tintColor="#00C897"
          />
        }
      >
        <View style={securityStyles.menuContainer}>
          <TouchableOpacity
            style={securityStyles.menuItem}
            onPress={() => navigation.navigate("ChangePasswordScreen")}
          >
            <Ionicons name="lock-closed-outline" size={24} color="#00C897" />
            <Text style={securityStyles.menuText}>Change Password</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#ccc"
              style={securityStyles.chevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={securityStyles.menuItem}
            onPress={() => navigation.navigate("FaceIDScreen")}
          >
            <MaterialCommunityIcons
              name="face-recognition"
              size={24}
              color="#00C897"
            />
            <Text style={securityStyles.menuText}>Face ID</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#ccc"
              style={securityStyles.chevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={securityStyles.menuItem}
            onPress={() => navigation.navigate("TermsAndConditionsScreen")}
          >
            <Ionicons name="document-text-outline" size={24} color="#00C897" />
            <Text style={securityStyles.menuText}>Terms And Conditions</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#ccc"
              style={securityStyles.chevron}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SecurityScreen;
