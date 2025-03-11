import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import securityStyles from "../../styles/profile/securityStyles";

const TermsAndConditionsScreen = ({ navigation }: { navigation: any }) => {
  return (
    <SafeAreaView style={securityStyles.container}>
      <View style={securityStyles.header}>
        <TouchableOpacity
          style={securityStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={securityStyles.title}>Terms And Conditions</Text>
      </View>

      <ScrollView style={securityStyles.content}>
        <View style={securityStyles.menuContainer}>
          <Text style={{ fontSize: 16, lineHeight: 24, color: "#333" }}>
            <Text style={{ fontWeight: "bold" }}>1. Acceptance of Terms</Text>
            {"\n"}
            By accessing and using the FinWise application, you agree to be
            bound by these Terms and Conditions, all applicable laws and
            regulations, and agree that you are responsible for compliance with
            any applicable local laws.
            {"\n\n"}
            <Text style={{ fontWeight: "bold" }}>2. Privacy Policy</Text>
            {"\n"}
            Your use of FinWise is also subject to our Privacy Policy, which
            describes how we collect, use, and share your personal information.
            {"\n\n"}
            <Text style={{ fontWeight: "bold" }}>3. User Accounts</Text>
            {"\n"}
            To use certain features of FinWise, you may be required to create an
            account. You are responsible for maintaining the confidentiality of
            your account information and for all activities that occur under
            your account.
            {"\n\n"}
            <Text style={{ fontWeight: "bold" }}>4. Financial Information</Text>
            {"\n"}
            FinWise provides tools for financial management. The information
            provided by FinWise is for informational purposes only and should
            not be considered financial advice.
            {"\n\n"}
            <Text style={{ fontWeight: "bold" }}>
              5. Limitation of Liability
            </Text>
            {"\n"}
            FinWise and its developers shall not be liable for any direct,
            indirect, incidental, special, consequential or exemplary damages
            resulting from your use of the application.
            {"\n\n"}
            <Text style={{ fontWeight: "bold" }}>6. Changes to Terms</Text>
            {"\n"}
            We reserve the right to modify these terms at any time. Your
            continued use of FinWise after such changes constitutes your
            acceptance of the new terms.
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Ionicons name="checkbox-outline" size={24} color="#00C897" />
            <Text style={{ marginLeft: 10, color: "#333" }}>
              I accept all terms and conditions
            </Text>
          </View>

          <TouchableOpacity
            style={[securityStyles.button, { marginTop: 20 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={securityStyles.buttonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsAndConditionsScreen;
