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
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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
import * as walletService from "../../services/walletService";
import { useToast } from "../../components/ToastProvider";

// Define Category interface
interface Category {
  _id: string;
  name: string;
  color?: string;
  icon?: string;
  type: "expense" | "income" | "both";
}

// Define Wallet interface
interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  isIncludedInTotal?: boolean;
}

const CreateBudgetScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const toast = useToast();

  // Create a unique listener ID
  const categoryListenerIdRef = useRef(`create_budget_${Date.now()}`);

  // Form state
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedPeriod, setSelectedPeriod] = useState(
    "This month (01/05 - 31/05)"
  );
  const [repeatBudget, setRepeatBudget] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  );
  const [datePickerType, setDatePickerType] = useState<"start" | "end">(
    "start"
  );
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  // Set up category selection listener and fetch wallets
  useEffect(() => {
    // Add listener for category selection events
    const cleanup = addListener(
      `${categorySelectEventKey}_${categoryListenerIdRef.current}`,
      (category: Category) => handleSelectCategory(category)
    );

    // Fetch wallets
    const fetchWallets = async () => {
      setLoadingWallets(true);
      try {
        const fetchedWallets = await walletService.fetchWallets();
        setWallets(fetchedWallets);

        // Set default wallet if available
        const defaultWallet = fetchedWallets.find((w) => w.isDefault);
        if (defaultWallet) {
          setSelectedWallet(defaultWallet);
        } else if (fetchedWallets.length > 0) {
          setSelectedWallet(fetchedWallets[0]);
        }
      } catch (error) {
        console.error("Error fetching wallets:", error);
      } finally {
        setLoadingWallets(false);
      }
    };

    fetchWallets();

    // Clean up the listener when component unmounts
    return cleanup;
  }, []);

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
    if (selectedDate) {
      // Tạo một bản sao mới của ngày được chọn
      setTempDate(new Date(selectedDate.getTime()));
    }
  };

  // Apply selected date when Done is pressed
  const applySelectedDate = () => {
    if (!tempDate) return;

    try {
      console.log("Applying date:", tempDate);

      // Tạo các bản sao mới cho startDate và endDate để tránh tham chiếu
      let newStartDate = new Date(startDate.getTime());
      let newEndDate = new Date(endDate.getTime());

      if (datePickerType === "start") {
        // Cập nhật ngày bắt đầu
        newStartDate = new Date(tempDate.getTime());

        // Nếu ngày bắt đầu sau ngày kết thúc, cập nhật ngày kết thúc
        if (newStartDate > endDate) {
          newEndDate = new Date(newStartDate.getTime());
          newEndDate.setMonth(newEndDate.getMonth() + 1);
        }
      } else {
        // Cập nhật ngày kết thúc
        newEndDate = new Date(tempDate.getTime());

        // Nếu ngày kết thúc trước ngày bắt đầu, cập nhật ngày bắt đầu
        if (newEndDate < startDate) {
          newStartDate = new Date(newEndDate.getTime());
          newStartDate.setMonth(newStartDate.getMonth() - 1);
        }
      }

      // Cập nhật state với các giá trị mới
      setStartDate(newStartDate);
      setEndDate(newEndDate);

      // Cập nhật hiển thị thời kỳ dựa trên các ngày mới
      const formattedStart = formatDate(newStartDate);
      const formattedEnd = formatDate(newEndDate);

      // Tính toán thời gian để xác định loại kỳ hạn
      const durationInDays = Math.round(
        (newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const durationInMonths =
        (newEndDate.getFullYear() - newStartDate.getFullYear()) * 12 +
        newEndDate.getMonth() -
        newStartDate.getMonth();

      // Xác định tên thời kỳ dựa trên khoảng thời gian
      let periodName = "Custom period";
      if (
        durationInDays <= 31 &&
        newStartDate.getMonth() === newEndDate.getMonth() &&
        newStartDate.getFullYear() === newEndDate.getFullYear()
      ) {
        periodName = "This month";
      } else if (durationInMonths === 3) {
        periodName = "Quarter";
      } else if (durationInMonths === 6) {
        periodName = "Half year";
      } else if (durationInMonths === 12) {
        periodName = "Year";
      }

      // Cập nhật hiển thị thời kỳ
      setSelectedPeriod(`${periodName} (${formattedStart} - ${formattedEnd})`);

      console.log(
        "Updated period:",
        `${periodName} (${formattedStart} - ${formattedEnd})`
      );
    } catch (error) {
      console.error("Error applying date:", error);
    } finally {
      // Đóng date picker và xóa tempDate
      setShowDatePicker(false);
      setTempDate(null);
    }
  };

  // Cancel date selection
  const cancelDateSelection = () => {
    setShowDatePicker(false);
    setTempDate(null);
  };

  // Format date consistently as DD/MM/YYYY
  const formatDate = (date: Date, includeYear = false) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const formatted = `${day}/${month}`;
    return includeYear ? `${formatted}/${date.getFullYear()}` : formatted;
  };

  // Update period display text based on current start and end dates
  const updatePeriodDisplay = () => {
    // Lấy ngày hiện tại
    const currentStartDate = new Date(startDate);
    const currentEndDate = new Date(endDate);

    // Format dates consistently
    const formattedStart = formatDate(currentStartDate);
    const formattedEnd = formatDate(currentEndDate);

    // Calculate duration in days
    const durationInDays = Math.round(
      (currentEndDate.getTime() - currentStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const durationInMonths =
      (currentEndDate.getFullYear() - currentStartDate.getFullYear()) * 12 +
      currentEndDate.getMonth() -
      currentStartDate.getMonth();

    // Determine the appropriate period name based on the duration
    let periodName = "Custom period";
    if (
      durationInDays <= 31 &&
      currentStartDate.getMonth() === currentEndDate.getMonth() &&
      currentStartDate.getFullYear() === currentEndDate.getFullYear()
    ) {
      periodName = "This month";
    } else if (durationInMonths === 3) {
      periodName = "Quarter";
    } else if (durationInMonths === 6) {
      periodName = "Half year";
    } else if (durationInMonths === 12) {
      periodName = "Year";
    }

    // Sử dụng setSelectedPeriod để cập nhật UI
    setSelectedPeriod(`${periodName} (${formattedStart} - ${formattedEnd})`);
  };

  // Show date picker
  const showStartDatePicker = () => {
    setDatePickerType("start");
    setTempDate(startDate);
    setShowDatePicker(true);
  };

  const showEndDatePicker = () => {
    setDatePickerType("end");
    setTempDate(endDate);
    setShowDatePicker(true);
  };

  // Handle period selection
  const navigateToSelectPeriod = () => {
    setShowPeriodModal(true);
  };

  // Select period option
  const handleSelectPeriod = (option: string) => {
    const today = new Date();

    switch (option) {
      case "this_month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );
        setStartDate(startOfMonth);
        setEndDate(endOfMonth);

        const thisMonthStart = formatDate(startOfMonth);
        const thisMonthEnd = formatDate(endOfMonth);
        setSelectedPeriod(`This month (${thisMonthStart} - ${thisMonthEnd})`);
        break;

      case "next_month":
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

        const nextMonthStart = formatDate(startOfNextMonth);
        const nextMonthEnd = formatDate(endOfNextMonth);
        setSelectedPeriod(`Next month (${nextMonthStart} - ${nextMonthEnd})`);
        break;

      case "quarter":
        const startOfQuarter = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );
        const endOfQuarter = new Date(
          today.getFullYear(),
          today.getMonth() + 3,
          0
        );
        setStartDate(startOfQuarter);
        setEndDate(endOfQuarter);

        const quarterStart = formatDate(startOfQuarter);
        const quarterEnd = formatDate(endOfQuarter);
        setSelectedPeriod(`Quarter (${quarterStart} - ${quarterEnd})`);
        break;

      case "half_year":
        const startOfHalfYear = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );
        const endOfHalfYear = new Date(
          today.getFullYear(),
          today.getMonth() + 6,
          0
        );
        setStartDate(startOfHalfYear);
        setEndDate(endOfHalfYear);

        const halfYearStart = formatDate(startOfHalfYear);
        const halfYearEnd = formatDate(endOfHalfYear);
        setSelectedPeriod(`Half year (${halfYearStart} - ${halfYearEnd})`);
        break;

      case "year":
        const startOfYear = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfYear = new Date(
          today.getFullYear(),
          today.getMonth() + 12,
          0
        );
        setStartDate(startOfYear);
        setEndDate(endOfYear);

        const yearStart = formatDate(startOfYear);
        const yearEnd = formatDate(endOfYear);
        setSelectedPeriod(`Year (${yearStart} - ${yearEnd})`);
        break;

      case "custom":
        setShowDatePicker(true);
        setDatePickerType("start");
        setTempDate(new Date(startDate));
        break;
    }

    // Close the period modal
    setShowPeriodModal(false);
  };

  // Toggle repeat budget
  const toggleRepeatBudget = () => {
    setRepeatBudget(!repeatBudget);
  };

  // Handle wallet selection
  const handleSelectWallet = (wallet: Wallet) => {
    setSelectedWallet(wallet);
  };

  // Navigate to wallet selection
  const navigateToSelectWallet = () => {
    if (loadingWallets) {
      return; // Đang tải, không mở modal
    }

    if (wallets.length === 0) {
      // Không có ví, hiển thị trạng thái "Không có ví" trong modal
      setShowWalletModal(true);
    } else {
      setShowWalletModal(true);
    }
  };

  // Render wallet item
  const renderWalletItem = ({ item }: { item: Wallet }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        backgroundColor:
          selectedWallet?._id === item._id
            ? "rgba(0, 127, 255, 0.05)"
            : "transparent",
        borderRadius: 12,
        paddingHorizontal: 10,
      }}
      onPress={() => {
        handleSelectWallet(item);
        setShowWalletModal(false);
      }}
    >
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
          backgroundColor: item.color || colors.primary,
          elevation: 3,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        <Ionicons
          name={(item.icon as any) || "wallet-outline"}
          size={24}
          color="#FFFFFF"
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#333333",
            marginBottom: 4,
          }}
        >
          {item.name}
        </Text>
        <Text style={{ fontSize: 14, color: "#666666" }}>
          {formatVND(item.balance)}
        </Text>
      </View>
      {selectedWallet?._id === item._id && (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  // Handle save
  const handleSave = async () => {
    if (!amount || parseInt(amount, 10) <= 0) {
      toast.showToast("Please enter a valid amount", "error");
      return;
    }

    if (!selectedCategory) {
      toast.showToast("Please select a category", "error");
      return;
    }

    if (!selectedWallet) {
      toast.showToast("Please select a wallet", "error");
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
        walletId: selectedWallet._id,
        isRecurring: repeatBudget,
        recurringFrequency: "monthly" as "weekly" | "monthly" | "yearly",
        notificationThreshold: 80, // Default 80%
        notes: `Budget for ${selectedCategory.name}`,
      };

      // Call API to create budget
      await budgetService.createBudget(budgetData);

      // Show success message
      toast.showToast("Budget created successfully", "success");

      // Navigate back to previous screen after short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      console.error("Error creating budget:", error);
      toast.showToast("Failed to create budget. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={styles.headerTitle}>Add Budget</Text>
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

                  {/* Wallet Selector */}
                  <TouchableOpacity
                    style={styles.itemRow}
                    onPress={navigateToSelectWallet}
                  >
                    <View style={styles.itemLeft}>
                      {selectedWallet ? (
                        <>
                          <View
                            style={[
                              styles.walletIconSelected,
                              {
                                backgroundColor:
                                  selectedWallet.color || colors.primary,
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                (selectedWallet.icon as any) || "wallet-outline"
                              }
                              size={20}
                              color="#FFFFFF"
                            />
                          </View>
                          <Text style={styles.itemText}>
                            {selectedWallet.name}
                          </Text>
                        </>
                      ) : (
                        <>
                          <View style={styles.iconContainer}>
                            <Ionicons
                              name="wallet-outline"
                              size={20}
                              color="#333333"
                            />
                          </View>
                          <Text style={styles.placeholderText}>
                            Select wallet
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

                {/* Save Button */}
                <View style={styles.bottomContainer}>
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

        {/* Period Selection Modal */}
        <Modal
          visible={showPeriodModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPeriodModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowPeriodModal(false)}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    paddingBottom: 30,
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: "#F0F0F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: "#333333",
                      }}
                    >
                      Select Period
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowPeriodModal(false)}
                      style={{ padding: 5 }}
                    >
                      <Ionicons name="close" size={24} color="#333333" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {/* This Month */}
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: "#F0F0F0",
                      }}
                      onPress={() => handleSelectPeriod("this_month")}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: "#4CAF50",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#333333",
                          }}
                        >
                          This Month
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#666666",
                            marginTop: 4,
                          }}
                        >
                          Current month budget period
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Next Month */}
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: "#F0F0F0",
                      }}
                      onPress={() => handleSelectPeriod("next_month")}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: "#2196F3",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#333333",
                          }}
                        >
                          Next Month
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#666666",
                            marginTop: 4,
                          }}
                        >
                          Plan ahead for next month
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Quarter */}
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: "#F0F0F0",
                      }}
                      onPress={() => handleSelectPeriod("quarter")}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: "#9C27B0",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#333333",
                          }}
                        >
                          Quarter
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#666666",
                            marginTop: 4,
                          }}
                        >
                          Three month period
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Half Year */}
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: "#F0F0F0",
                      }}
                      onPress={() => handleSelectPeriod("half_year")}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: "#FF9800",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#333333",
                          }}
                        >
                          Half Year
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#666666",
                            marginTop: 4,
                          }}
                        >
                          Six month period
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Year */}
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: "#F0F0F0",
                      }}
                      onPress={() => handleSelectPeriod("year")}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: "#F44336",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#333333",
                          }}
                        >
                          Year
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#666666",
                            marginTop: 4,
                          }}
                        >
                          Full year budget
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Custom Start Date */}
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: "#F0F0F0",
                      }}
                      onPress={() => {
                        setShowPeriodModal(false);
                        // Wait for modal to close before showing date picker
                        setTimeout(() => {
                          setDatePickerType("start");
                          setShowDatePicker(true);
                        }, 300);
                      }}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: "#607D8B",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <Ionicons
                          name="calendar-number-outline"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#333333",
                          }}
                        >
                          Custom Start Date
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#666666",
                            marginTop: 4,
                          }}
                        >
                          Current: {formatDate(startDate, true)}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Custom End Date */}
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 16,
                      }}
                      onPress={() => {
                        setShowPeriodModal(false);
                        // Wait for modal to close before showing date picker
                        setTimeout(() => {
                          setDatePickerType("end");
                          setShowDatePicker(true);
                        }, 300);
                      }}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: "#795548",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <Ionicons
                          name="calendar-number-outline"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#333333",
                          }}
                        >
                          Custom End Date
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#666666",
                            marginTop: 4,
                          }}
                        >
                          Current: {formatDate(endDate, true)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Wallet Selection Modal */}
        <Modal
          visible={showWalletModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowWalletModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowWalletModal(false)}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    paddingBottom: 30,
                    width: "100%",
                    maxHeight: "70%",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: "#F0F0F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: "#333333",
                      }}
                    >
                      Select Wallet
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowWalletModal(false)}
                      style={{ padding: 5 }}
                    >
                      <Ionicons name="close" size={24} color="#333333" />
                    </TouchableOpacity>
                  </View>

                  {loadingWallets ? (
                    <View style={styles.emptyStateContainer}>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <Text style={styles.emptyStateText}>
                        Loading wallets...
                      </Text>
                    </View>
                  ) : wallets.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                      <Ionicons
                        name="wallet-outline"
                        size={60}
                        color="#CCCCCC"
                      />
                      <Text style={styles.emptyStateText}>
                        You don't have any wallets yet
                      </Text>
                      <Text style={styles.emptyStateSubText}>
                        Please create a wallet first
                      </Text>
                      <TouchableOpacity
                        style={styles.createWalletButton}
                        onPress={() => {
                          setShowWalletModal(false);
                          navigation.navigate("CreateWallet" as any);
                        }}
                      >
                        <Text style={styles.createWalletButtonText}>
                          Create Wallet
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <FlatList
                      data={wallets}
                      renderItem={renderWalletItem}
                      keyExtractor={(item) => item._id}
                      contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 10,
                        paddingBottom: 20,
                      }}
                      showsVerticalScrollIndicator={false}
                      ItemSeparatorComponent={() => (
                        <View
                          style={{
                            height: 1,
                            backgroundColor: "#F0F0F0",
                            marginLeft: 76,
                          }}
                        />
                      )}
                    />
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Date Picker for iOS */}
        {showDatePicker && Platform.OS === "ios" && (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => cancelDateSelection()}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.datePickerModal}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity
                    onPress={cancelDateSelection}
                    style={styles.datePickerButton}
                  >
                    <Text style={styles.datePickerButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerTitle}>
                    {datePickerType === "start"
                      ? "Select Start Date"
                      : "Select End Date"}
                  </Text>
                  <TouchableOpacity
                    onPress={applySelectedDate}
                    style={styles.datePickerButton}
                  >
                    <Text style={styles.datePickerButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={
                    tempDate ||
                    (datePickerType === "start" ? startDate : endDate)
                  }
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
          <TouchableWithoutFeedback>
            <View style={styles.modalBackdrop}>
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 20,
                  width: "90%",
                  alignSelf: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#333333",
                    }}
                  >
                    {datePickerType === "start"
                      ? "Select Start Date"
                      : "Select End Date"}
                  </Text>
                </View>

                <DateTimePicker
                  value={
                    tempDate ||
                    (datePickerType === "start" ? startDate : endDate)
                  }
                  mode="date"
                  display="calendar"
                  onChange={handleDateChange}
                  style={{ alignSelf: "center", marginVertical: 10 }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: 20,
                  }}
                >
                  <TouchableOpacity
                    onPress={cancelDateSelection}
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: "500" }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={applySelectedDate}
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: "500" }}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
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
    justifyContent: "center",
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
    width: "100%",
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
  walletIconSelected: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#666666",
  },
  createWalletButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
  },
  createWalletButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CreateBudgetScreen;
