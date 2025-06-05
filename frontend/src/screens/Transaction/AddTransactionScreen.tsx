import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createTransaction } from "../../services/transactionService";
import { getAllCategories } from "../../services/categoryService";
import { Category } from "../../types/category";
import { formatVND } from "../../utils/formatters";
import { formatDate } from "../../utils/dateUtils";
import { Transaction } from "../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { checkServerConnection } from "../../services/apiService";
import AppHeader from "../../components/common/AppHeader";
import { useToast } from "../../components/ToastProvider";
import { colors } from "../../theme";
import { useWallet, Wallet } from "../../hooks/useWallet";
import {
  addListener,
  categorySelectEventKey,
} from "../../screens/Category/SelectCategoryScreen";
import apiClient from "../../services/apiClient";

type RouteParams = {
  AddTransaction: {
    preSelectedCategory?: string;
    preSelectedWalletId?: string;
    type?: "expense" | "income";
  };
};

type CategoryType = "expense" | "income" | "both";

const AddTransactionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<RouteParams, "AddTransaction">>();
  const { preSelectedCategory, preSelectedWalletId, type } = route.params || {};
  const toast = useToast();

  // Transaction data
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [note, setNote] = useState("");
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    type || "expense"
  );

  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [connectionError, setConnectionError] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const { wallets, getWallets } = useWallet();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const modalY = useRef(new Animated.Value(500)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Create a unique listener ID
  const categoryListenerIdRef = useRef(`add_transaction_${Date.now()}`);

  // Set up category selection listener
  useEffect(() => {
    // Add listener for category selection events
    const cleanup = addListener(
      `${categorySelectEventKey}_${categoryListenerIdRef.current}`,
      (category: Category) => handleSelectCategory(category)
    );

    // Clean up the listener when component unmounts
    return cleanup;
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Thêm flag để theo dõi đã load dữ liệu chưa
  const [hasLoaded, setHasLoaded] = useState(false);

  // Kiểm tra kết nối và load dữ liệu ban đầu
  useEffect(() => {
    // Chỉ load dữ liệu nếu chưa load trước đó
    if (!hasLoaded) {
      const initializeScreen = async () => {
        try {
          setLoading(true);

          // Kiểm tra kết nối server
          const isConnected = await checkServerConnection();
          setConnectionError(!isConnected);

          if (isConnected) {
            // Load categories và wallets đồng thời
            const [categoriesResult, walletsResult] = await Promise.all([
              getAllCategories(),
              getWallets(),
            ]);

            // Xử lý categories
            setCategories(categoriesResult);

            // Tìm category phù hợp để chọn
            if (preSelectedCategory) {
              const selectedCat = categoriesResult.find(
                (cat: Category) => cat._id === preSelectedCategory
              );
              if (selectedCat) {
                setSelectedCategory(selectedCat);
              }
            } else if (categoriesResult.length > 0) {
              const matchingCategory = categoriesResult.find(
                (cat: Category) =>
                  cat.type === transactionType ||
                  cat.type === ("both" as CategoryType)
              );
              if (matchingCategory) {
                setSelectedCategory(matchingCategory);
              }
            }

            // Xử lý wallets
            if (walletsResult && walletsResult.length > 0) {
              if (preSelectedWalletId) {
                const preselectedWallet = walletsResult.find(
                  (w: Wallet) => w._id === preSelectedWalletId
                );
                if (preselectedWallet) {
                  setSelectedWallet(preselectedWallet);
                } else {
                  // Nếu không tìm thấy ví đã chọn trước, dùng ví mặc định
                  const defaultWallet =
                    walletsResult.find((w: Wallet) => w.isDefault) ||
                    walletsResult[0];
                  setSelectedWallet(defaultWallet);
                }
              } else {
                // Không có ví đã chọn trước, dùng ví mặc định
                const defaultWallet =
                  walletsResult.find((w: Wallet) => w.isDefault) ||
                  walletsResult[0];
                setSelectedWallet(defaultWallet);
              }
            }

            setHasLoaded(true);
          }
        } catch (error) {
          console.error("Error initializing AddTransactionScreen:", error);
          setConnectionError(true);
          Alert.alert(
            "Error",
            "Cannot load data. Please check your network connection and try again."
          );
        } finally {
          setLoading(false);
          setLoadingCategories(false);
        }
      };

      initializeScreen();
    }
  }, [
    preSelectedCategory,
    preSelectedWalletId,
    transactionType,
    hasLoaded,
    getWallets,
  ]);

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    // For iOS, if the user presses "Done", use the selectedDate
    // For Android, it triggers with a type="set" and includes the selectedDate
    if (Platform.OS === "ios") {
      // If a valid date is selected
      if (selectedDate) {
        setSelectedDate(selectedDate);
      }
      // Only close the picker when the Done or Cancel buttons are pressed
      // Don't close it for onChange events
    } else {
      // For Android
      if (event.type === "dismissed") {
        setShowDatePicker(false);
        return;
      }

      if (selectedDate) {
        setSelectedDate(selectedDate);
        setShowDatePicker(false);
      }
    }
  };

  // Handle category selection
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  // Thử kết nối lại với server
  const retryConnection = async () => {
    try {
      setLoading(true);
      const isConnected = await checkServerConnection();
      setConnectionError(!isConnected);

      if (isConnected) {
        // Nếu kết nối thành công, tải lại danh mục
        const data = await getAllCategories();
        setCategories(data);
        Alert.alert("Success", "Connected to the server successfully.");
      } else {
        Alert.alert(
          "Connection Error",
          "Cannot connect to the server. Please check your network connection and try again later."
        );
      }
    } catch (error) {
      console.error("Error retrying connection:", error);
      Alert.alert(
        "Error",
        "Cannot connect to the server. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Format amount with dots after every 3 digits (VND format)
  const formatAmountWithDots = (value: string): string => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, "");

    // Format with dots
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle amount input change
  const handleAmountChange = (value: string) => {
    // Store raw value for submission
    const rawValue = value.replace(/\./g, "");

    // Format for display
    const formattedValue = formatAmountWithDots(rawValue);
    console.log("Setting amount to:", formattedValue); // Debug log
    setAmount(formattedValue);
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    console.log("isFormValid called with amount:", amount);

    // Check if we have a valid amount
    const parsedAmount = parseFloat(amount.replace(/\./g, ""));
    console.log("Parsed amount:", parsedAmount, "isNaN:", isNaN(parsedAmount));

    const hasValidAmount = !!(
      amount &&
      !isNaN(parsedAmount) &&
      parsedAmount > 0
    );
    console.log(
      "Debug - amount:",
      amount,
      "parsedAmount:",
      parsedAmount,
      "hasValidAmount:",
      hasValidAmount
    );

    // Check if we have a selected category
    const hasCategory = !!selectedCategory;
    console.log(
      "Debug - selectedCategory:",
      selectedCategory?.name,
      "hasCategory:",
      hasCategory
    );

    // Check if we have a selected wallet
    const hasWallet = !!selectedWallet;
    console.log(
      "Debug - selectedWallet:",
      selectedWallet?.name,
      "hasWallet:",
      hasWallet
    );

    const isValid = hasValidAmount && hasCategory && hasWallet;
    console.log("Debug - isFormValid result:", isValid);

    return isValid;
  };

  // Handle form submission with retry logic
  const handleSubmit = async () => {
    try {
      // 1. Validate form data
      if (!amount || parseFloat(amount) <= 0) {
        Alert.alert("Error", "Please enter a valid amount");
        return;
      }

      if (!selectedCategory) {
        Alert.alert("Error", "Please select a category");
        return;
      }

      if (!selectedWallet) {
        Alert.alert("Error", "Please select a wallet");
        return;
      }

      // Parse amount to number
      const amountValue = parseFloat(amount.replace(/\./g, ""));

      // Set submitting state to true
      setLoading(true);

      // 2. Check if server is available
      const isServerAvailable = await checkServerConnection();
      if (!isServerAvailable) {
        setConnectionError(true);
        setLoading(false);
        return;
      }

      // Kiểm tra và cập nhật lại transactionType dựa vào loại của category
      // Đảm bảo rằng giao dịch với danh mục thu nhập được tạo với type là "income"
      let finalTransactionType = transactionType;

      if (selectedCategory && selectedCategory.type) {
        // Nếu category có type là income nhưng transactionType là expense, cần cập nhật lại
        if (
          selectedCategory.type === "income" &&
          finalTransactionType === "expense"
        ) {
          finalTransactionType = "income";
          console.log(
            "🔄 Correcting transaction type to income based on category type"
          );
        }
        // Tương tự, nếu category có type là expense nhưng transactionType là income, cần cập nhật lại
        else if (
          selectedCategory.type === "expense" &&
          finalTransactionType === "income"
        ) {
          finalTransactionType = "expense";
          console.log(
            "🔄 Correcting transaction type to expense based on category type"
          );
        }
      }

      // 3. Prepare transaction data
      const transactionData = {
        description: title || selectedCategory.name, // Use title as description, with category name as fallback
        amount: amountValue,
        type: finalTransactionType,
        category: selectedCategory._id,
        walletId: selectedWallet._id,
        date: selectedDate.toISOString(),
        note: note,
        paymentMethod: "Cash", // Default payment method
      };

      // Debug log
      console.log(
        `📝 Creating ${finalTransactionType} transaction with amount ${amountValue}`
      );

      // 4. Call API to create transaction
      let responseData;
      let retryCount = 0;
      const maxRetries = 3;

      // Retry logic
      while (retryCount < maxRetries) {
        try {
          const response = await apiClient.post(
            "/api/transactions",
            transactionData
          );
          responseData = response.data;
          break; // Exit the retry loop if successful
        } catch (error: any) {
          console.error("Error creating transaction:", error.message);

          // Check if it's a connection error
          if (error.message.includes("Network Error") || !error.response) {
            setConnectionError(true);
            retryCount++;

            if (retryCount >= maxRetries) {
              toast.showToast(
                "Connection Error. Check your internet connection and try again later.",
                "error"
              );
              setLoading(false);
              return;
            }

            // Wait before retrying
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * retryCount)
            );
            continue;
          }

          // Handle other errors
          Alert.alert(
            "Error",
            error.response?.data?.message || "Failed to create transaction"
          );
          setLoading(false);
          return;
        }
      }

      // 5. Show success message and reset form
      toast.showToast("Transaction added successfully", "success");

      // Reset form
      setTitle("");
      setAmount("");
      setNote("");
      setSelectedCategory(null);
      setSelectedDate(new Date());

      // 6. Redirect back to previous screen
      navigation.goBack();
    } catch (error: any) {
      // Handle unexpected errors
      console.error("Error in handleSubmit:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory?._id === item._id;

    return (
      <TouchableOpacity
        style={[styles.categoryItem, isSelected && styles.selectedCategoryItem]}
        onPress={() => handleSelectCategory(item)}
      >
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: item.color || "#00D09E" },
          ]}
        >
          <Ionicons
            name={(item.icon as any) || "list"}
            size={20}
            color="#FFFFFF"
          />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color="#00D09E" />
        )}
      </TouchableOpacity>
    );
  };

  // Xử lý khi nhấn nút quay lại
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Xử lý khi nhấn nút thông báo
  const handleNotificationPress = () => {
    // Điều hướng trực tiếp đến màn hình NotificationScreen ở root navigator
    navigation.navigate("NotificationScreen" as any);
  };

  const toggleCategoryModal = () => {
    if (showCategoryModal) {
      // Hide modal animation
      Animated.parallel([
        Animated.timing(modalY, {
          toValue: 500,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowCategoryModal(false);
      });
    } else {
      setShowCategoryModal(true);
      // Show modal animation
      Animated.parallel([
        Animated.timing(modalY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Xử lý chọn ví
  const handleSelectWallet = (wallet: Wallet) => {
    setSelectedWallet(wallet);
  };

  // Điều hướng đến màn hình chọn ví
  const navigateToSelectWallet = () => {
    navigation.navigate("SelectWallet", {
      selectedWalletId: selectedWallet?._id,
      onSelectWallet: handleSelectWallet,
    });
  };

  // Điều hướng đến màn hình chọn danh mục
  const navigateToSelectCategory = () => {
    navigation.navigate("SelectCategory", {
      selectedCategoryId: selectedCategory?._id,
      type: transactionType,
      listenerId: categoryListenerIdRef.current,
    });
  };

  // Điều hướng đến màn hình nhập ghi chú
  const navigateToAddNote = () => {
    navigation.navigate("AddNote", {
      note: note,
      onSaveNote: (newNote: string) => {
        setNote(newNote);
      },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <View style={styles.headerRight} />
        </View>

        {/* SHOW CONNECTION ERROR OR MAIN CONTENT */}
        {connectionError ? (
          <View style={styles.connectionErrorContainer}>
            <View style={styles.errorCard}>
              <Ionicons name="cloud-offline" size={60} color="#FF6B6B" />
              <Text style={styles.connectionErrorTitle}>Connection Error</Text>
              <Text style={styles.connectionErrorMessage}>
                Cannot connect to the server. Please check your network
                connection and try again.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={retryConnection}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.retryButtonText}>Retry Connection</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.errorBackButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.contentWrapper}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.mainContainer}>
                <View style={styles.transactionCard}>
                  {/* Wallet Selector */}
                  <TouchableOpacity
                    style={styles.itemRow}
                    onPress={navigateToSelectWallet}
                  >
                    <View style={styles.itemLeft}>
                      <View
                        style={[
                          styles.walletIcon,
                          {
                            backgroundColor: selectedWallet?.color || "#FF9500",
                          },
                        ]}
                      >
                        {selectedWallet?.icon ? (
                          selectedWallet.icon.includes("outline") ||
                          selectedWallet.icon.includes("-") ? (
                            <Ionicons
                              name={selectedWallet.icon as any}
                              size={20}
                              color="#FFFFFF"
                            />
                          ) : (
                            <Image
                              source={{ uri: selectedWallet.icon }}
                              style={{
                                width: 20,
                                height: 20,
                                tintColor: "#FFFFFF",
                              }}
                              defaultSource={{
                                uri: "https://example.com/default-wallet-icon.png",
                              }}
                              onError={() =>
                                console.log("Error loading wallet icon")
                              }
                            />
                          )
                        ) : (
                          <Ionicons
                            name="wallet-outline"
                            size={20}
                            color="#FFFFFF"
                          />
                        )}
                      </View>
                      <Text style={styles.itemText}>
                        {selectedWallet?.name || "Select wallet"}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#CCCCCC"
                    />
                  </TouchableOpacity>
                  <View style={styles.divider} />

                  {/* Amount */}
                  <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <View style={styles.amountInputRow}>
                      <View style={styles.currencyContainer}>
                        <Text style={styles.currencyText}>VND</Text>
                      </View>
                      <TextInput
                        style={styles.amountInput}
                        placeholder="0"
                        value={amount}
                        onChangeText={handleAmountChange}
                        keyboardType="numeric"
                        placeholderTextColor="#000000"
                      />
                    </View>
                  </View>
                  <View style={styles.divider} />

                  {/* Category */}
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
                              name={(selectedCategory.icon as any) || "list"}
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
                          <View style={styles.emptyCategoryIcon} />
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

                  {/* Note */}
                  <TouchableOpacity
                    style={styles.itemRow}
                    onPress={navigateToAddNote}
                  >
                    <View style={styles.itemLeft}>
                      <View style={styles.noteIcon}>
                        <Ionicons
                          name="document-text-outline"
                          size={20}
                          color="#333333"
                        />
                      </View>
                      <Text
                        style={note ? styles.itemText : styles.placeholderText}
                      >
                        {note || "Add a note"}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#CCCCCC"
                    />
                  </TouchableOpacity>
                  <View style={styles.divider} />

                  {/* Date */}
                  <TouchableOpacity
                    style={styles.itemRow}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <View style={styles.itemLeft}>
                      <View style={styles.dateIcon}>
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#333333"
                        />
                      </View>
                      <Text style={styles.itemText}>
                        {formatDate(selectedDate)}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#CCCCCC"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            {/* Nút Save cố định dưới cùng contentWrapper */}
            <View style={styles.saveButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  amount && selectedCategory && selectedWallet
                    ? styles.saveButtonActive
                    : null,
                ]}
                onPress={handleSubmit}
                disabled={
                  loading || !(amount && selectedCategory && selectedWallet)
                }
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Date Picker */}
        {showDatePicker &&
          (Platform.OS === "ios" ? (
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

                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      style={styles.iosDatePicker}
                      themeVariant="light"
                      textColor="#000000"
                      accentColor={colors.primary}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              accentColor={colors.primary}
            />
          ))}

        {/* Category Modal */}
        {showCategoryModal && (
          <Modal
            visible={showCategoryModal}
            transparent={true}
            animationType="slide"
            onRequestClose={toggleCategoryModal}
          >
            <View style={styles.modalBackdrop}>
              <Animated.View
                style={[
                  styles.datePickerModal,
                  {
                    transform: [{ translateY: modalY }],
                    opacity: modalOpacity,
                    height: 500,
                  },
                ]}
              >
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity
                    onPress={toggleCategoryModal}
                    style={styles.datePickerButton}
                  >
                    <Text style={styles.datePickerButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerTitle}>Select Category</Text>
                  <TouchableOpacity
                    onPress={toggleCategoryModal}
                    style={styles.datePickerButton}
                  >
                    <Text style={styles.datePickerButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={categories.filter(
                    (cat) =>
                      cat.type === transactionType ||
                      cat.type === ("both" as CategoryType)
                  )}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              </Animated.View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeAreaTop: {
    flex: 0,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 40,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRight: {
    width: 40,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    padding: 16,
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF9500",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emptyCategoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEEEEE",
    marginRight: 12,
  },
  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dateIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemText: {
    fontSize: 17,
    color: "#000000",
  },
  placeholderText: {
    fontSize: 17,
    color: "#AAAAAA",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginLeft: 64,
  },
  amountContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  amountLabel: {
    fontSize: 15,
    color: "#888888",
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyContainer: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  currencyText: {
    fontSize: 17,
    color: "#000000",
  },
  amountInput: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000000",
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#DDDDDD",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  saveButtonActive: {
    backgroundColor: colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  datePickerModal: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  datePickerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  datePickerButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  datePickerContainer: {
    padding: 0,
    backgroundColor: "white",
    alignItems: "center",
    height: 250,
    width: "100%",
  },
  iosDatePicker: {
    width: "100%",
    height: 220,
    backgroundColor: "white",
  },
  connectionErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  connectionErrorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  connectionErrorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#00D09E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorBackButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  selectedCategoryItem: {
    backgroundColor: "rgba(0, 208, 158, 0.1)",
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    marginLeft: 10,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    overflow: "hidden",
  },
  saveButtonContainer: {
    backgroundColor: "#FFF",
    padding: 16,
  },
});

export default AddTransactionScreen;
