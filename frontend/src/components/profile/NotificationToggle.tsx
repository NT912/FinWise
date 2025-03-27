import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";

interface NotificationToggleProps {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  description?: string;
  icon?: React.ReactNode;
  isLast?: boolean;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
  label,
  value,
  onToggle,
  description,
  icon,
  isLast = false,
}) => {
  const toggleAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleToggle = () => {
    const newValue = !value;
    onToggle(newValue);

    Animated.timing(toggleAnim, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const translateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 24],
  });

  const backgroundColor = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ccc", "#00C897"],
  });

  return (
    <View style={[styles.optionRow, isLast ? null : styles.optionBorder]}>
      <View style={styles.optionLeft}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text style={styles.optionLabel}>{label}</Text>
          {description && (
            <Text style={styles.optionDescription}>{description}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.toggleContainer}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.toggleTrack, { backgroundColor }]}>
          <Animated.View
            style={[styles.toggleThumb, { transform: [{ translateX }] }]}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 30,
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: "#777",
  },
  toggleContainer: {
    width: 50,
    height: 30,
    justifyContent: "center",
    overflow: "hidden",
  },
  toggleTrack: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    position: "absolute",
    left: 2,
  },
});

export default NotificationToggle;
