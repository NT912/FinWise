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
  Animated,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  updateTransaction,
  getTransactionById,
  deleteTransaction,
} from "../../services/transactionService";
import { getAllCategories } from "../../services/categoryService";
import { Category } from "../../types/category";
import { formatVND } from "../../utils/formatters";
import { formatDate } from "../../utils/dateUtils";
import { Transaction } from "../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { checkServerConnection } from "../../services/apiService";
import { useToast } from "../../components/ToastProvider";

type RouteParams = {
  EditTransaction: {
    transactionId: string;
  };
};

type CategoryType = "expense" | "income" | "both";

const EditTransactionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<RouteParams, "EditTransaction">>();
  const { transactionId } = route.params || {};
  const toast = useToast();

  // Transaction data
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [note, setNote] = useState("");
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    "expense"
  );
  const [originalTransaction, setOriginalTransaction] =
    useState<Transaction | null>(null);

  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  // Add new state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add new animation values for delete modal
  const deleteModalScale = useRef(new Animated.Value(0.85)).current;
  const deleteModalOpacity = useRef(new Animated.Value(0)).current;
  const deleteModalBackdropOpacity = useRef(new Animated.Value(0)).current;

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

  // Kiểm tra kết nối và lấy dữ liệu giao dịch
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        // Kiểm tra kết nối
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

        // Lấy dữ liệu giao dịch
        const transaction = await getTransactionById(transactionId);
        setOriginalTransaction(transaction);

        // Cập nhật các trường dữ liệu
        setTitle(transaction.title || "");
        setAmount(transaction.amount.toString());
        setSelectedDate(new Date(transaction.date));
        setNote(transaction.note || "");
        setTransactionType(transaction.type as "expense" | "income");

        // Lấy danh sách danh mục
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);

        // Tìm và đặt danh mục được chọn
        if (transaction.category) {
          const categoryId =
            typeof transaction.category === "object"
              ? transaction.category._id
              : transaction.category;

          const foundCategory = categoriesData.find(
            (cat: Category) => cat._id === categoryId
          );

          if (foundCategory) {
            setSelectedCategory(foundCategory);
          }
        }

        setConnectionError(false);
      } catch (error) {
        console.error("Error initializing edit transaction:", error);
        setConnectionError(true);
        Alert.alert(
          "Error",
          "Cannot load transaction data. Please check your network connection and try again."
        );
      } finally {
        setLoading(false);
        setLoadingCategories(false);
      }
    };

    if (transactionId) {
      initializeData();
    } else {
      Alert.alert("Error", "No transaction ID provided");
      navigation.goBack();
    }
  }, [transactionId, navigation]);

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
        // Nếu kết nối thành công, tải lại dữ liệu
        const transaction = await getTransactionById(transactionId);
        setOriginalTransaction(transaction);

        setTitle(transaction.title || "");
        setAmount(transaction.amount.toString());
        setSelectedDate(new Date(transaction.date));
        setNote(transaction.note || "");
        setTransactionType(transaction.type as "expense" | "income");

        const categoriesData = await getAllCategories();
        setCategories(categoriesData);

        if (transaction.category) {
          const categoryId =
            typeof transaction.category === "object"
              ? transaction.category._id
              : transaction.category;

          const foundCategory = categoriesData.find(
            (cat: Category) => cat._id === categoryId
          );

          if (foundCategory) {
            setSelectedCategory(foundCategory);
          }
        }

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

  // Handle opening delete modal with animation
  const openDeleteConfirmation = () => {
    setShowDeleteModal(true);
    Animated.parallel([
      Animated.timing(deleteModalBackdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(deleteModalScale, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(deleteModalOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle closing delete modal with animation
  const closeDeleteConfirmation = () => {
    Animated.parallel([
      Animated.timing(deleteModalBackdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(deleteModalScale, {
        toValue: 0.85,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(deleteModalOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDeleteModal(false);
    });
  };

  // Handle transaction deletion
  const handleDeleteTransaction = async () => {
    openDeleteConfirmation();
  };

  // Function to execute delete
  const executeDelete = async () => {
    try {
      setDeleteLoading(true);

      // Thêm rung nhẹ cho hiệu ứng xóa
      Animated.sequence([
        Animated.timing(deleteModalScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(deleteModalScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Kiểm tra kết nối trước khi xóa
      const isConnected = await checkServerConnection();
      if (!isConnected) {
        setDeleteLoading(false);
        closeDeleteConfirmation();
        Alert.alert(
          "Lỗi kết nối",
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại."
        );
        return;
      }

      const result = await deleteTransaction(transactionId);
      setDeleteLoading(false);
      closeDeleteConfirmation();

      // Hiển thị thông báo thành công sau khi đóng modal
      setTimeout(() => {
        toast.showToast("Transaction deleted successfully", "success");
        navigation.goBack();
      }, 300);
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      setDeleteLoading(false);

      // Kiểm tra lỗi đặc biệt: xung đột ghi
      if (error.message && error.message.includes("Write conflict")) {
        // Đóng modal xác nhận
        closeDeleteConfirmation();

        // Hiển thị thông báo lỗi thân thiện với lựa chọn thử lại
        setTimeout(() => {
          toast.showToast("Database busy. Please try again.", "warning");
        }, 300);
        return;
      }

      // Xử lý các lỗi khác
      closeDeleteConfirmation();

      // Hiển thị thông báo lỗi sau khi đóng modal
      setTimeout(() => {
        toast.showToast(
          error.message || "Cannot delete transaction. Please try again.",
          "error"
        );
      }, 300);
    }
  };

  // Handle form submission for update
  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      toast.showToast("Please enter a transaction title", "warning");
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.showToast("Please enter a valid amount", "warning");
      return;
    }

    if (!selectedCategory) {
      toast.showToast("Please select a category", "warning");
      return;
    }

    try {
      setSubmitting(true);

      // Kiểm tra kết nối trước khi thực hiện giao dịch
      const isConnected = await checkServerConnection();
      if (!isConnected) {
        setConnectionError(true);
        Alert.alert(
          "Connection Error",
          "Cannot connect to the server. Please check your network connection and try again later."
        );
        setSubmitting(false);
        return;
      }

      // Prepare transaction data
      const transactionData = {
        title,
        amount: parseFloat(amount),
        date: selectedDate.toISOString(),
        category: selectedCategory?._id || "",
        type: transactionType,
        note: note ? note.trim() : "",
      };

      console.log(
        "Données de transaction à envoyer:",
        JSON.stringify(transactionData, null, 2)
      );

      // Update transaction
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login" as never);
        return;
      }

      await updateTransaction(transactionId, transactionData as any);

      // Hiển thị thông báo thành công và quay lại
      toast.showToast("Transaction updated successfully", "success");
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.showToast(
        "Failed to update the transaction. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Render category item for selection
  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory?._id === item._id;
    const iconName = item.icon || "pricetag-outline";

    return (
      <TouchableOpacity
        style={[styles.categoryItem, isSelected && styles.selectedCategoryItem]}
        onPress={() => handleSelectCategory(item)}
      >
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: item.color || "#6C63FF" },
          ]}
        >
          <Ionicons name={iconName as any} size={20} color="#FFFFFF" />
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D09E" />
          <Text style={styles.loadingText}>Loading transaction data...</Text>
        </View>
      ) : connectionError ? (
        <View style={styles.connectionErrorContainer}>
          <Ionicons name="cloud-offline" size={60} color="#FF6B6B" />
          <Text style={styles.connectionErrorTitle}>Connection Error</Text>
          <Text style={styles.connectionErrorMessage}>
            Cannot connect to the server. Please check your network connection
            and try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={retryConnection}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.errorBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Transaction</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteTransaction}
            >
              <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* White content container */}
          <View style={styles.whiteContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingView}
            >
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formContainer}>
                  {/* Type selector */}
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
                          transactionType === "income" &&
                            styles.selectedIncomeButton,
                        ]}
                        onPress={() => setTransactionType("income")}
                      >
                        <Ionicons
                          name="arrow-down-circle"
                          size={22}
                          color={
                            transactionType === "income" ? "#fff" : "#4CAF50"
                          }
                        />
                        <Text
                          style={[
                            styles.typeButtonText,
                            transactionType === "income" &&
                              styles.selectedTypeText,
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
                          color={
                            transactionType === "expense" ? "#fff" : "#FF6B6B"
                          }
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

                  {/* Transaction Title */}
                  <Animated.View
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        { translateY: Animated.multiply(slideAnim, 1.2) },
                      ],
                    }}
                  >
                    <Text style={styles.sectionTitle}>Title</Text>
                    <TextInput
                      style={styles.sectionCard}
                      placeholder="Enter transaction title"
                      value={title}
                      onChangeText={setTitle}
                      placeholderTextColor="#AAAAAA"
                    />
                  </Animated.View>

                  {/* Amount */}
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

                  {/* Category Selection */}
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
                              {
                                backgroundColor:
                                  selectedCategory.color || "#6C63FF",
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                (selectedCategory.icon as any) ||
                                "pricetag-outline"
                              }
                              size={20}
                              color="#FFFFFF"
                            />
                          </View>
                          <Text style={styles.categoryText}>
                            {selectedCategory.name}
                          </Text>
                        </View>
                      ) : loadingCategories ? (
                        <ActivityIndicator size="small" color="#00D09E" />
                      ) : (
                        <Text style={styles.placeholderText}>
                          Select a category
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Date Selection */}
                  <Animated.View
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        { translateY: Animated.multiply(slideAnim, 1.8) },
                      ],
                    }}
                  >
                    <Text style={styles.sectionTitle}>Date</Text>
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
                          <Text style={styles.dateLabel}>Selected Date</Text>
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

                  {/* Notes */}
                  <Animated.View
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        { translateY: Animated.multiply(slideAnim, 2) },
                      ],
                    }}
                  >
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <TextInput
                      style={[
                        styles.sectionCard,
                        { height: 100, textAlignVertical: "top" },
                      ]}
                      placeholder="Add notes (optional)"
                      value={note}
                      onChangeText={setNote}
                      multiline
                      placeholderTextColor="#AAAAAA"
                    />
                  </Animated.View>

                  {/* Save Button */}
                  <Animated.View
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        { translateY: Animated.multiply(slideAnim, 2.2) },
                      ],
                      marginTop: 20,
                      marginBottom: 40,
                    }}
                  >
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.saveButtonText}>
                          Update Transaction
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>

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
                            transactionType === "income"
                              ? "#00D09E"
                              : "#FF6B6B",
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
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCategoryModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Category</Text>
                  <TouchableOpacity
                    onPress={() => setShowCategoryModal(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#333333" />
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
                  style={styles.categoryList}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            visible={showDeleteModal}
            transparent={true}
            animationType="none"
            onRequestClose={closeDeleteConfirmation}
            statusBarTranslucent={true}
          >
            <View style={styles.deleteModalOverlay}>
              <Animated.View
                style={[
                  styles.deleteModalBackdrop,
                  { opacity: deleteModalBackdropOpacity },
                ]}
              >
                <TouchableOpacity
                  style={{ width: "100%", height: "100%" }}
                  activeOpacity={1}
                  onPress={closeDeleteConfirmation}
                />
              </Animated.View>
              <Animated.View
                style={[
                  styles.deleteModalContainer,
                  {
                    opacity: deleteModalOpacity,
                    transform: [{ scale: deleteModalScale }],
                  },
                ]}
              >
                <View style={styles.deleteModalContent}>
                  <View style={styles.deleteIconContainer}>
                    <Ionicons name="trash-outline" size={36} color="#FFFFFF" />
                  </View>

                  <Text style={styles.deleteModalTitle}>
                    Xóa giao dịch này?
                  </Text>

                  <Text style={styles.deleteModalMessage}>
                    Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?
                  </Text>

                  <View style={styles.deleteModalDivider} />

                  <View style={styles.deleteModalActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={closeDeleteConfirmation}
                      disabled={deleteLoading}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.confirmDeleteButton}
                      onPress={executeDelete}
                      disabled={deleteLoading}
                      activeOpacity={0.8}
                    >
                      {deleteLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        </View>
                      ) : (
                        <View style={styles.deleteButtonContent}>
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#FFFFFF"
                            style={styles.deleteButtonIcon}
                          />
                          <Text style={styles.confirmDeleteButtonText}>
                            Xóa
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: 10,
    overflow: "hidden",
  },
  keyboardAvoidingView: {
    flex: 1,
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
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
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
  selectedIncomeButton: {
    backgroundColor: "#4CAF50",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: "600",
    color: "#333333",
  },
  currencyLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
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
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
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
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  connectionErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
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
  // Delete modal styles
  deleteModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  deleteModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  deleteModalContainer: {
    width: "85%",
    maxWidth: 320,
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  deleteModalContent: {
    padding: 24,
    alignItems: "center",
  },
  deleteIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  deleteModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  deleteModalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  deleteModalDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EEEEEE",
    marginBottom: 20,
  },
  deleteModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#FF6B6B",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  deleteButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonIcon: {
    marginRight: 8,
  },
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

export default EditTransactionScreen;
