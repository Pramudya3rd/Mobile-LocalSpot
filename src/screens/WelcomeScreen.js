import React from "react";
import { View, Text, StyleSheet } from "react-native"; // <-- PERBAIKAN DI SINI!

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Welcome to WelcomeScreen!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
