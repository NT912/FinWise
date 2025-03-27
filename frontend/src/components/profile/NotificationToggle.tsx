import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import notificationStyles from "../../styles/profile/notificationStyles";

interface NotificationToggleProps {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
  label,
  value,
  onToggle,
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
    <View style={notificationStyles.optionRow}>
      <Text style={notificationStyles.optionLabel}>{label}</Text>
      <TouchableOpacity
        style={notificationStyles.toggleContainer}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[notificationStyles.toggleTrack, { backgroundColor }]}
        >
          <Animated.View
            style={[
              notificationStyles.toggleThumb,
              { transform: [{ translateX }] },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default NotificationToggle;
