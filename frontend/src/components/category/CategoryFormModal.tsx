import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import categoryStyles from "../../styles/category/categoryStyles";
import ColorPicker from "./ColorPicker";
import IconPicker from "./IconPicker";

interface CategoryFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: "add" | "edit";
  categoryName: string;
  onCategoryNameChange: (text: string) => void;
  categoryIcon: string;
  categoryColor: string;
  onShowIconPicker: () => void;
  onShowColorPicker: () => void;
  iconPickerVisible: boolean;
  colorPickerVisible: boolean;
  onIconSelect: (icon: string) => void;
  onColorSelect: (color: string) => void;
}

const CategoryFormModal = ({
  visible,
  onClose,
  onSave,
  mode,
  categoryName,
  onCategoryNameChange,
  categoryIcon,
  categoryColor,
  onShowIconPicker,
  onShowColorPicker,
  iconPickerVisible,
  colorPickerVisible,
  onIconSelect,
  onColorSelect,
}: CategoryFormModalProps) => {
  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={categoryStyles.modalOverlay}>
          <View style={categoryStyles.modalContent}>
            <View style={categoryStyles.modalHeader}>
              <Text style={categoryStyles.modalTitle}>
                {mode === "add" ? "Add New Category" : "Edit Category"}
              </Text>
              <TouchableOpacity
                style={categoryStyles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={categoryStyles.inputLabel}>Category Name</Text>
              <TextInput
                style={categoryStyles.input}
                placeholder="Enter category name"
                value={categoryName}
                onChangeText={onCategoryNameChange}
                placeholderTextColor="#999"
              />

              <Text style={categoryStyles.inputLabel}>Icon</Text>
              <TouchableOpacity
                style={categoryStyles.pickerButton}
                onPress={onShowIconPicker}
              >
                <View
                  style={[
                    categoryStyles.selectedIcon,
                    { backgroundColor: categoryColor },
                  ]}
                >
                  <Ionicons name={categoryIcon as any} size={24} color="#FFF" />
                </View>
                <Text style={categoryStyles.pickerText}>Select Icon</Text>
                <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
              </TouchableOpacity>

              <Text style={categoryStyles.inputLabel}>Color</Text>
              <TouchableOpacity
                style={categoryStyles.pickerButton}
                onPress={onShowColorPicker}
              >
                <View
                  style={[
                    categoryStyles.colorSample,
                    { backgroundColor: categoryColor },
                  ]}
                />
                <Text style={categoryStyles.pickerText}>{categoryColor}</Text>
                <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                style={categoryStyles.saveButton}
                onPress={onSave}
              >
                <Text style={categoryStyles.saveButtonText}>
                  {mode === "add" ? "Add Category" : "Save Changes"}
                </Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                style={categoryStyles.cancelButton}
                onPress={onClose}
              >
                <Text style={categoryStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Icon Picker Modal */}
      <IconPicker
        visible={iconPickerVisible}
        onClose={onShowIconPicker}
        onSelectIcon={onIconSelect}
        selectedIcon={categoryIcon}
        selectedColor={categoryColor}
      />

      {/* Color Picker Modal */}
      <ColorPicker
        visible={colorPickerVisible}
        onClose={onShowColorPicker}
        onSelectColor={onColorSelect}
        selectedColor={categoryColor}
      />
    </>
  );
};

export default CategoryFormModal;
