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
  "#00C897", // Teal
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
  const renderColorItem = ({ item: color }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.colorItem,
        { backgroundColor: color },
        selectedColor === color && styles.selectedColorItem,
      ]}
      onPress={() => onSelectColor(color)}
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
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Color</Text>
            <TouchableOpacity onPress={onClose}>
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

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
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
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  colorGrid: {
    alignItems: "center",
    paddingVertical: 10,
  },
  colorItem: {
    width: colorItemSize,
    height: colorItemSize,
    borderRadius: colorItemSize / 2,
    margin: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColorItem: {
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  doneButton: {
    backgroundColor: "#00C897",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  doneButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ColorPicker;
