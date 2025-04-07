import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { scanReceipt } from "../services/apiService";
import { useNavigation } from "@react-navigation/native";

export default function ScanReceiptScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // 📝 Chọn ảnh từ thư viện
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  // 📝 Chụp ảnh mới
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  // 📝 Gửi ảnh đến server để nhận diện OCR
  const handleScanReceipt = async () => {
    if (!imageUri) {
      Alert.alert("Error", "Please select or capture an image first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("receipt", {
        uri: imageUri,
        name: "receipt.jpg",
        type: "image/jpeg",
      } as any); // 👈 Fix lỗi TypeScript bằng cách ép kiểu any

      const response = await scanReceipt(formData);

      Alert.alert("Success", "Receipt scanned successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error("OCR Scan Error:", error);
      Alert.alert("Error", "Failed to scan receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Receipt</Text>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Choose from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take a Photo</Text>
      </TouchableOpacity>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <View style={styles.grayText}>
        <Text style={styles.grayTextContent}>
          Upload your receipt images to extract transaction details
          automatically
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#00D09E", marginTop: 20 }]}
        onPress={handleScanReceipt}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Scan Receipt</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// 🎨 CSS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#E3FFF8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#00D09E",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 16 },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
  grayText: {
    marginTop: 20,
    alignItems: "center",
  },
  grayTextContent: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
});
