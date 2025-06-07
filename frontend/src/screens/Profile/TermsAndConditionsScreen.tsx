import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons   } from "react-native-vector-icons/Ionicons";
import Checkbox from "expo-checkbox";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import categoryStyles from "../../styles/category/categoryStyles";

const TermsAndConditionsScreen = ({ navigation }: { navigation: any }) => {
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAccept = () => {
    // Implement terms acceptance logic here
    console.log("Terms accepted");
    navigation.goBack();
  };

  // Xử lý khi nhấn nút thông báo
  const handleNotificationPress = () => {
    // Điều hướng trực tiếp đến màn hình NotificationScreen ở root navigator
    navigation.navigate("NotificationScreen" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#00D09E"
        translucent={true}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Terms And Conditions</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationPress}
          >
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.sectionTitle}>
            Terms of Use and Service Agreement
          </Text>

          <Text style={styles.paragraph}>
            Welcome to FinWise. By accessing or using our application, you agree
            to be bound by these Terms and Conditions. These terms affect your
            legal rights and obligations, so if you do not agree to these terms,
            please do not use our application or services.
          </Text>

          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>
              1. Account Registration and Security
            </Text>
            <Text style={styles.bulletPoint}>
              2. Personal Information and Privacy Policy
            </Text>
            <Text style={styles.bulletPoint}>
              3. Use of Services and User Conduct
            </Text>
            <Text style={styles.bulletPoint}>
              4. Financial Information and Disclaimer
            </Text>
          </View>

          <Text style={styles.paragraph}>
            FinWise provides personal finance management tools that allow you to
            track expenses, create budgets, and analyze your spending habits. We
            are not a financial institution and do not provide financial advice.
            All decisions you make based on information provided by our
            application are at your own discretion and risk.
          </Text>

          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>
              • You are responsible for maintaining the confidentiality of your
              account credentials.
            </Text>
            <Text style={styles.bulletPoint}>
              • We collect and process your data in accordance with our Privacy
              Policy.
            </Text>
          </View>

          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time without prior
            notice. Your continued use of the application after any changes to
            these terms constitutes your acceptance of such changes. If you
            violate these terms, we may suspend or terminate your account and
            access to our services.
          </Text>

          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.readMoreLink}>
              Read the complete terms and conditions at finwise.app.me
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={isAccepted}
              onValueChange={setIsAccepted}
              color={isAccepted ? "#00D09E" : undefined}
              style={styles.checkbox}
            />
            <Text style={styles.checkboxLabel}>
              I accept all the terms and conditions
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.acceptButton, !isAccepted && styles.disabledButton]}
            onPress={handleAccept}
            disabled={!isAccepted}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 20,
    backgroundColor: "#00D09E",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  notificationButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: "#F0FFF4",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 16,
  },
  bulletPoints: {
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 8,
  },
  readMoreLink: {
    fontSize: 14,
    color: "#00D09E",
    textDecorationLine: "underline",
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#666666",
  },
  acceptButton: {
    backgroundColor: "#00D09E",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default TermsAndConditionsScreen;
