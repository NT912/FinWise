import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";

const TermsAndConditionsScreen = () => {
  const navigation = useNavigation();
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAccept = () => {
    // TODO: Implement terms acceptance logic here
    console.log("Terms accepted");
    navigation.goBack();
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Terms And Conditions</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.sectionTitle}>
            Est Fugiat Assumenda Aut Reprehenderit
          </Text>

          <Text style={styles.paragraph}>
            Lorem ipsum dolor sit amet. Et odio officia aut voluptas internos
            est omnis vitae ut architecto aut non tenetur fuga ut provident
            vero. Quo asperiatur facere et consectetur ipsum et facere corrupti
            est asperiores facere. Est fugiat assumenda aut reprehenderit
            voluptatem sed.
          </Text>

          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>
              • Est voluptates omnis qui sequi sequi.
            </Text>
            <Text style={styles.bulletPoint}>
              • Est aliquam ducimus ut cupiditate ut repellendus.
            </Text>
            <Text style={styles.bulletPoint}>
              • Aut ipsum quis qui porro quasi qui minus placeat.
            </Text>
            <Text style={styles.bulletPoint}>
              • Sit consequatur neque ab vitas facere.
            </Text>
          </View>

          <Text style={styles.paragraph}>
            Aut quidem accusantium nam alias autem eius officiis placere. Et
            omnis autem ut architecto qui corrupti officia eum aliquam
            provident. Eum voluptas error et omnis delenium cum molestiae nobis
            et odio molestiae quo magnam impedit sed fugiat nihil vero.
          </Text>

          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>
              • Aut fuga sequi eum voluptatibus provident.
            </Text>
            <Text style={styles.bulletPoint}>
              • Est consequatur voluptas vel error neque aut dignissimos velit.
            </Text>
          </View>

          <Text style={styles.paragraph}>
            Vel exercitationem quam vel eligendi rerum. At neque accusantium et
            nostrum beatae? In accusantium dolores est laborum aut molestiae
            provident sed qui mollitia non enim. At corporis aut odit molestiae
            est reprehenderit itaque qui molestiae dolor qui neque repellat.
          </Text>

          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.readMoreLink}>
              Read the terms and conditions in more detail at finwise.com/terms
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
    paddingTop: 11,
    backgroundColor: "#00D09E",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
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
