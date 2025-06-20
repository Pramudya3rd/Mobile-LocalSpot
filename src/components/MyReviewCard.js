// src/components/MyReviewCard.js
import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Nama komponen diubah menjadi MyReviewCard
const MyReviewCard = ({ review, onEdit, onDelete }) => {
  return (
    <View style={styles.card}>
      <View style={styles.placeInfo}>
        <Image source={{ uri: review.placeImage }} style={styles.placeImage} />
        <View style={styles.textInfo}>
          <Text style={styles.placeName}>{review.placeName}</Text>
          <View style={styles.ratingTimeContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{review.rating}</Text>
            <Text style={styles.timeText}>{review.timeAgo}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewText}>{review.reviewText}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => onDelete(review.id)}>
          <Ionicons name="trash-outline" size={18} color="#FF6347" />
          <Text style={[styles.buttonText, { color: '#FF6347' }]}>Hapus</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => onEdit(review.id, review)}>
          <Ionicons name="create-outline" size={18} color="#8A2BE2" />
          <Text style={[styles.buttonText, { color: '#8A2BE2' }]}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  placeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  textInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
    marginRight: 10,
  },
  timeText: {
    fontSize: 13,
    color: '#777',
  },
  reviewText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    gap: 10, 
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
  },
  deleteButton: {
    borderColor: '#FF6347',
    backgroundColor: 'rgba(255, 99, 71, 0.1)', 
  },
  editButton: {
    borderColor: '#8A2BE2',
    backgroundColor: 'rgba(138, 43, 226, 0.1)', 
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default MyReviewCard;