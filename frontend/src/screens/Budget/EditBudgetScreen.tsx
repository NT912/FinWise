import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../../theme";
import { formatVND } from "../../utils/formatters";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import {
  addListener,
  categorySelectEventKey,
} from "../Category/SelectCategoryScreen";
import * as budgetService from "../../services/budgetService";

// Define Category interface
interface Category {
  _id: string;
  name: string;
  color?: string;
  icon?: string;
  type: "expense" | "income" | "both";
}

// Define route params interface
type EditBudgetRouteParams = {
  budgetId: string;
};

type EditBudgetScreenRouteProp = RouteProp<
  { EditBudget: EditBudgetRouteParams },
  "EditBudget"
>;

const EditBudgetScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<EditBudgetScreenRouteProp>();
  const { budgetId } = route.params;

  // Create a unique listener ID
  const categoryListenerIdRef = useRef(`edit_budget_${Date.now()}`);

  // Form state
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedPeriod, setSelectedPeriod] = useState(
    "This month (01/05 - 31/05)"
  );
  const [selectedType, setSelectedType] = useState("Total");
  const [repeatBudget, setRepeatBudget] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  );
  const [datePickerType, setDatePickerType] = useState<"start" | "end">(
    "start"
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load existing budget data
  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        setLoading(true);
        // Fetch the budget data by ID
        const budgetData = await budgetService.getBudgetById(budgetId);

        // Set form values from existing budget
        setAmount(budgetData.amount.toString());

        // Handle category
        if (budgetData.categories && budgetData.categories.length > 0) {
          // In a real app, you would fetch category details here
          // For now, we're using mock data
          const categoryId = budgetData.categories[0];

          // This would come from your category service in a real app
          const category = {
            _id: categoryId,
            name: budgetData.category?.name || "Budget Category",
            color: budgetData.category?.color || "#4CAF50",
            icon: budgetData.category?.icon || "cash-outline",
            type: "expense" as "expense" | "income" | "both",
          };

          setSelectedCategory(category);
        }

        // Set dates
        if (budgetData.startDate) {
          setStartDate(new Date(budgetData.startDate));
        }

        if (budgetData.endDate) {
          setEndDate(new Date(budgetData.endDate));
        }

        // Format and set period display
        const formattedStart = new Date(
          budgetData.startDate
        ).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
        });

        const formattedEnd = new Date(budgetData.endDate).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "2-digit",
          }
        );

        setSelectedPeriod(`This month (${formattedStart} - ${formattedEnd})`);

        // Set repeat
        setRepeatBudget(budgetData.isRecurring || false);

        // Set budget type
        setSelectedType(
          budgetData.categories.length > 1 ? "Total" : "Category"
        );
      } catch (error) {
        console.error("Error fetching budget data:", error);
        Alert.alert("Error", "Failed to load budget data. Please try again.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    // Add listener for category selection events
    const cleanup = addListener(
      `${categorySelectEventKey}_${categoryListenerIdRef.current}`,
      (category: Category) => handleSelectCategory(category)
    );

    fetchBudgetData();

    // Clean up the listener when component unmounts
    return cleanup;
  }, [budgetId]);

  // Format amount with dots separator
  const formatAmountWithDots = (value: string): string => {
    if (!value) return "";
    const numericValue = value.replace(/\D/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle amount change
  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/\./g, "");
    setAmount(cleanValue);
  };

  // Handle category selection
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  // Navigate to select category screen
  const navigateToSelectCategory = () => {
    // Navigate to category selection screen
    navigation.navigate("SelectCategory" as any, {
      type: "expense", // Default to expense type for budgets
      listenerId: categoryListenerIdRef.current,
    });
  };

  // Handle date selection
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (datePickerType === "start") {
        setStartDate(selectedDate);

        // If start date is after end date, update end date too
        if (selectedDate > endDate) {
          const newEndDate = new Date(selectedDate);
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          setEndDate(newEndDate);
        }
      } else {
        setEndDate(selectedDate);
      }

      // Update period display
      const formattedStart = startDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });
      const formattedEnd = endDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });
      setSelectedPeriod(`This month (${formattedStart} - ${formattedEnd})`);
    }
  };

  // Show date picker
  const showStartDatePicker = () => {
    setDatePickerType("start");
    setShowDatePicker(true);
  };

  const showEndDatePicker = () => {
    setDatePickerType("end");
    setShowDatePicker(true);
  };

  // Handle period selection
  const navigateToSelectPeriod = () => {
    // Show date picker menu with options
    Alert.alert("Select Period", "Choose a budget period", [
      {
        text: "This Month",
        onPress: () => {
          const today = new Date();
          const startOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          const endOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          );
          setStartDate(startOfMonth);
          setEndDate(endOfMonth);
          setSelectedPeriod("This month (01/05 - 31/05)");
        },
      },
      {
        text: "Next Month",
        onPress: () => {
          const today = new Date();
          const startOfNextMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            1
          );
          const endOfNextMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 2,
            0
          );
          setStartDate(startOfNextMonth);
          setEndDate(endOfNextMonth);
          setSelectedPeriod("Next month");
        },
      },
      {
        text: "Custom Start Date",
        onPress: showStartDatePicker,
      },
      {
        text: "Custom End Date",
        onPress: showEndDatePicker,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  // Handle type selection
  const navigateToSelectType = () => {
    // Navigate to type selection screen
    Alert.alert("Budget Type", "Select budget type", [
      {
        text: "Total Budget",
        onPress: () => setSelectedType("Total"),
      },
      {
        text: "Category Budget",
        onPress: () => setSelectedType("Category"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  // Toggle repeat budget
  const toggleRepeatBudget = () => {
    setRepeatBudget(!repeatBudget);
  };

  // Handle save
  const handleSave = async () => {
    if (!amount || parseInt(amount, 10) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    try {
      setSaving(true);

      // Create budget object
      const budgetData = {
        name: `Budget for ${selectedCategory.name}`, // Generate name from category
        amount: parseInt(amount, 10),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        categories: [selectedCategory._id],
        walletId: "default-wallet-id", // Use default wallet ID
        isRecurring: repeatBudget,
        recurringFrequency: "monthly" as "weekly" | "monthly" | "yearly",
        notificationThreshold: 80, // Default 80%
        notes: `Budget for ${selectedCategory.name}`,
      };

      // Call API to update budget
      await budgetService.updateBudget(budgetId, budgetData);

      // Show success message
      Alert.alert("Success", "Budget updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error updating budget:", error);
      Alert.alert("Error", "Failed to update budget. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete this budget?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              // For recurring budgets, ask if user wants to delete all instances
              if (repeatBudget) {
                Alert.alert(
                  "Delete Recurring Budget",
                  "Do you want to delete all recurring instances of this budget?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                      onPress: () => setDeleting(false),
                    },
                    {
                      text: "This instance only",
                      onPress: async () => {
                        await budgetService.deleteBudget(budgetId, false);
                        Alert.alert("Success", "Budget deleted successfully");
                        navigation.goBack();
                      },
                    },
                    {
                      text: "All instances",
                      style: "destructive",
                      onPress: async () => {
                        await budgetService.deleteBudget(budgetId, true);
                        Alert.alert(
                          "Success",
                          "All recurring budgets deleted successfully"
                        );
                        navigation.goBack();
                      },
                    },
                  ]
                );
              } else {
                // Delete single budget
                await budgetService.deleteBudget(budgetId);
                Alert.alert("Success", "Budget deleted successfully");
                navigation.goBack();
              }
            } catch (error) {
              console.error("Error deleting budget:", error);
              Alert.alert(
                "Error",
                "Failed to delete budget. Please try again."
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle="light-content"
        translucent
      />

      <SafeAreaView style={{ flex: 0, backgroundColor: colors.primary }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Budget</Text>
          <View style={{ width: 40 }} />
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.contentContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingView}
              keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
              <View style={styles.mainContainer}>
                <View style={styles.budgetCard}>
                  {/* Category Selector */}
                  <TouchableOpacity
                    style={styles.itemRow}
                    onPress={navigateToSelectCategory}
                  >
                    <View style={styles.itemLeft}>
                      {selectedCategory ? (
                        <>
                          <View
                            style={[
                              styles.categoryIcon,
                              {
                                backgroundColor:
                                  selectedCategory.color || "#CCCCCC",
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                (selectedCategory.icon as any) || "grid-outline"
                              }
                              size={20}
                              color="#FFFFFF"
                            />
                          </View>
                          <Text style={styles.itemText}>
                            {selectedCategory.name}
                          </Text>
                        </>
                      ) : (
                        <>
                          <View style={styles.emptyCategoryIcon}>
                            <Ionicons
                              name="grid-outline"
                              size={20}
                              color="#FFFFFF"
                            />
                          </View>
                          <Text style={styles.placeholderText}>
                            Select category
                          </Text>
                        </>
                      )}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#CCCCCC"
                    />
                  </TouchableOpacity>
                  <View style={styles.divider} />

                  {/* Amount Input */}
                  <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <View style={styles.amountInputRow}>
                      <View style={styles.currencyContainer}>
                        <Text style={styles.currencyText}>VND</Text>
                      </View>
                      <TextInput
                        style={styles.amountInput}
                        placeholder="0"
                        value={formatAmountWithDots(amount)}
                        onChangeText={handleAmountChange}
                        keyboardType="numeric"
                        placeholderTextColor="#000000"
                      />
                    </View>
                  </View>
                  <View style={styles.divider} />

                  {/* Period Selector */}
                  <TouchableOpacity
                    style={styles.itemRow}
                    onPress={navigateToSelectPeriod}
                  >
                    <View style={styles.itemLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#333333"
                        />
                      </View>
                      <Text style={styles.itemText}>{selectedPeriod}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#CCCCCC"
                    />
                  </TouchableOpacity>
                  <View style={styles.divider} />

                  {/* Budget Type */}
                  <TouchableOpacity
                    style={styles.itemRow}
                    onPress={navigateToSelectType}
                  >
                    <View style={styles.itemLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons
                          name="earth-outline"
                          size={20}
                          color="#333333"
                        />
                      </View>
                      <Text style={styles.itemText}>{selectedType}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#CCCCCC"
                    />
                  </TouchableOpacity>
                </View>

                {/* Repeat Budget Toggle */}
                <View style={styles.repeatContainer}>
                  <View style={styles.repeatTextContainer}>
                    <Text style={styles.repeatLabel}>Repeat this budget</Text>
                    <Text style={styles.repeatDescription}>
                      Budget will renew automatically.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      repeatBudget
                        ? styles.toggleActive
                        : styles.toggleInactive,
                    ]}
                    onPress={toggleRepeatBudget}
                  >
                    <View
                      style={[
                        styles.toggleHandle,
                        repeatBudget
                          ? styles.toggleHandleRight
                          : styles.toggleHandleLeft,
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.bottomContainer}>
                  {/* Delete Button */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    )}
                  </TouchableOpacity>

                  {/* Save Button */}
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      amount && parseInt(amount, 10) > 0 && !saving
                        ? styles.saveButtonActive
                        : styles.saveButtonInactive,
                    ]}
                    onPress={handleSave}
                    disabled={!amount || parseInt(amount, 10) <= 0 || saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>

        {/* Date Picker for iOS */}
        {showDatePicker && Platform.OS === "ios" && (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.datePickerModal}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.datePickerButton}
                  >
                    <Text style={styles.datePickerButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerTitle}>Select Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.datePickerButton}
                  >
                    <Text style={styles.datePickerButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={datePickerType === "start" ? startDate : endDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  style={styles.datePicker}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Date Picker for Android */}
        {showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={datePickerType === "start" ? startDate : endDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
    marginTop: 10,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.primary,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  cancelText: {
    fontSize: 17,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  mainContainer: {
    flex: 1,
    padding: 16,
  },
  budgetCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emptyCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    color: "#333333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#AAAAAA",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 16,
  },
  amountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: "#999999",
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyContainer: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  repeatContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  repeatTextContainer: {
    flex: 1,
  },
  repeatLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  repeatDescription: {
    fontSize: 13,
    color: "#888888",
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleInactive: {
    backgroundColor: "#CCCCCC",
  },
  toggleHandle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  toggleHandleLeft: {
    alignSelf: "flex-start",
  },
  toggleHandleRight: {
    alignSelf: "flex-end",
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingHorizontal: 24,
    marginTop: "auto",
    marginBottom: 20,
  },
  saveButton: {
    height: 56,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    width: "48%",
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonActive: {
    backgroundColor: colors.primary,
  },
  saveButtonInactive: {
    backgroundColor: "#CCCCCC",
  },
  deleteButton: {
    height: 56,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    width: "48%",
    paddingHorizontal: 24,
    backgroundColor: "#FF3B30",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  datePickerModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  datePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  datePickerButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  datePicker: {
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
});

export default EditBudgetScreen;
