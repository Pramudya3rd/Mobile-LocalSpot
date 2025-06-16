// src/screens/AddScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AddScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Ini adalah Halaman Tambah</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default AddScreen;
