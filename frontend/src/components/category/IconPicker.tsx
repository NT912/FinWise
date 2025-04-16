import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IconName } from "../../types";

const VALID_ICONS: IconName[] = [
  "home-outline",
  "stats-chart-outline",
  "card-outline",
  "person-outline",
  "settings-outline",
  "wallet-outline",
  "cash-outline",
  "add-outline",
  "remove-outline",
  "restaurant-outline",
  "bus-outline",
  "medical-outline",
  "basket-outline",
  "gift-outline",
  "ticket-outline",
  "trophy-outline",
  "trending-up-outline",
  "analytics-outline",
  "cart-outline",
  "airplane-outline",
  "bag-outline",
  "barbell-outline",
  "bed-outline",
  "bonfire-outline",
  "book-outline",
  "briefcase-outline",
  "build-outline",
  "cafe-outline",
  "car-outline",
  "cut-outline",
  "film-outline",
  "fitness-outline",
  "flash-outline",
  "flower-outline",
  "game-controller-outline",
  "happy-outline",
  "heart-outline",
  "laptop-outline",
  "list-outline",
  "people-outline",
  "pizza-outline",
  "pricetag-outline",
  "school-outline",
];

interface IconPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectIcon: (icon: IconName) => void;
  selectedIcon: IconName;
  selectedColor: string;
}

const IconPicker: React.FC<IconPickerProps> = ({
  visible,
  onClose,
  onSelectIcon,
  selectedIcon,
  selectedColor,
}) => {
  const handleIconSelect = (icon: IconName) => {
    console.log("Icon selected:", icon);
    onSelectIcon(icon);
  };

  const handleClose = () => {
    console.log("Closing icon picker");
    onClose();
  };

  const renderIconItem = ({ item: icon }: { item: IconName }) => (
    <TouchableOpacity
      style={[
        styles.iconItem,
        { backgroundColor: selectedColor },
        selectedIcon === icon && styles.selectedIconItem,
      ]}
      onPress={() => handleIconSelect(icon)}
    >
      <Ionicons name={icon} size={24} color="#FFFFFF" />
      {selectedIcon === icon && (
        <View style={styles.checkmarkContainer}>
          <Ionicons name="checkmark" size={24} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Icon</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={VALID_ICONS}
            renderItem={renderIconItem}
            keyExtractor={(item) => item}
            numColumns={4}
            contentContainerStyle={styles.iconGrid}
          />

          <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get("window");
const iconItemSize = (width - 80) / 4;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    marginHorizontal: "5%",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  iconGrid: {
    padding: 8,
  },
  iconItem: {
    width: iconItemSize,
    height: iconItemSize,
    borderRadius: iconItemSize / 2,
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
  },
  selectedIconItem: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  checkmarkContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 4,
  },
  doneButton: {
    backgroundColor: "#00D09E",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default IconPicker;
