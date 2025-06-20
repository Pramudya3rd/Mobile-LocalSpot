import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import MyReviewCard from "../components/MyReviewCard"; // Pastikan path ini benar

const API_BASE_URL = "https://localspot.hafidzirham.com/api";

const MyReviewsScreen = () => {
  const navigation = useNavigation();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchMyReviews();
    }, [])
  );

  // Fungsi pembantu untuk memformat waktu
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Tidak diketahui";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffSeconds = Math.floor(diffTime / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays} hari yang lalu`;
      if (diffHours > 0) return `${diffHours} jam yang lalu`;
      if (diffMinutes > 0) return `${diffMinutes} menit yang lalu`;
      return "Baru saja";
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const fetchMyReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setReviews([]);
        setIsLoading(false);
        setError("Anda harus login untuk melihat ulasan Anda.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/my-reviews`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      if (response.ok && json.reviews) {
        // --- PERBAIKAN UTAMA: Transformasi Data ---
        // Menyesuaikan format data dari backend agar cocok dengan props di MyReviewCard
        const transformedData = json.reviews.map((review) => ({
          ...review, // Menyalin semua properti asli (id, rating, comment, user, dll)
          placeName: review.place?.name || "Nama Tempat Tidak Tersedia",
          placeImage:
            review.place?.main_image_url || "https://via.placeholder.com/60",
          reviewText: review.comment, // Map 'comment' ke 'reviewText'
          timeAgo: formatTimeAgo(review.created_at),
        }));
        setReviews(transformedData);
      } else {
        setError(json.message || "Gagal memuat ulasan Anda.");
      }
    } catch (err) {
      console.error("Error fetching my reviews:", err);
      setError("Error jaringan saat memuat ulasan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReview = (reviewData) => {
    if (!reviewData.place || !reviewData.place.id) {
      Alert.alert("Error", "Informasi tempat pada ulasan ini tidak lengkap.");
      return;
    }
    navigation.navigate("DetailTempat", {
      placeId: reviewData.place.id,
    });
  };

  const handleDeleteReview = async (reviewId) => {
    Alert.alert(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus ulasan ini secara permanen?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              const token = await AsyncStorage.getItem("userToken");
              if (!token) {
                Alert.alert("Autentikasi Gagal", "Silakan login kembali.");
                setIsLoading(false);
                return;
              }

              const response = await fetch(
                `${API_BASE_URL}/reviews/${reviewId}`,
                {
                  method: "DELETE",
                  headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const result = await response.json();

              if (response.ok) {
                Alert.alert(
                  "Sukses",
                  result.message || "Ulasan berhasil dihapus."
                );
                fetchMyReviews();
              } else {
                Alert.alert(
                  "Gagal",
                  result.message || "Gagal menghapus ulasan."
                );
              }
            } catch (err) {
              console.error("Error deleting review:", err);
              Alert.alert("Error", "Tidak dapat terhubung ke server.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A2BE2" />
          <Text>Memuat ulasan Anda...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchMyReviews} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (reviews.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbox-ellipses-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Anda belum membuat ulasan.</Text>
          <Text style={styles.emptySubText}>
            Bagikan pengalaman Anda tentang tempat-tempat yang sudah Anda
            kunjungi!
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={reviews}
        renderItem={({ item }) => (
          <MyReviewCard
            review={item}
            onEdit={() => handleEditReview(item)}
            onDelete={() => handleDeleteReview(item.id)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ulasan Saya</Text>
        <View style={styles.placeholder} />
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 34,
  },
  listContainer: {
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FF8A00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
});

export default MyReviewsScreen;
