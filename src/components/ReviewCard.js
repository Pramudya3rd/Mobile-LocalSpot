// src/components/ReviewCard.js
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
// import { Ionicons } from '@expo/vector-icons'; // Import jika ReviewCard pakai ikon rating

const ReviewCard = ({ review }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: review.image }} style={styles.userImage} />
        <View>
          <Text style={styles.userName}>{review.user}</Text>
          <Text style={styles.placeName}>di {review.place}</Text>
        </View>
        <Text style={styles.rating}>{review.rating} Bintang</Text>
      </View>
      <Text style={styles.reviewText}>{review.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // For Android shadow
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20, // Bentuk lingkaran
    marginRight: 10,
  },
  userName: {
    fontWeight: "bold",
  },
  placeName: {
    fontSize: 12,
    color: "gray",
  },
  rating: {
    marginLeft: "auto", // Dorong ke kanan
    fontWeight: "bold",
    color: "#FF8C69",
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ReviewCard;
