import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ColorPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  selectedColor: string;
}

const COLORS = [
  "#FF6B6B", // Red
  "#FF9F69", // Orange
  "#FFC84E", // Yellow
  "#4CAF50", // Green
  "#00D09E", // Teal
  "#4DC0F5", // Light Blue
  "#2196F3", // Blue
  "#8D76E8", // Purple
  "#F06292", // Pink
  "#9575CD", // Violet
  "#78909C", // Blue Grey
  "#607D8B", // Grey
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  visible,
  onClose,
  onSelectColor,
  selectedColor,
}) => {
  const handleColorSelect = (color: string) => {
    console.log("Color selected:", color);
    onSelectColor(color);
  };

  const handleClose = () => {
    console.log("Closing color picker");
    onClose();
  };

  const renderColorItem = ({ item: color }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.colorItem,
        { backgroundColor: color },
        selectedColor === color && styles.selectedColorItem,
      ]}
      onPress={() => handleColorSelect(color)}
    >
      {selectedColor === color && (
        <Ionicons name="checkmark" size={24} color="#FFFFFF" />
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
            <Text style={styles.modalTitle}>Select Color</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={COLORS}
            renderItem={renderColorItem}
            keyExtractor={(item) => item}
            numColumns={4}
            contentContainerStyle={styles.colorGrid}
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
const colorItemSize = (width - 80) / 4;

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
  colorGrid: {
    padding: 8,
  },
  colorItem: {
    width: colorItemSize,
    height: colorItemSize,
    borderRadius: colorItemSize / 2,
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
  },
  selectedColorItem: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
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

export default ColorPicker;
