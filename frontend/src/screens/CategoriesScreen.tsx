import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const categories = [
  { id: "1", name: "Food & Drinks", budget: "$300" },
  { id: "2", name: "Shopping", budget: "$500" },
  { id: "3", name: "Entertainment", budget: "$150" },
];

export default function CategoriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.budget}>Budget: {item.budget}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#E3FFF8" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00C897",
    marginBottom: 20,
  },
  categoryItem: {
    padding: 15,
    backgroundColor: "#FFF",
    marginBottom: 10,
    borderRadius: 8,
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  name: { fontSize: 16, fontWeight: "bold", color: "#333" },
  budget: { fontSize: 14, color: "#777" },
});
