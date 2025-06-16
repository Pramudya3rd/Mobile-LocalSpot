// src/components/PlaceCard.js
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
// import { Ionicons } from '@expo/vector-icons'; // Import jika PlaceCard pakai ikon

const PlaceCard = ({ place, type, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: place.image }} style={styles.image} />
      <Text style={styles.name}>{place.name}</Text>
      {type === "popular" && (
        <Text style={styles.rating}>
          Rating: {place.rating} ({place.reviews})
        </Text>
      )}
      {type === "nearest" && (
        <Text style={styles.distance}>{place.distance}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 150,
    height: 200,
    backgroundColor: "white",
    borderRadius: 10,
    marginRight: 15,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // For Android shadow
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50, // Bentuk lingkaran
    marginBottom: 5,
  },
  name: {
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  rating: {
    fontSize: 12,
    color: "gray",
  },
  distance: {
    fontSize: 12,
    color: "blue",
  },
});

export default PlaceCard;
