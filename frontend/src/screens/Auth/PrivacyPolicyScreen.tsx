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

const PrivacyPolicyScreen = () => {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.paragraph}>
            FinWise is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our mobile application.
          </Text>
          <Text style={styles.paragraph}>
            Please read this Privacy Policy carefully. If you do not agree with
            the terms of this Privacy Policy, please do not access the
            application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            1. Collection of Your Information
          </Text>
          <Text style={styles.paragraph}>
            We may collect information about you in various ways. The
            information we may collect via the Application includes:
          </Text>
          <Text style={styles.bulletPoint}>
            • Personal Data: Personally identifiable information, such as your
            name, email address, and date of birth, that you voluntarily give to
            us when you register with the Application.
          </Text>
          <Text style={styles.bulletPoint}>
            • Financial Data: Information related to your financial accounts,
            transactions, and spending habits that you choose to provide or that
            is generated through your use of the Application.
          </Text>
          <Text style={styles.bulletPoint}>
            • Device Data: Information about your mobile device's operating
            system, IP address, browser type, browser version, and other
            technology on the devices you use to access the Application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use of Your Information</Text>
          <Text style={styles.paragraph}>
            Having accurate information about you permits us to provide you with
            a smooth, efficient, and customized experience. Specifically, we may
            use information collected about you via the Application to:
          </Text>
          <Text style={styles.bulletPoint}>
            • Create and manage your account.
          </Text>
          <Text style={styles.bulletPoint}>
            • Provide personalized financial insights and recommendations.
          </Text>
          <Text style={styles.bulletPoint}>
            • Process transactions and track spending patterns.
          </Text>
          <Text style={styles.bulletPoint}>
            • Send you alerts and notifications about your financial activities.
          </Text>
          <Text style={styles.bulletPoint}>
            • Develop new features and improve the Application.
          </Text>
          <Text style={styles.bulletPoint}>
            • Resolve disputes and troubleshoot problems.
          </Text>
          <Text style={styles.bulletPoint}>
            • Prevent fraudulent transactions and monitor against theft.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. Disclosure of Your Information
          </Text>
          <Text style={styles.paragraph}>
            We may share information we have collected about you in certain
            situations. Your information may be disclosed as follows:
          </Text>
          <Text style={styles.bulletPoint}>
            • By Law or to Protect Rights: If we believe the release of
            information about you is necessary to respond to legal process, to
            investigate or remedy potential violations of our policies, or to
            protect the rights, property, and safety of others, we may share
            your information as permitted or required by any applicable law,
            rule, or regulation.
          </Text>
          <Text style={styles.bulletPoint}>
            • Third-Party Service Providers: We may share your information with
            third parties that perform services for us or on our behalf,
            including payment processing, data analysis, email delivery, hosting
            services, customer service, and marketing assistance.
          </Text>
          <Text style={styles.bulletPoint}>
            • With Your Consent: We may disclose your personal information for
            any other purpose with your consent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            4. Security of Your Information
          </Text>
          <Text style={styles.paragraph}>
            We use administrative, technical, and physical security measures to
            help protect your personal information. While we have taken
            reasonable steps to secure the personal information you provide to
            us, please be aware that despite our efforts, no security measures
            are perfect or impenetrable, and no method of data transmission can
            be guaranteed against any interception or other type of misuse.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            5. Your Rights Regarding Your Data
          </Text>
          <Text style={styles.paragraph}>
            You have the right to access, rectify, or delete your personal
            information that we collect and process. You may also have the right
            to restrict or object to our processing of your personal data and
            the right to data portability.
          </Text>
          <Text style={styles.paragraph}>
            To exercise these rights, please contact us at privacy@finwise.com.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions or comments about this Privacy Policy, please
            contact us at:
          </Text>
          <Text style={styles.paragraph}>
            FinWise App{"\n"}
            Email: tt912002@gmail.com{"\n"}
            Phone: 0918835701
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

export default PrivacyPolicyScreen;
