import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";

// Xác định kiểu cho navigation
type NavigationProp = StackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.balance}>Total Balance: $5,250.00</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Transactions")}
        >
          <Text style={styles.cardText}>Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Categories")}
        >
          <Text style={styles.cardText}>Categories</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Savings")}
        >
          <Text style={styles.cardText}>Savings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.cardText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
  balance: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  cardText: { fontSize: 16, fontWeight: "bold", color: "#00C897" },
});
