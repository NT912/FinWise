import React from "react";
import { View, ActivityIndicator } from "react-native";
import homeStyles from "../styles/home/homeStyles";

const LoadingIndicator = () => {
  return (
    <View style={homeStyles.loaderContainer}>
      <ActivityIndicator size="large" color="#00D09E" />
    </View>
  );
};

export default LoadingIndicator;
