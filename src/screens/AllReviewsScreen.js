// src/screens/AllReviewsScreen.js
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; 

const AllReviewsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets(); 

  const { reviews_data = [], place_name = 'Tempat' } = route.params || {};

  const handleBack = () => {
    navigation.goBack();
  };


  const formatReviewDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; 
    }
  };


  const renderReviewStars = (rating) => {
    const stars = [];
    const validRating = typeof rating === 'number' ? rating : 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= validRating ? "star" : "star-outline"}
          size={18}
          color="#FFD700"
        />
      );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}> {/* Terapkan padding aman ke atas, kiri, kanan */}
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Ulasan {place_name}</Text> {/* Tambahkan numberOfLines */}
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollViewContent, { paddingBottom: insets.bottom + 15 }]}>
        {reviews_data.length > 0 ? (
          reviews_data.map((review, index) => (
            <View key={review.id || index} style={styles.reviewItem}>
              <View style={styles.reviewAuthorHeader}>
                <Image
                  source={{ uri: (review.user && review.user.avatar_url) ? review.user.avatar_url : 'https://via.placeholder.com/40' }}
                  style={styles.userAvatar}
                />
                <View>
                  <Text style={styles.userName}>{(review.user && review.user.name) || 'Pengguna Anonim'}</Text>
                  <Text style={styles.reviewDate}>{formatReviewDate(review.created_at)}</Text> {/* Gunakan fungsi format */}
                  {renderReviewStars(review.rating || 0)}
                </View>
              </View>
              <Text style={styles.reviewText}>{review.comment || 'Tidak ada komentar.'}</Text>
              <TouchableOpacity style={styles.likeButton}>
                <Ionicons name="thumbs-up-outline" size={16} color="#666" />
                <Text style={styles.likeText}>Like</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noReviewsText}>Belum ada ulasan untuk tempat ini.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginLeft: 0, 
    marginRight: 0, 
  },
  headerSpacer: {
    width: 40,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 15, 

  },
  reviewItem: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  reviewAuthorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#888',
  },
  reviewText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 10,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  likeText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  noReviewsText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 15,
    paddingVertical: 20,
  },
});

export default AllReviewsScreen;