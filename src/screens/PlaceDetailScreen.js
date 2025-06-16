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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native"; // Import useRoute untuk mendapatkan params
import { useNavigation } from "@react-navigation/native"; // Import useNavigation untuk navigasi kembali

// URL BASE API Anda (sesuaikan dengan IP lokal laptop Anda)
const API_BASE_URL = "http://10.0.2.2:8000/api"; // Ganti dengan IP laptop Anda

const PlaceDetailScreen = () => {
  const route = useRoute(); // Hook untuk mengakses route params
  const navigation = useNavigation(); // Hook untuk navigasi
  const { placeId } = route.params; // Ambil placeId dari parameter navigasi

  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk rating yang diberikan user (opsional)
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const fetchPlaceDetail = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/places/${placeId}`); // Panggil API detail tempat
        const json = await response.json();

        if (response.ok) {
          setPlace(json);
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

    fetchPlaceDetail();
  }, [placeId]); // Bergantung pada placeId, muat ulang jika ID berubah

  // Fungsi untuk menangani pemberian rating
  const handleRatingPress = (rating) => {
    setUserRating(rating);
    Alert.alert(
      "Rating Diberikan",
      `Anda memberikan rating ${rating} bintang!`
    );
    // TODO: Kirim rating ini ke backend Anda
    // Anda perlu endpoint API untuk menyimpan ulasan/rating baru
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.retryButton}>Kembali</Text>
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

  // Komponen untuk menampilkan bintang rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={24}
          color={i <= rating ? "#FFD700" : "gray"}
          style={styles.starIcon}
          onPress={() => handleRatingPress(i)} // Hanya jika ini area rating input
        />
      );
    }
    return <View style={styles.starRatingContainer}>{stars}</View>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Tempat</Text>
          <TouchableOpacity style={styles.heartButton}>
            <Ionicons name="heart-outline" size={24} color="#ff3030" />{" "}
            {/* Atau heart jika sudah favorit */}
          </TouchableOpacity>
        </View>

        {/* Gambar Tempat */}
        <Image
          source={{
            uri: place.main_image_url || "https://via.placeholder.com/400x200",
          }}
          style={styles.placeImage}
        />

        <View style={styles.contentContainer}>
          {/* Nama dan Rating */}
          <View style={styles.titleRatingContainer}>
            <Text style={styles.placeName}>{place.name}</Text>
            <View style={styles.ratingInfo}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.ratingText}>{place.rating || "N/A"}</Text>
              <Text style={styles.reviewCount}>
                ({place.reviews ? place.reviews.length : 0} Ulasan)
              </Text>
            </View>
          </View>

          {/* Alamat */}
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={16} color="gray" />
            <Text style={styles.addressText}>{place.address}</Text>
          </View>

          {/* Deskripsi Tempat */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deskripsi Tempat</Text>
            <Text style={styles.descriptionText}>
              {place.description || "Tidak ada deskripsi tersedia."}
            </Text>
          </View>

          {/* Informasi Tambahan */}
          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={18}
              color="gray"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Dari{" "}
              {place.added_by_user_id
                ? "User ID " + place.added_by_user_id
                : "Anonim"}{" "}
              (Anda)
            </Text>{" "}
            {/* Asumsi 'Anda' adalah user yang login */}
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={18}
              color="gray"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Buka - {place.opening_hours || "Tidak tersedia"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="wallet-outline"
              size={18}
              color="gray"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>Rp 10.000 - Rp 200.000</Text>{" "}
            {/* Hardcoded, bisa dari backend */}
          </View>

          {/* Bagian Rating Pengguna */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bagaimana Tempatnya?</Text>
            <View style={styles.userRatingInput}>
              {renderStars(userRating)}
            </View>
            <Text style={styles.userRatingText}>
              Sentuh bintang untuk memberikan rating Anda!
            </Text>
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
                        {review.user ? review.user.username : "Pengguna Anonim"}
                      </Text>
                      <View style={styles.reviewRatingStars}>
                        {renderStars(review.rating)}
                      </View>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    color: "#8A2BE2",
    fontSize: 16,
    fontWeight: "bold",
  },
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  heartButton: {
    padding: 5,
  },
  placeImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  contentContainer: {
    padding: 16,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20, // Menggeser ke atas gambar
    paddingBottom: 50, // Agar tidak terlalu mepet bawah
  },
  titleRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  placeName: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 5,
  },
  reviewCount: {
    fontSize: 14,
    color: "gray",
    marginLeft: 5,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  addressText: {
    fontSize: 16,
    color: "gray",
    marginLeft: 5,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#555",
  },
  userRatingInput: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  starRatingContainer: {
    flexDirection: "row",
  },
  starIcon: {
    marginHorizontal: 5,
  },
  userRatingText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    color: "gray",
  },
  allReviewsContainer: {
    marginTop: 10,
  },
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
    marginBottom: 5,
  },
  reviewerName: {
    fontWeight: "bold",
    fontSize: 15,
  },
  reviewRatingStars: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: "gray",
    textAlign: "right",
  },
  noReviewsText: {
    textAlign: "center",
    color: "gray",
    marginTop: 20,
  },
});

export default PlaceDetailScreen;
