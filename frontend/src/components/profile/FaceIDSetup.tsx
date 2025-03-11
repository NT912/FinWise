import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getUserProfile } from "../../services/profileService";
import faceIDStyles from "../../styles/profile/faceIDStyles";

interface FaceIDSetupProps {
  onToggle: (enabled: boolean) => void;
}

const FaceIDSetup: React.FC<FaceIDSetupProps> = ({ onToggle }) => {
  const [faceIDEnabled, setFaceIDEnabled] = useState(false);

  useEffect(() => {
    fetchFaceIDStatus();
  }, []);

  const fetchFaceIDStatus = async () => {
    try {
      const userData = await getUserProfile();
      if (userData) {
        setFaceIDEnabled(userData.faceIDEnabled || false);
      }
    } catch (error) {
      console.error("Error fetching Face ID status:", error);
    }
  };

  const handleToggleFaceID = async () => {
    const newStatus = !faceIDEnabled;
    setFaceIDEnabled(newStatus);

    if (onToggle) {
      onToggle(newStatus);
    }
  };

  return (
    <View style={faceIDStyles.container}>
      <View style={faceIDStyles.scanArea}>
        <MaterialCommunityIcons
          name="face-recognition"
          size={120}
          color="#00C897"
          style={faceIDStyles.faceIcon}
        />
      </View>

      <Text style={faceIDStyles.title}>
        {faceIDEnabled ? "Face ID Enabled" : "Use Face ID To Access"}
      </Text>

      <Text style={faceIDStyles.description}>
        {faceIDEnabled
          ? "Your account is protected with Face ID authentication. You can disable it anytime."
          : "Enable Face ID authentication for quick and secure access to your account."}
      </Text>

      <TouchableOpacity
        style={[
          faceIDStyles.button,
          faceIDEnabled
            ? faceIDStyles.disableButton
            : faceIDStyles.enableButton,
        ]}
        onPress={handleToggleFaceID}
      >
        <MaterialCommunityIcons
          name={faceIDEnabled ? "face-recognition" : "face-recognition"}
          size={24}
          color="#fff"
          style={faceIDStyles.buttonIcon}
        />
        <Text style={faceIDStyles.buttonText}>
          {faceIDEnabled ? "Disable Face ID" : "Enable Face ID"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FaceIDSetup;
