import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import helpStyles from "../../styles/profile/helpStyles";
import TabSelector from "../../components/common/TabSelector";
import commonProfileStyles from "../../styles/profile/commonProfileStyles";

const FAQData = [
  {
    question: "How to use FinWise?",

    answer:
      "FinWise is a personal finance management app that helps you track your income, expenses, and savings. Navigate through the tabs to access different features.",
  },
  {
    question: "How much does it cost to use FinWise?",
    answer:
      "FinWise is free to use with basic features. Premium features may require a subscription.",
  },
  {
    question: "How to contact support?",
    answer:
      "You can contact our support team through the Online Support tab or by sending an email to support@finwise.com.",
  },
  {
    question: "How to reset my password if I forget it?",
    answer:
      "Go to the login screen and tap on 'Forgot Password'. Follow the instructions to reset your password.",
  },
  {
    question: "Are there any privacy or data security measures in place?",
    answer:
      "Yes, we use industry-standard encryption to protect your data. You can read our privacy policy for more details.",
  },
  {
    question: "Can I customize settings within the application?",
    answer:
      "Yes, you can customize various settings including notifications, themes, and security options from your profile.",
  },
  {
    question: "How do I access my expense history?",
    answer:
      "You can view your transaction history in the Transactions tab. You can filter and search for specific transactions.",
  },
  {
    question: "Can I use the app offline?",
    answer:
      "Some features of FinWise work offline, but synchronization with the cloud requires an internet connection.",
  },
];

const HelpScreen = ({ navigation }: { navigation: any }) => {
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      isUser: false,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const filteredFAQs = FAQData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      isUser: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, userMessage]);
    setNewMessage("");

    // Simulate response after a short delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "Thank you for your message. Our support team will get back to you soon.",
        isUser: false,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }, 1000);
  };

  return (
    <SafeAreaView style={helpStyles.container}>
      <View style={commonProfileStyles.enhancedHeader}>
        <TouchableOpacity
          style={commonProfileStyles.enhancedBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={commonProfileStyles.enhancedHeaderTitle}>Help Center</Text>
      </View>

      <TabSelector
        options={[
          { key: "faq", label: "FAQ", icon: "help-circle" },
          { key: "contact", label: "Contact", icon: "chatbubble-ellipses" },
          { key: "terms", label: "Terms", icon: "document-text" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <View style={helpStyles.content}>
        {activeTab === "faq" ? (
          <>
            <View style={helpStyles.searchContainer}>
              <Ionicons name="search" size={20} color="#888" />
              <TextInput
                style={helpStyles.searchInput}
                placeholder="Search FAQs..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView style={helpStyles.faqContainer}>
              {filteredFAQs.map((faq, index) => (
                <View key={index} style={helpStyles.faqItem}>
                  <Text style={helpStyles.faqQuestion}>{faq.question}</Text>
                  <Text style={helpStyles.faqAnswer}>{faq.answer}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        ) : activeTab === "contact" ? (
          <View style={helpStyles.chatContainer}>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View
                  style={[
                    helpStyles.messageItem,
                    item.isUser
                      ? helpStyles.userMessage
                      : helpStyles.supportMessage,
                  ]}
                >
                  <Text
                    style={[
                      helpStyles.messageText,
                      item.isUser && helpStyles.userMessageText,
                    ]}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: item.isUser ? "#eee" : "#888",
                      marginTop: 5,
                      textAlign: "right",
                    }}
                  >
                    {item.time}
                  </Text>
                </View>
              )}
              style={helpStyles.messageList}
            />

            <View style={helpStyles.inputContainer}>
              <TextInput
                style={helpStyles.input}
                placeholder="Type your message..."
                value={newMessage}
                onChangeText={setNewMessage}
              />
              <TouchableOpacity
                style={helpStyles.sendButton}
                onPress={sendMessage}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : activeTab === "terms" ? (
          <ScrollView style={helpStyles.termsContainer}>
            <Text style={helpStyles.termsTitle}>Terms & Conditions</Text>
            <Text style={helpStyles.termsText}>
              <Text style={{ fontWeight: "bold" }}>1. Acceptance of Terms</Text>
              {"\n"}
              By accessing and using the FinWise application, you agree to be
              bound by these Terms and Conditions, all applicable laws and
              regulations, and agree that you are responsible for compliance
              with any applicable local laws.
              {"\n\n"}
              <Text style={{ fontWeight: "bold" }}>2. Privacy Policy</Text>
              {"\n"}
              Your use of FinWise is also subject to our Privacy Policy, which
              describes how we collect, use, and share your personal
              information.
              {"\n\n"}
              <Text style={{ fontWeight: "bold" }}>3. User Accounts</Text>
              {"\n"}
              To use certain features of FinWise, you may be required to create
              an account. You are responsible for maintaining the
              confidentiality of your account information and for all activities
              that occur under your account.
              {"\n\n"}
              <Text style={{ fontWeight: "bold" }}>
                4. Financial Information
              </Text>
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
                marginBottom: 10,
              }}
            >
              <Ionicons name="checkbox-outline" size={24} color="#00D09E" />
              <Text style={{ marginLeft: 10, color: "#333" }}>
                I accept all terms and conditions
              </Text>
            </View>

            <TouchableOpacity
              style={helpStyles.button}
              onPress={() => navigation.navigate("TermsAndConditionsScreen")}
            >
              <Text style={helpStyles.buttonText}>View Details</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default HelpScreen;
