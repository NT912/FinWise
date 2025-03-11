import React from "react";
import { View, Text, Switch } from "react-native";
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
  return (
    <View style={notificationStyles.optionRow}>
      <Text style={notificationStyles.optionLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#ccc", true: "#00C897" }}
        thumbColor="#fff"
      />
    </View>
  );
};

export default NotificationToggle;
