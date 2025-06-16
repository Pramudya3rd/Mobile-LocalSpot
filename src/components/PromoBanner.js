// components/PromoBanner.js
import React from "react";
import { View, Image, StyleSheet } from "react-native";

const PromoBanner = () => {
  return (
    <View style={styles.promoContainer}>
      <Image
        source={require("../../assets/images/Ads.png")}
        style={styles.promoBanner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  promoContainer: {
    marginBottom: 20,
    alignItems: "center",
    marginHorizontal: 16, // Agar padding konsisten dengan layar utama
  },
  promoBanner: {
    width: "100%",
    height: 150,
    borderRadius: 15,
    resizeMode: "contain",
  },
});

export default PromoBanner;
