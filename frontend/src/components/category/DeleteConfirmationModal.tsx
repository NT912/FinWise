import React from "react";
import { View, Text, Modal, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import categoryStyles from "../../styles/category/categoryStyles";

interface DeleteConfirmationModalProps {
  visible: boolean;
  categoryName: string;
  onCancel: () => void;
  onConfirm: () => void;
  animationValues: {
    fadeAnim: Animated.Value;
    scaleAnim: Animated.Value;
  };
}

const DeleteConfirmationModal = ({
  visible,
  categoryName,
  onCancel,
  onConfirm,
  animationValues,
}: DeleteConfirmationModalProps) => {
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={categoryStyles.modalOverlay}>
        <Animated.View
          style={[
            categoryStyles.deleteModalContainer,
            {
              opacity: animationValues.fadeAnim,
              transform: [{ scale: animationValues.scaleAnim }],
            },
          ]}
        >
          <View style={categoryStyles.deleteIconContainer}>
            <Ionicons name="trash" size={30} color="#FF6B6B" />
          </View>
          <Text style={categoryStyles.deleteTitle}>Delete Category</Text>
          <Text style={categoryStyles.deleteMessage}>
            Are you sure you want to delete "{categoryName}"? This action cannot
            be undone.
          </Text>
          <View style={categoryStyles.deleteButtonContainer}>
            <TouchableOpacity
              style={[
                categoryStyles.deleteButton,
                categoryStyles.deleteCancelButton,
              ]}
              onPress={onCancel}
            >
              <Text style={categoryStyles.deleteCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                categoryStyles.deleteButton,
                categoryStyles.deleteConfirmButton,
              ]}
              onPress={onConfirm}
            >
              <Text style={categoryStyles.deleteConfirmButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default DeleteConfirmationModal;
