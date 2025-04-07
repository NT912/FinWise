import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TabSelector from "../components/common/TabSelector";

const ExampleTabScreen = ({ navigation }: { navigation: any }) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Define the content for each tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <ScrollView style={styles.contentContainer}>
            <Text style={styles.title}>Overview</Text>
            <Text style={styles.description}>
              This is the overview section of the example tab screen. Here you
              can display general information.
            </Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Key Information</Text>
              <Text style={styles.cardText}>
                This is a sample card showing how content can be organized in
                this tab.
              </Text>
            </View>
          </ScrollView>
        );
      case "details":
        return (
          <ScrollView style={styles.contentContainer}>
            <Text style={styles.title}>Details</Text>
            <Text style={styles.description}>
              This is the details section where more specific information can be
              shown.
            </Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Specifications</Text>
              <Text style={styles.cardText}>
                Here are some detailed specifications about the item or topic.
              </Text>
            </View>
          </ScrollView>
        );
      case "settings":
        return (
          <ScrollView style={styles.contentContainer}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.description}>
              Configure your preferences and options in this tab.
            </Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Preferences</Text>
              <Text style={styles.cardText}>
                Adjust your settings and preferences here.
              </Text>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Example Tab Screen</Text>
      </View>

      {/* Use the TabSelector component */}
      <TabSelector
        options={[
          { key: "overview", label: "Overview", icon: "information-circle" },
          { key: "details", label: "Details", icon: "list" },
          { key: "settings", label: "Settings", icon: "settings" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Render the content based on the active tab */}
      <View style={styles.content}>{renderTabContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3FFF8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 200, 151, 0.1)",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 200, 151, 0.1)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00D09E",
    marginLeft: 15,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  contentContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00D09E",
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default ExampleTabScreen;
