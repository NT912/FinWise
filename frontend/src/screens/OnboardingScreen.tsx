import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = StackNavigationProp<RootStackParamList, "Onboarding">;

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FinWise!</Text>
      <Text style={styles.subtitle}>
        Manage your finances easily with our app.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("Home")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E3FFF8",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00C897",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#00C897",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
