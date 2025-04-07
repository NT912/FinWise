import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import categoryStyles from "../../styles/category/categoryStyles";

interface CategoryHeaderProps {
  title: string;
  subtitle: string;
  userName: string;
  userAvatar: string;
  onAddCategory: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  title,
  subtitle,
  userName,
  userAvatar,
  onAddCategory,
}) => {
  return (
    <View style={categoryStyles.header}>
      <View style={categoryStyles.headerContent}>
        <View>
          <Text style={categoryStyles.headerTitle}>{title}</Text>
          <Text style={categoryStyles.headerSubtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity
          style={categoryStyles.floatingButton}
          onPress={onAddCategory}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CategoryHeader;
