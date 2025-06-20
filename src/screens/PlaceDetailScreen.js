// screens/PlaceDetailScreen.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput, // <-- Tambahkan ini untuk input komentar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // <-- Tambahkan ini

const API_BASE_URL = "http://10.0.2.2:8000/api";

const PlaceDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { placeId } = route.params;

  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State Baru untuk Ulasan ---
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Fungsi untuk memuat data dipisahkan agar bisa dipanggil ulang ---
  const fetchPlaceDetail = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/places/${placeId}`);
      const json = await response.json();

      if (response.ok) {
        // Di backend, responsnya adalah { message: '...', place: {...} }
        // jadi kita ambil datanya dari 'place'
        setPlace(json.place);
        setError(null);
      } else {
        setError(
          "Gagal memuat detail tempat: " +
            (json.message || `Status ${response.status}`)
        );
      }
    } catch (err) {
      console.error("Error fetching place detail:", err);
      setError("Error jaringan saat memuat detail tempat.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaceDetail();
  }, [placeId]);

  // --- Fungsi untuk mengirim ulasan (handleRatingPress diubah) ---
  const handleSubmitReview = async () => {
    if (userRating === 0) {
      Alert.alert(
        "Rating Kosong",
        "Harap berikan rating bintang terlebih dahulu."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Ambil token dari AsyncStorage
      const token = await AsyncStorage.getItem("user_token");
      if (!token) {
        Alert.alert(
          "Anda Belum Login",
          "Silakan login untuk memberikan ulasan.",
          [
            { text: "OK", onPress: () => navigation.navigate("Login") }, // Arahkan ke layar login
          ]
        );
        setIsSubmitting(false);
        return;
      }

      // 2. Kirim data ke backend
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`, // Sertakan token
        },
        body: JSON.stringify({
          place_id: placeId,
          rating: userRating,
          comment: userComment,
        }),
      });

      const json = await response.json();

      if (response.ok) {
        Alert.alert("Ulasan Terkirim", "Terima kasih atas ulasan Anda!");
        // Reset input & muat ulang data untuk menampilkan ulasan baru
        setUserRating(0);
        setUserComment("");
        fetchPlaceDetail(); // Muat ulang detail tempat
      } else {
        // Tangani error dari backend
        const errorMessage = json.message || "Gagal mengirim ulasan.";
        Alert.alert("Gagal", errorMessage);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      Alert.alert("Error", "Terjadi masalah saat mengirim ulasan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A2BE2" />
        <Text>Memuat detail tempat...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Terjadi Kesalahan: {error}</Text>
        <TouchableOpacity onPress={fetchPlaceDetail}>
          <Text style={styles.retryButton}>Coba Lagi</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!place) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Tempat tidak ditemukan.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.retryButton}>Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderStars = (rating, onStarPress = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onStarPress && onStarPress(i)}
          disabled={!onStarPress}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={onStarPress ? 30 : 18} // Bintang lebih besar untuk input
            color={i <= rating ? "#FFD700" : "gray"}
            style={styles.starIcon}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starRatingContainer}>{stars}</View>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Tempat</Text>
          <TouchableOpacity style={styles.heartButton}>
            <Ionicons name="heart-outline" size={24} color="#ff3030" />
          </TouchableOpacity>
        </View>

        <Image
          source={{
            uri: place.main_image_url || "https://via.placeholder.com/400x200",
          }}
          style={styles.placeImage}
        />

        <View style={styles.contentContainer}>
          <View style={styles.titleRatingContainer}>
            <Text style={styles.placeName}>{place.name}</Text>
            <View style={styles.ratingInfo}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.ratingText}>
                {place.average_rating || "N/A"}
              </Text>
              <Text style={styles.reviewCount}>
                ({place.review_count || 0} Ulasan)
              </Text>
            </View>
          </View>

          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={16} color="gray" />
            <Text style={styles.addressText}>{place.address}</Text>
          </View>

          {/* ... Sisa info (Deskripsi, Jam Buka) sama seperti kode Anda ... */}

          {/* --- Bagian Input Ulasan yang Diperbarui --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bagaimana Tempatnya?</Text>
            <View style={styles.userRatingInput}>
              {renderStars(userRating, setUserRating)}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Tulis komentar Anda di sini... (opsional)"
              value={userComment}
              onChangeText={setUserComment}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitReview}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bagian Semua Ulasan */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Semua Ulasan</Text>
            <View style={styles.allReviewsContainer}>
              {place.reviews && place.reviews.length > 0 ? (
                place.reviews.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewerName}>
                        {review.user ? review.user.username : "Pengguna"}
                      </Text>
                      {/* Memanggil renderStars tanpa fungsi press */}
                      {renderStars(review.rating)}
                    </View>
                    <Text style={styles.reviewComment}>
                      {review.comment || "Tidak ada komentar."}
                    </Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString("id-ID")}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noReviewsText}>
                  Belum ada ulasan untuk tempat ini.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Tambahkan beberapa style baru ---
const styles = StyleSheet.create({
  // ... (copy semua style lama Anda ke sini) ...
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    marginBottom: 10,
  },
  retryButton: { color: "#8A2BE2", fontSize: 16, fontWeight: "bold" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  heartButton: { padding: 5 },
  placeImage: { width: "100%", height: 250, resizeMode: "cover" },
  contentContainer: {
    padding: 16,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingBottom: 50,
  },
  titleRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  placeName: { fontSize: 24, fontWeight: "bold", flex: 1, marginRight: 10 },
  ratingInfo: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 18, fontWeight: "bold", marginLeft: 5 },
  reviewCount: { fontSize: 14, color: "gray", marginLeft: 5 },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  addressText: { fontSize: 16, color: "gray", marginLeft: 5 },
  section: { marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  descriptionText: { fontSize: 16, lineHeight: 24, color: "#333" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoIcon: { marginRight: 10 },
  infoText: { fontSize: 16, color: "#555" },
  starRatingContainer: { flexDirection: "row" },
  starIcon: { marginHorizontal: 2 },
  userRatingInput: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    marginTop: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#8A2BE2",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  submitButtonDisabled: {
    backgroundColor: "#c7a1e6",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  allReviewsContainer: { marginTop: 10 },
  reviewCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerName: { fontWeight: "bold", fontSize: 15 },
  reviewComment: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
  reviewDate: { fontSize: 12, color: "gray", textAlign: "right" },
  noReviewsText: { textAlign: "center", color: "gray", marginTop: 20 },
});

export default PlaceDetailScreen;
