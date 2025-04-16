import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ProfileStackParamList } from "../../navigation/AppNavigator";

// FAQ data with categories
const FAQData = [
  {
    id: "1",
    question: "How to use FinWise?",
    answer:
      "FinWise is a personal finance management app that helps you track your income, expenses, and savings. Navigate through the tabs to access different features.",
    category: "general",
  },
  {
    id: "2",
    question: "How much does it cost to use FinWise?",
    answer:
      "FinWise is free to use with basic features. Premium features may require a subscription.",
    category: "general",
  },
  {
    id: "3",
    question: "How to contact support?",
    answer:
      "You can contact our support team through the Contact Us tab or by sending an email to tt912002@gmail.com.",
    category: "general",
  },
  {
    id: "4",
    question: "How can I reset my password if I forgot it?",
    answer:
      "Go to the login screen and tap on 'Forgot Password'. Follow the instructions to reset your password.",
    category: "account",
  },
  {
    id: "5",
    question: "Are there any privacy or data security measures in place?",
    answer:
      "Yes, we use industry-standard encryption to protect your data. You can read our privacy policy for more details.",
    category: "account",
  },
  {
    id: "6",
    question: "Can I customize settings within the application?",
    answer:
      "Yes, you can customize various settings including notifications, themes, and security options from your profile.",
    category: "services",
  },
  {
    id: "7",
    question: "How can I delete my account?",
    answer:
      "Go to Profile > Settings > Delete Account. You will need to enter your password to confirm deletion.",
    category: "account",
  },
  {
    id: "8",
    question: "How do I access my expense history?",
    answer:
      "You can view your transaction history in the Transactions tab. You can filter and search for specific transactions.",
    category: "services",
  },
  {
    id: "9",
    question: "Can I use the app offline?",
    answer:
      "Some features of FinWise work offline, but synchronization with the cloud requires an internet connection.",
    category: "services",
  },
];

// Contact data
const ContactData = [
  {
    id: "1",
    name: "Customer Service",
    icon: "headset",
  },
  {
    id: "2",
    name: "Website",
    icon: "globe",
  },
  {
    id: "3",
    name: "Facebook",
    icon: "logo-facebook",
  },
  {
    id: "4",
    name: "Whatsapp",
    icon: "logo-whatsapp",
  },
  {
    id: "5",
    name: "Instagram",
    icon: "logo-instagram",
  },
];

const HelpScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const [activeTab, setActiveTab] = useState("faq"); // 'faq' or 'contact'
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  const handleNotificationPress = () => {
    // Điều hướng trực tiếp đến màn hình NotificationScreen ở root navigator
    navigation.navigate("NotificationScreen" as any);
  };

  // Filter FAQs based on search query and active category
  const filteredFAQs = FAQData.filter(
    (faq) =>
      (activeCategory === "all" || faq.category === activeCategory) &&
      (searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Toggle question expansion
  const toggleQuestion = (id: string) => {
    if (expandedQuestions.includes(id)) {
      setExpandedQuestions(expandedQuestions.filter((qId) => qId !== id));
    } else {
      setExpandedQuestions([...expandedQuestions, id]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00D09E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & FAQS</Text>
        <TouchableOpacity
          style={styles.rightIcon}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Help Title */}
        <Text style={styles.helpTitle}>How Can We Help You?</Text>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "faq" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("faq")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "faq" && styles.activeTabText,
              ]}
            >
              FAQ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "contact" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("contact")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "contact" && styles.activeTabText,
              ]}
            >
              Contact Us
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "faq" ? (
          <>
            {/* Category Tabs */}
            <View style={styles.categoryContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  activeCategory === "general" && styles.activeCategoryTab,
                ]}
                onPress={() => setActiveCategory("general")}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === "general" && styles.activeCategoryText,
                  ]}
                >
                  General
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  activeCategory === "account" && styles.activeCategoryTab,
                ]}
                onPress={() => setActiveCategory("account")}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === "account" && styles.activeCategoryText,
                  ]}
                >
                  Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  activeCategory === "services" && styles.activeCategoryTab,
                ]}
                onPress={() => setActiveCategory("services")}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === "services" && styles.activeCategoryText,
                  ]}
                >
                  Services
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Ionicons
                name="search"
                size={20}
                color="#888"
                style={styles.searchIcon}
              />
            </View>

            {/* FAQ List */}
            <ScrollView style={styles.faqContainer}>
              {filteredFAQs.map((faq) => (
                <TouchableOpacity
                  key={faq.id}
                  style={styles.faqItem}
                  onPress={() => toggleQuestion(faq.id)}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={styles.questionText}>{faq.question}</Text>
                    <Ionicons
                      name={
                        expandedQuestions.includes(faq.id)
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={24}
                      color="#333"
                    />
                  </View>

                  {expandedQuestions.includes(faq.id) && (
                    <Text style={styles.answerText}>{faq.answer}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : (
          // Contact Us Tab
          <ScrollView style={styles.contactContainer}>
            {ContactData.map((contact) => (
              <TouchableOpacity key={contact.id} style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Ionicons
                    name={contact.icon as any}
                    size={24}
                    color="#00D09E"
                  />
                </View>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Ionicons name="chevron-forward" size={24} color="#888" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  rightIcon: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F6F9F8",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E5F8F0",
    borderRadius: 30,
    marginBottom: 20,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 30,
  },
  activeTabButton: {
    backgroundColor: "#00D09E",
  },
  tabButtonText: {
    fontSize: 16,
    color: "#333",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E5F8F0",
  },
  activeCategoryTab: {
    backgroundColor: "#E5F8F0",
    borderBottomWidth: 2,
    borderBottomColor: "#00D09E",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  activeCategoryText: {
    color: "#00D09E",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  searchIcon: {
    marginLeft: 8,
  },
  faqContainer: {
    flex: 1,
  },
  faqItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: "#E5E5E5",
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  answerText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
    lineHeight: 20,
  },
  contactContainer: {
    flex: 1,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 12,
    padding: 16,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5F8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
});

export default HelpScreen;
