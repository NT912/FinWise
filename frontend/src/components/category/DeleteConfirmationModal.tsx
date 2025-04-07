import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import categoryStyles from "../../styles/category/categoryStyles";

interface DeleteConfirmationModalProps {
  visible: boolean;
  categoryName?: string;
  animationValues?: {
    scale: Animated.Value;
    opacity: Animated.Value;
  };
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  categoryName = "this category",
  animationValues,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={categoryStyles.modalOverlay}>
        <Animated.View
          style={[
            categoryStyles.modalContent,
            animationValues && {
              transform: [{ scale: animationValues.scale }],
              opacity: animationValues.opacity,
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={48} color="#FF6B6B" />
          </View>

          <Text style={categoryStyles.modalTitle}>Delete Category</Text>
          <Text style={styles.message}>
            Are you sure you want to delete {categoryName}? This action cannot
            be undone.
          </Text>

          <View style={categoryStyles.buttonContainer}>
            <TouchableOpacity
              style={[categoryStyles.button, categoryStyles.secondaryButton]}
              onPress={onCancel}
            >
              <Text style={categoryStyles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[categoryStyles.button, styles.deleteButton]}
              onPress={onConfirm}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 24,
  },
  deleteButton: {
    backgroundColor: "#FF6B6B",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DeleteConfirmationModal;
