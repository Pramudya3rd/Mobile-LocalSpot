// components/FavoriteCard.js
import React from "react";
import { TouchableOpacity, Image, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FavoriteCard = ({ item }) => {
  return (
    <TouchableOpacity style={styles.favoriteCard}>
      <Image source={item.image} style={styles.favoriteImage} />
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteTitle}>{item.title}</Text>
        <View style={styles.favoriteDetails}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.favoriteRating}>{item.rating}</Text>
          <Text style={styles.favoriteDistance}>{item.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  favoriteCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginRight: 15,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  favoriteInfo: {
    padding: 12,
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  favoriteDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  favoriteRating: {
    marginLeft: 4,
    fontSize: 14,
    color: "#555",
  },
  favoriteDistance: {
    // Sesuaikan margin agar jaraknya pas
    marginLeft: "auto", // Ini akan mendorong teks ke kanan sejauh mungkin
    fontSize: 14,
    color: "#555",
  },
});

export default FavoriteCard;
