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
            "Lỗi kết nối",
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng và thử lại sau."
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
          "Lỗi",
          "Không thể tải danh mục. Vui lòng kiểm tra kết nối mạng và thử lại."
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
        Alert.alert("Thành công", "Đã kết nối lại với máy chủ.");
      } else {
        Alert.alert(
          "Lỗi kết nối",
          "Vẫn không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng và thử lại sau."
        );
      }
    } catch (error) {
      console.error("Error retrying connection:", error);
      Alert.alert(
        "Lỗi",
        "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề giao dịch");
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Lỗi", "Vui lòng chọn danh mục");
      return;
    }

    try {
      setLoading(true);

      // Kiểm tra kết nối trước khi thực hiện giao dịch
      const isConnected = await checkServerConnection();
      if (!isConnected) {
        setConnectionError(true);
        Alert.alert(
          "Lỗi kết nối",
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng và thử lại sau."
        );
        return;
      }

      // Prepare transaction data
      const transactionData = {
        title,
        amount: parseFloat(amount),
        date: selectedDate.toISOString(),
        category: selectedCategory._id,
        type: transactionType,
        note: note.trim(),
      };

      // Create transaction
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login" as never);
        return;
      }

      await createTransaction(transactionData);

      // Navigate back after successful creation
      Alert.alert("Thành công", "Giao dịch đã được thêm thành công");
      navigation.goBack();
    } catch (error) {
      console.error("Error creating transaction:", error);

      // Kiểm tra xem lỗi có phải do mất kết nối không
      const isConnected = await checkServerConnection();
      if (!isConnected) {
        setConnectionError(true);
        Alert.alert(
          "Lỗi kết nối",
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng và thử lại sau."
        );
      } else {
        Alert.alert("Lỗi", "Không thể thêm giao dịch. Vui lòng thử lại.");
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

  // Hiển thị lỗi kết nối nếu không thể kết nối đến server
  if (connectionError && !loading) {
    return (
      <SafeAreaView style={styles.connectionErrorContainer}>
        <Animated.View
          style={[
            styles.errorCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Ionicons name="wifi-outline" size={80} color="#FF6B6B" />
          <Text style={styles.connectionErrorTitle}>Lỗi kết nối</Text>
          <Text style={styles.connectionErrorMessage}>
            Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của
            bạn và thử lại.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={retryConnection}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.errorBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00D09E" />

      <AppHeader
        headerTitle="Thêm Giao Dịch"
        showBackButton={true}
        showAvatar={false}
        backgroundColor="#00D09E"
        textColor="#FFFFFF"
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.backgroundLayer} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
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
              <Text style={styles.sectionTitle}>Loại Giao Dịch</Text>
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
                    Thu Nhập
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
                      transactionType === "expense" && styles.selectedTypeText,
                    ]}
                  >
                    Chi Tiêu
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: Animated.multiply(slideAnim, 1.2) }],
              }}
            >
              <Text style={styles.sectionTitle}>Số Tiền</Text>
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
                transform: [{ translateY: Animated.multiply(slideAnim, 1.4) }],
              }}
            >
              <Text style={styles.sectionTitle}>Danh Mục</Text>
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
                    <Text style={styles.placeholderText}>Chọn danh mục</Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: Animated.multiply(slideAnim, 1.6) }],
              }}
            >
              <Text style={styles.sectionTitle}>Ngày Giao Dịch</Text>
              <TouchableOpacity
                style={styles.sectionCard}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <Text style={styles.dateText}>
                    {formatDate(selectedDate)}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: Animated.multiply(slideAnim, 1.8) }],
              }}
            >
              <Text style={styles.sectionTitle}>Tiêu Đề</Text>
              <View style={styles.sectionCard}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Nhập tiêu đề giao dịch"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#AAAAAA"
                />
              </View>
            </Animated.View>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: Animated.multiply(slideAnim, 2) }],
                marginBottom: 30,
              }}
            >
              <Text style={styles.sectionTitle}>Ghi Chú</Text>
              <View style={styles.sectionCard}>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Thêm ghi chú (không bắt buộc)"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#AAAAAA"
                />
              </View>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      <Animated.View
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, 0.5) }],
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
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name="save-outline"
                size={20}
                color="#FFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.saveButtonText}>Lưu Giao Dịch</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
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
              <Text style={styles.modalTitle}>Chọn Danh Mục</Text>
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
  content: {
    flex: 1,
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
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
  },
  saveButton: {
    backgroundColor: "#00D09E",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
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
    gap: 10,
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
  },
});

export default AddTransactionScreen;
