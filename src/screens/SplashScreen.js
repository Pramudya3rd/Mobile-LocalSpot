// src/screens/SplashScreen.js
import React from "react";
import { View, Image, StyleSheet } from "react-native";

export default function SplashScreen() {
  // Pastikan tidak ada spasi atau newline ekstra di sini
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/Logo-LocalSpot.png")} // Pastikan path ini benar
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
});
