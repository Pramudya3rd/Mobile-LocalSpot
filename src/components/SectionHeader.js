// components/SectionHeader.js
import React from "react";
import { Text, StyleSheet, View } from "react-native";

const SectionHeader = ({ title }) => {
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeaderContainer: {
    marginBottom: 10,
    paddingHorizontal: 16, // Agar padding konsisten dengan layar utama
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default SectionHeader;
