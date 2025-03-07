import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://via.placeholder.com/100" }}
        style={styles.avatar}
      />
      <Text style={styles.name}>John Smith</Text>
      <Text>Email: johnsmith@email.com</Text>
      <Text>Phone: +123 456 789</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 20, backgroundColor: "#f0f0f0" },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: "bold" },
});

export default ProfileScreen;
