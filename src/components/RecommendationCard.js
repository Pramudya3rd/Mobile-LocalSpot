// src/components/RecommendationCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const { width } = Dimensions.get('window');

const RecommendationCard = ({ item }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('DetailTempat', { placeId: item.id });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      {/* Pastikan path gambar ini benar jika menggunakan local asset */}
      <Image source={{ uri: item.image.uri }} style={styles.image} />
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={20} color="white" />
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <View style={styles.detailsRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    // Sesuaikan lebar ini agar sesuai dengan `gap` dan `paddingHorizontal` di HomeScreen
    // Formula: (lebar_layar - (paddingHorizontal_FlatList_di_HomeScreen * 2) - (gap_antar_kolom)) / 2
    // HomeScreen: paddingHorizontal: 16 (total 32), gap: 16
    // Jadi: (width - 32 - 16) / 2 = (width - 48) / 2
    width: (width - 48) / 2, 
    // Tidak ada marginHorizontal di sini, karena sudah dihandle oleh `gap` di FlatList `columnWrapperStyle`
    marginBottom: 16, // Jarak antar baris kartu
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 15,
    padding: 5,
  },
  infoContainer: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#555',
  },
});

export default RecommendationCard;