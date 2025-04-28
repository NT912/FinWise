import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { colors } from "../../theme";
import { updateWallet, Wallet } from "../../services/walletService";
import {
  formatNumberWithCommas,
  parseFormattedNumber,
} from "../../utils/formatters";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

// Wallet icon options
const WALLET_ICONS = [
  "wallet-outline",
  "cash-outline",
  "card-outline",
  "home-outline",
  "briefcase-outline",
  "gift-outline",
  "cart-outline",
  "business-outline",
  "car-outline",
  "airplane-outline",
  "pricetag-outline",
  "restaurant-outline",
  "medical-outline",
  "school-outline",
];

// Wallet color options
const WALLET_COLORS = [
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#F44336",
  "#FF9800",
  "#795548",
  "#607D8B",
  "#009688",
  "#E91E63",
  "#673AB7",
  "#3F51B5",
  "#00BCD4",
  "#CDDC39",
  "#FFC107",
];

// Define the type for the route params
type EditWalletScreenParams = {
  wallet: Wallet;
};

type EditWalletScreenRouteProp = RouteProp<
  { EditWalletScreen: EditWalletScreenParams },
  "EditWalletScreen"
>;

const EditWalletScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EditWalletScreenRouteProp>();
  const { wallet } = route.params;

  const [name, setName] = useState(wallet.name);
  const [balance, setBalance] = useState(wallet.balance.toString());
  const [formattedBalance, setFormattedBalance] = useState(
    formatNumberWithCommas(wallet.balance.toString())
  );
  const [selectedColor, setSelectedColor] = useState(wallet.color);
  const [selectedIcon, setSelectedIcon] = useState(wallet.icon);
  const [isIncludedInTotal, setIsIncludedInTotal] = useState(
    wallet.isIncludedInTotal
  );
  const [isDefault, setIsDefault] = useState(wallet.isDefault);
  const [note, setNote] = useState(wallet.note || "");
  const [loading, setLoading] = useState(false);

  // Handle balance change with formatting
  const handleBalanceChange = (text: string) => {
    // Remove non-numeric characters for actual value
    const numericValue = text.replace(/[^0-9]/g, "");
    setBalance(numericValue);

    // Format with thousand separators
    if (numericValue) {
      setFormattedBalance(formatNumberWithCommas(numericValue));
    } else {
      setFormattedBalance("");
    }
  };

  // Handle save changes
  const handleSave = async () => {
    if (!name.trim()) {
      showErrorToast("Error", "Please enter a wallet name");
      return;
    }

    try {
      setLoading(true);

      // Create updated wallet data
      const updatedWalletData = {
        name,
        balance: parseFloat(balance) || 0,
        color: selectedColor,
        icon: selectedIcon,
        isIncludedInTotal,
        isDefault,
        note: note.trim(),
      };

      await updateWallet(wallet._id, updatedWalletData);

      showSuccessToast("Success", "Wallet updated successfully");

      // Navigate back after update
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.error("Error updating wallet:", error);
      showErrorToast(
        "Error",
        "Failed to update wallet. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Wallet</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={styles.saveButton}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Wallet Information Form */}
        <View style={styles.formContainer}>
          {/* Wallet Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Wallet Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter wallet name"
              value={name}
              onChangeText={setName}
              maxLength={30}
            />
          </View>

          {/* Wallet Balance */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Current Balance</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formattedBalance}
              onChangeText={handleBalanceChange}
              keyboardType="numeric"
            />
          </View>

          {/* Wallet Note */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Note</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Add a note about this wallet (optional)"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              maxLength={100}
            />
          </View>

          {/* Wallet Color Selection */}
          <View style={styles.optionContainer}>
            <Text style={styles.optionTitle}>Wallet Color</Text>
            <View style={styles.colorGrid}>
              {WALLET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorItem,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorItem,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Wallet Icon Selection */}
          <View style={styles.optionContainer}>
            <Text style={styles.optionTitle}>Wallet Icon</Text>
            <View style={styles.iconGrid}>
              {WALLET_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconItem,
                    { backgroundColor: selectedColor },
                    selectedIcon === icon && styles.selectedIconItem,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Ionicons name={icon as any} size={24} color="#FFF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Wallet Options */}
          <View style={styles.walletOptionsContainer}>
            <View style={styles.switchOption}>
              <Text style={styles.switchLabel}>Include in Total Balance</Text>
              <Switch
                value={isIncludedInTotal}
                onValueChange={setIsIncludedInTotal}
                trackColor={{ false: "#D1D1D6", true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.switchOption}>
              <Text style={styles.switchLabel}>Set as Default Wallet</Text>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: "#D1D1D6", true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  content: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
    marginBottom: -50,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  optionContainer: {
    marginBottom: 24,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 10,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColorItem: {
    borderWidth: 2,
    borderColor: "#000000",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  iconItem: {
    width: 50,
    height: 50,
    borderRadius: 10,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIconItem: {
    borderWidth: 2,
    borderColor: "#000000",
  },
  walletOptionsContainer: {
    marginTop: 10,
  },
  switchOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
});

export default EditWalletScreen;
