import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteAccount } from "../../services/profileService";
import DeleteAccountForm from "../../components/profile/DeleteAccountForm";
import LoadingIndicator from "../../components/LoadingIndicator";
import securityStyles from "../../styles/profile/securityStyles";

const DeleteAccountScreen = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async (password: string) => {
    if (!password) {
      Alert.alert("Error", "Please enter your password to confirm deletion");
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteAccount(password);
              await AsyncStorage.removeItem("token");

              Alert.alert("Success", "Your account has been deleted", [
                {
                  text: "OK",
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "Login" }],
                    });
                  },
                },
              ]);
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert(
                "Error",
                "Failed to delete account. Please check your password and try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

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
        <Text style={securityStyles.title}>Delete Account</Text>
      </View>

      <View style={securityStyles.content}>
        <View style={securityStyles.menuContainer}>
          <DeleteAccountForm
            onDelete={handleDeleteAccount}
            onCancel={() => navigation.goBack()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DeleteAccountScreen;
