// src/components/LinkButton.js
import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

const LinkButton = ({ title, onPress, color, underline = false }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text
        style={[
          styles.linkText,
          { color: color || "#007bff" }, // Warna default jika tidak diberikan
          underline && styles.underlineText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  linkText: {
    fontSize: 14,
    //fontWeight: 'bold', // Bisa ditambahkan jika diinginkan
  },
  underlineText: {
    textDecorationLine: "underline",
  },
});

export default LinkButton;
