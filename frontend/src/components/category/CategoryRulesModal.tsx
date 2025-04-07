import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Switch,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../../types";

interface CategoryRule {
  keyword: string;
  isEnabled: boolean;
}

interface CategoryRulesModalProps {
  visible: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (rules: CategoryRule[]) => void;
}

const CategoryRulesModal: React.FC<CategoryRulesModalProps> = ({
  visible,
  category,
  onClose,
  onSave,
}) => {
  const [rules, setRules] = useState<CategoryRule[]>(
    category?.rules || [{ keyword: "", isEnabled: true }]
  );
  const [newKeyword, setNewKeyword] = useState("");

  const handleAddRule = () => {
    if (newKeyword.trim()) {
      setRules([...rules, { keyword: newKeyword.trim(), isEnabled: true }]);
      setNewKeyword("");
    }
  };

  const handleRemoveRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  const handleToggleRule = (index: number) => {
    const newRules = [...rules];
    newRules[index].isEnabled = !newRules[index].isEnabled;
    setRules(newRules);
  };

  const handleSave = () => {
    onSave(rules);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Category Rules</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.categoryInfo}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: category?.color || "#FF6B6B" },
                  ]}
                >
                  <Ionicons
                    name={category?.icon || "cart"}
                    size={24}
                    color="#FFF"
                  />
                </View>
                <Text style={styles.categoryName}>{category?.name}</Text>
              </View>

              <View style={styles.rulesContainer}>
                <Text style={styles.sectionTitle}>
                  Auto-Categorization Rules
                </Text>
                <Text style={styles.sectionDescription}>
                  Add keywords to automatically categorize transactions
                </Text>

                {rules.map((rule, index) => (
                  <View key={index} style={styles.ruleItem}>
                    <Switch
                      value={rule.isEnabled}
                      onValueChange={() => handleToggleRule(index)}
                    />
                    <Text style={styles.ruleKeyword}>{rule.keyword}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveRule(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#FF6B6B"
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.addRuleContainer}>
                  <TextInput
                    style={styles.addRuleInput}
                    value={newKeyword}
                    onChangeText={setNewKeyword}
                    placeholder="Add new keyword"
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddRule}
                    disabled={!newKeyword.trim()}
                  >
                    <Ionicons
                      name="add"
                      size={24}
                      color={newKeyword.trim() ? "#00D09E" : "#999"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
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
  closeButton: {
    padding: 4,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  rulesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  ruleKeyword: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  removeButton: {
    padding: 4,
  },
  addRuleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  addRuleInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
  },
  addButton: {
    padding: 12,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  saveButton: {
    backgroundColor: "#00D09E",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default CategoryRulesModal;
