import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ChangePasswordForm from "../../components/profile/ChangePasswordForm";
import securityStyles from "../../styles/profile/securityStyles";

const ChangePasswordScreen = ({ navigation }: { navigation: any }) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      // Refresh logic if needed (silently)
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleSuccess = () => {
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={securityStyles.container}>
      <View style={securityStyles.header}>
        <TouchableOpacity
          style={securityStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={securityStyles.title}>Change Password</Text>
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
        <ChangePasswordForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
