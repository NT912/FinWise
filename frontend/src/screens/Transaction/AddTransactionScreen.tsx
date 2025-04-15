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
import TabBar from "../../components/TabBar";
import AppHeader from "../../components/common/AppHeader";
import { useToast } from "../../components/ToastProvider";

type RouteParams = {
  AddTransaction: {
    preSelectedCategory?: string;
    type?: "expense" | "income";
  };
};

type CategoryType = "expense" | "income" | "both";

const AddTransactionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<RouteParams, "AddTransaction">>();
  const { preSelectedCategory, type } = route.params || {};
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  // Kiểm tra kết nối tới server khi màn hình được tải
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkServerConnection();
        setConnectionError(!isConnected);
        if (!isConnected) {
          Alert.alert(
            "Connection Error",
            "Cannot connect to the server. Please check your network connection and try again later."
          );
        }
      } catch (error) {
        console.error("Error checking server connection:", error);
        setConnectionError(true);
      }
    };

    checkConnection();
  }, []);

  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await getAllCategories();
        setCategories(data);
        setConnectionError(false);

        // If preselected category exists, find and set it
        if (preSelectedCategory) {
          const selectedCat = data.find(
            (cat: Category) => cat._id === preSelectedCategory
          );
          if (selectedCat) {
            setSelectedCategory(selectedCat);
          }
        } else if (data.length > 0) {
          // If no preselected category, use first category of matching type
          const matchingCategory = data.find(
            (cat: Category) =>
              cat.type === transactionType ||
              cat.type === ("both" as CategoryType)
          );
          if (matchingCategory) {
            setSelectedCategory(matchingCategory);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setConnectionError(true);
        Alert.alert(
          "Error",
          "Cannot load categories. Please check your network connection and try again."
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [preSelectedCategory, transactionType]);

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
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

  // Handle form submission with retry logic
  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a transaction title");
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    try {
      setLoading(true);

      // Check connection before creating transaction
      const isConnected = await checkServerConnection();
      if (!isConnected) {
        setConnectionError(true);
        Alert.alert(
          "Connection Error",
          "Cannot connect to the server. Please check your network connection and try again later."
        );
        setLoading(false);
        return;
      }

      // Prepare transaction data
      const transactionData = {
        title: title.trim(),
        amount: parseFloat(amount),
        date: selectedDate.toISOString(),
        category: selectedCategory._id,
        type: transactionType,
        note: note ? note.trim() : "",
      };

      console.log("🔄 Attempting to create transaction:", transactionData);

      // Create transaction with built-in retry mechanism
      const result = await createTransaction(transactionData);

      // Hiển thị toast thành công và quay lại màn hình trước đó
      toast.showToast(
        "Transaction has been added successfully",
        "success",
        2000
      );
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error: any) {
      console.error("Error creating transaction:", error);

      // Specific error handling for different types of errors
      if (error.response?.status === 500) {
        // Handle WriteConflict-specific error
        if (error.response.data?.retryable) {
          toast.showToast("Database busy. Please try again.", "warning");
        } else {
          // General server error
          toast.showToast(
            "An unexpected error occurred. Please try again later.",
            "error"
          );
        }
      } else if (!error.response && error.message.includes("Network Error")) {
        // Network connectivity issues
        setConnectionError(true);
        toast.showToast(
          "Cannot connect to the server. Check your internet connection.",
          "error"
        );
      } else {
        // Default error message
        toast.showToast("Cannot add transaction. Please try again.", "error");
      }
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00D09E" />

      {/* Header */}
      <AppHeader
        headerTitle="Add Transaction"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* SHOW CONNECTION ERROR OR MAIN CONTENT */}
      {connectionError ? (
        <View style={styles.connectionErrorContainer}>
          <View style={styles.errorCard}>
            <Ionicons name="cloud-offline" size={60} color="#FF6B6B" />
            <Text style={styles.connectionErrorTitle}>Connection Error</Text>
            <Text style={styles.connectionErrorMessage}>
              Cannot connect to the server. Please check your network connection
              and try again.
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          {/* Green background layer */}
          <View style={styles.backgroundLayer} />

          {/* White Container holding form and footer */}
          <Animated.View
            style={[
              styles.whiteContainer,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [0, 20],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Form Content */}
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                <Text style={styles.sectionTitle}>Transaction Type</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      transactionType === "income" && styles.selectedTypeButton,
                    ]}
                    onPress={() => setTransactionType("income")}
                  >
                    <Ionicons
                      name="arrow-down-circle"
                      size={22}
                      color={transactionType === "income" ? "#fff" : "#00D09E"}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        transactionType === "income" && styles.selectedTypeText,
                      ]}
                    >
                      Income
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      transactionType === "expense" &&
                        styles.selectedExpenseButton,
                    ]}
                    onPress={() => setTransactionType("expense")}
                  >
                    <Ionicons
                      name="arrow-up-circle"
                      size={22}
                      color={transactionType === "expense" ? "#fff" : "#FF6B6B"}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        transactionType === "expense" &&
                          styles.selectedTypeText,
                      ]}
                    >
                      Expense
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>

              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [
                    { translateY: Animated.multiply(slideAnim, 1.2) },
                  ],
                }}
              >
                <Text style={styles.sectionTitle}>Title</Text>
                <View style={styles.sectionCard}>
                  <TextInput
                    style={styles.titleInput}
                    placeholder="Enter transaction title"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor="#AAAAAA"
                  />
                </View>
              </Animated.View>

              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [
                    { translateY: Animated.multiply(slideAnim, 1.4) },
                  ],
                }}
              >
                <Text style={styles.sectionTitle}>Amount</Text>
                <View style={styles.amountWrapper}>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#CCCCCC"
                  />
                  <Text style={styles.currencyLabel}>VND</Text>
                </View>
              </Animated.View>

              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [
                    { translateY: Animated.multiply(slideAnim, 1.6) },
                  ],
                }}
              >
                <Text style={styles.sectionTitle}>Category</Text>
                <TouchableOpacity
                  style={styles.sectionCard}
                  onPress={() => setShowCategoryModal(true)}
                >
                  {selectedCategory ? (
                    <View style={styles.selectedCategory}>
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: selectedCategory.color },
                        ]}
                      >
                        <Ionicons
                          name={selectedCategory.icon as any}
                          size={20}
                          color="#fff"
                        />
                      </View>
                      <Text style={styles.selectedCategoryText}>
                        {selectedCategory.name}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Text style={styles.placeholderText}>
                        Select category
                      </Text>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [
                    { translateY: Animated.multiply(slideAnim, 1.8) },
                  ],
                }}
              >
                <Text style={styles.sectionTitle}>Transaction Date</Text>
                <TouchableOpacity
                  style={styles.sectionCard}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.dateContainer}>
                    <View
                      style={[
                        styles.calendarIconContainer,
                        {
                          backgroundColor:
                            transactionType === "income"
                              ? "#00D09E"
                              : "#FF6B6B",
                        },
                      ]}
                    >
                      <Ionicons name="calendar" size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.dateTextContainer}>
                      <Text style={styles.dateLabel}>Date</Text>
                      <Text style={styles.dateText}>
                        {formatDate(selectedDate)}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color="#999"
                      style={styles.dateChevron}
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: Animated.multiply(slideAnim, 2) }],
                  marginBottom: 30,
                }}
              >
                <Text style={styles.sectionTitle}>Note</Text>
                <View style={styles.sectionCard}>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Add a note (optional)"
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor="#AAAAAA"
                  />
                </View>
              </Animated.View>
            </ScrollView>

            {/* Footer with save button - now inside white container */}
            <Animated.View
              style={[
                styles.footer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    backgroundColor:
                      transactionType === "income" ? "#00D09E" : "#FF6B6B",
                  },
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="save-outline"
                      size={20}
                      color="#FFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.saveButtonText}>Save Transaction</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableOpacity
            style={styles.datePickerBackdrop}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <View style={styles.datePickerWrapper}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="inline"
                  onChange={onDateChange}
                  style={styles.datePicker}
                  maximumDate={new Date()}
                  textColor="#333333"
                  accentColor={
                    transactionType === "income" ? "#00D09E" : "#FF6B6B"
                  }
                  themeVariant="light"
                />
              </View>
              <View style={styles.datePickerFooter}>
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    {
                      backgroundColor:
                        transactionType === "income" ? "#00D09E" : "#FF6B6B",
                    },
                  ]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.datePickerButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
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
              contentContainerStyle={styles.categoryList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  keyboardAvoidingView: {
    flex: 1,
    marginTop: 10,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    paddingBottom: 0,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  formContainer: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTypeButton: {
    backgroundColor: "#00D09E",
  },
  activeIncomeButton: {
    backgroundColor: "#4CAF50",
  },
  typeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginLeft: 8,
  },
  activeTypeText: {
    color: "#FFFFFF",
  },
  amountWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888",
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 8,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: "600",
    color: "#333333",
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: "#333333",
  },
  categorySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedCategory: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    color: "#333333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#AAAAAA",
  },
  titleInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333333",
  },
  notesInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333333",
    height: 100,
    textAlignVertical: "top",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
    marginTop: 0,
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#00D09E",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#00D09E",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    paddingBottom: 0,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    paddingBottom: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  closeButton: {
    padding: 4,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
  },
  selectedTypeButton: {
    backgroundColor: "#00D09E",
  },
  selectedExpenseButton: {
    backgroundColor: "#FF6B6B",
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginLeft: 8,
  },
  selectedTypeText: {
    color: "#FFFFFF",
  },
  currencyLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
    marginLeft: 8,
  },
  selectedCategoryText: {
    fontSize: 16,
    color: "#333333",
    marginLeft: 10,
  },
  placeholderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00D09E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  dateChevron: {
    marginLeft: 8,
  },
  backgroundLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#00D09E",
    zIndex: -1,
  },

  // Date picker styles
  datePickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    paddingBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  datePickerWrapper: {
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
  },
  datePicker: {
    width: "100%",
    height: 350,
    backgroundColor: "white",
  },
  datePickerFooter: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  datePickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 16,
    backgroundColor: "#00D09E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  datePickerButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default AddTransactionScreen;
