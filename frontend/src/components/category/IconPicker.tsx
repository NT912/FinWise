import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface IconPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string) => void;
  selectedIcon: string;
  selectedColor: string;
}

// Common icons from Ionicons that work well for categories
const ICONS = [
  "restaurant",
  "cart",
  "car",
  "home",
  "film",
  "medkit",
  "book",
  "person",
  "gift",
  "cash",
  "briefcase",
  "trending-up",
  "card",
  "fitness",
  "airplane",
  "bus",
  "train",
  "cafe",
  "fast-food",
  "wine",
  "beer",
  "bed",
  "tv",
  "laptop",
  "headset",
  "game-controller",
  "heart",
  "bandage",
  "school",
  "basket",
  "pricetag",
  "shirt",
  "cut",
  "umbrella",
  "football",
  "basketball",
  "bicycle",
  "phone-portrait",
  "tablet-portrait",
  "camera",
  "musical-notes",
  "paw",
  "planet",
  "pizza",
  "cellular",
  "wifi",
  "water",
  "flash",
];

const IconPicker: React.FC<IconPickerProps> = ({
  visible,
  onClose,
  onSelectIcon,
  selectedIcon,
  selectedColor,
}) => {
  const [searchText, setSearchText] = useState("");

  const filteredIcons = searchText
    ? ICONS.filter((icon) =>
        icon.toLowerCase().includes(searchText.toLowerCase())
      )
    : ICONS;

  const renderIconItem = ({ item: icon }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.iconItem,
        selectedIcon === icon && styles.selectedIconItem,
      ]}
      onPress={() => onSelectIcon(icon)}
    >
      <View style={[styles.iconCircle, { backgroundColor: selectedColor }]}>
        <Ionicons name={icon as any} size={24} color="#FFF" />
      </View>
      <Text style={styles.iconName}>{icon}</Text>
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
            <Text style={styles.modalTitle}>Select Icon</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search icons..."
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing"
            />
          </View>

          <FlatList
            data={filteredIcons}
            renderItem={renderIconItem}
            keyExtractor={(item) => item}
            numColumns={4}
            contentContainerStyle={styles.iconGrid}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No icons match your search</Text>
            }
          />

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  iconGrid: {
    paddingVertical: 10,
  },
  iconItem: {
    width: "25%",
    paddingVertical: 10,
    alignItems: "center",
  },
  selectedIconItem: {
    backgroundColor: "rgba(0, 200, 151, 0.1)",
    borderRadius: 8,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  iconName: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    marginBottom: 20,
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

export default IconPicker;
