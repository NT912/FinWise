import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { toggleFaceID, getUserProfile } from "../../services/profileService";
import FaceIDSetup from "../../components/profile/FaceIDSetup";
import LoadingIndicator from "../../components/LoadingIndicator";
import securityStyles from "../../styles/profile/securityStyles";

const FaceIDScreen = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleToggleFaceID = async (enabled: boolean) => {
    try {
      setLoading(true);
      await toggleFaceID(enabled);

      Alert.alert(
        "Success",
        enabled
          ? "Face ID authentication enabled"
          : "Face ID authentication disabled"
      );
    } catch (error) {
      console.error("Error toggling Face ID:", error);
      Alert.alert("Error", "Failed to update Face ID settings");
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={securityStyles.container}>
      <View style={securityStyles.header}>
        <TouchableOpacity
          style={securityStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={securityStyles.title}>Face ID</Text>
      </View>

      <ScrollView
        style={securityStyles.content}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00C897"]}
            tintColor="#00C897"
          />
        }
      >
        <FaceIDSetup onToggle={handleToggleFaceID} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default FaceIDScreen;
