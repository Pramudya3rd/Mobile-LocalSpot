// components/CategoryCard.js
import React from "react";
import { TouchableOpacity, Image, Text, StyleSheet } from "react-native";

const CategoryCard = ({ item }) => {
  return (
    <TouchableOpacity style={styles.categoryCard}>
      <Image source={item.icon} style={{ width: 40, height: 40 }} />
      <Text style={styles.categoryText}>{item.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    width: 100,
    height: 100,
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  categoryText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center", // Agar teks panjang tetap di tengah
  },
});

export default CategoryCard;
