import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const TermsOfUseScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Use</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using FinWise, you agree to be bound by these Terms
            of Use. If you do not agree to these terms, please do not use our
            application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. User Accounts</Text>
          <Text style={styles.paragraph}>
            To use certain features of FinWise, you may be required to create a
            user account. You are responsible for maintaining the
            confidentiality of your account credentials and for all activities
            that occur under your account.
          </Text>
          <Text style={styles.paragraph}>
            You agree to provide accurate, current, and complete information
            during the registration process and to update such information to
            keep it accurate, current, and complete.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Privacy</Text>
          <Text style={styles.paragraph}>
            Your privacy is important to us. Our Privacy Policy describes how we
            collect, use, and disclose information about you. By using FinWise,
            you consent to the collection, use, and disclosure of your
            information as described in our Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Prohibited Activities</Text>
          <Text style={styles.paragraph}>
            You agree not to engage in any of the following activities:
          </Text>
          <Text style={styles.bulletPoint}>
            • Attempting to bypass any security features of the application
          </Text>
          <Text style={styles.bulletPoint}>
            • Using the application for any illegal purpose or in violation of
            any local, state, national, or international law
          </Text>
          <Text style={styles.bulletPoint}>
            • Creating multiple accounts or providing false information
          </Text>
          <Text style={styles.bulletPoint}>
            • Interfering with or disrupting the operation of the application
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Financial Information</Text>
          <Text style={styles.paragraph}>
            FinWise provides tools for financial management and analysis. The
            information provided through the application is for informational
            purposes only and should not be considered as financial advice.
          </Text>
          <Text style={styles.paragraph}>
            You are solely responsible for your financial decisions and actions.
            We recommend consulting with a qualified financial advisor before
            making important financial decisions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms of Use at any time. If we
            make material changes to these Terms, we will notify you through the
            application or by other means.
          </Text>
          <Text style={styles.paragraph}>
            Your continued use of FinWise after the changes take effect
            constitutes your acceptance of the revised Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to terminate or suspend your account and access
            to FinWise at our sole discretion, without notice, for conduct that
            we believe violates these Terms of Use or is harmful to other users,
            us, or third parties, or for any other reason.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms of Use, please contact
            us at support@finwise.com.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Last Updated: April 10, 2023</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333333",
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333333",
    marginLeft: 16,
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#999999",
  },
});

export default TermsOfUseScreen;
