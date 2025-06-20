import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const LargeButton = ({ title, onPress, type }) => {
  const buttonStyle =
    type === "primary" ? styles.primaryButton : styles.secondaryButton;
  const textStyle =
    type === "primary" ? styles.primaryButtonText : styles.secondaryButtonText;

  return (
    <TouchableOpacity
      style={[styles.baseButton, buttonStyle]}
      onPress={onPress}
    >
      <Text style={[styles.baseButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 15, // Jarak antar tombol
  },
  // Style untuk tombol 'Login' (Primary)
  primaryButton: {
    backgroundColor: "#FF7F50",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Style untuk tombol 'Register' (Secondary)
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E0E0", // Border tipis untuk membedakan dari background
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  secondaryButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LargeButton;
