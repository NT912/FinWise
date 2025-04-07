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

type IconName = keyof typeof Ionicons.glyphMap;

const VALID_ICONS: IconName[] = [
  "cart",
  "home",
  "car",
  "airplane",
  "restaurant",
  "cafe",
  "beer",
  "wine",
  "gift",
  "shirt",
  "book",
  "school",
  "fitness",
  "medical",
  "heart",
  "paw",
  "leaf",
  "sunny",
  "rainy",
  "snow",
  "thunderstorm",
  "cloudy",
  "partly-sunny",
  "umbrella",
  "flash",
  "flame",
  "water",
  "nutrition",
  "pizza",
  "ice-cream",
  "camera",
  "musical-notes",
  "game-controller",
  "tv",
  "laptop",
  "phone-portrait",
  "tablet-portrait",
  "watch",
  "headset",
  "ear",
  "eye",
  "body",
  "football",
  "basketball",
  "baseball",
  "tennisball",
  "footsteps",
  "bicycle",
  "boat",
  "bus",
  "train",
  "subway",
  "walk",
  "barbell",
  "basket",
  "briefcase",
  "card",
  "cash",
  "wallet",
  "pricetag",
  "pricetags",
  "receipt",
  "stats-chart",
  "trending-up",
  "trending-down",
  "analytics",
  "calculator",
  "calendar",
  "time",
  "alarm",
  "stopwatch",
  "timer",
  "hourglass",
  "calendar-clear",
  "calendar-number",
  "calendar-outline",
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
