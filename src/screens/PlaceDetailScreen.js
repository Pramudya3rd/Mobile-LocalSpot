import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator, // Untuk indikator loading
  Alert, // Untuk menampilkan pesan error
} from "react-native";
import { AntDesign, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import axios from "axios"; // Pastikan Anda sudah menginstal axios: npm install axios

// Konstanta URL API Anda
// Ganti dengan IP address lokal komputer Anda atau domain backend Anda
// Contoh: const API_BASE_URL = 'http://192.168.1.100:8000/api';
// Untuk development, bisa juga 'http://localhost:8000/api' jika di emulator dan backend berjalan lokal
const API_BASE_URL = "http://10.0.2.2:8000/api"; // Contoh untuk Android Emulator ke localhost backend
// Untuk iOS simulator, bisa 'http://localhost:8000/api'
// Pastikan server Laravel Anda berjalan (php artisan serve)

const PlaceDetailScreen = ({ route, navigation }) => {
  // Ambil placeId dari route params
  // Contoh: navigasi ke layar ini dengan navigation.navigate('PlaceDetail', { placeId: 1 });
  const { placeId } = route.params;

  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaceDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_BASE_URL}/places/${placeId}`);
        setPlaceData(response.data);
      } catch (err) {
        console.error(
          "Error fetching place details:",
          err.response?.data || err.message
        );
        setError("Failed to load place details. Please try again.");
        Alert.alert(
          "Error",
          "Failed to load place details: " +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetail();
  }, [placeId]); // Dependency array: jalankan ulang useEffect jika placeId berubah

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => fetchPlaceDetail()}>
          <Text style={styles.retryButton}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!placeData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>No place data available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Tempat</Text>
          <View style={styles.placeholderRight} />
        </View>

        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                placeData.formatted_main_image_url ||
                "https://via.placeholder.com/400x200?text=No+Image",
            }}
            style={styles.mainImage}
          />
          <TouchableOpacity style={styles.heartIcon}>
            <AntDesign name="hearto" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Place Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.placeName}>{placeData.name}</Text>
          <View style={styles.ratingContainer}>
            <AntDesign name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{placeData.average_rating}</Text>
            <Text style={styles.reviewCount}>
              ({placeData.reviews_count || 0} Ulasan)
            </Text>
          </View>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={16} color="gray" />
            <Text style={styles.locationText}>{placeData.address}</Text>
          </View>
        </View>

        {/* Description Section */}
        {placeData.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deskripsi Tempat</Text>
            <Text style={styles.descriptionText}>{placeData.description}</Text>
          </View>
        )}

        {/* Details List */}
        <View style={styles.section}>
          {placeData.addedBy && (
            <View style={styles.detailRow}>
              <MaterialIcons name="person" size={20} color="gray" />
              <Text style={styles.detailText}>
                Dari {placeData.addedBy.username || placeData.addedBy.email}{" "}
                (Anda)
              </Text>
            </View>
          )}
          {placeData.opening_hours && (
            <View style={styles.detailRow}>
              <MaterialIcons name="access-time" size={20} color="gray" />
              <Text style={styles.detailText}>
                <Text style={{ color: "green", fontWeight: "bold" }}>Buka</Text>{" "}
                · {placeData.opening_hours}
              </Text>
            </View>
          )}
          {/* Anda mungkin ingin menambahkan kolom harga di database atau menampilkannya secara statis */}
          <View style={styles.detailRow}>
            <FontAwesome5 name="money-bill-wave" size={18} color="gray" />
            <Text style={styles.detailText}>Rp 10.000 - Rp 200.000</Text>{" "}
            {/* Ganti dengan data dinamis jika ada */}
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleCentered}>Bagaimana Tempatnya?</Text>
          <View style={styles.starRatingContainer}>
            {[...Array(5)].map((_, i) => (
              <AntDesign
                key={i}
                name={
                  i < Math.floor(placeData.average_rating) ? "star" : "staro"
                } // Isi bintang berdasarkan rating
                size={30}
                color={
                  i < Math.floor(placeData.average_rating) ? "#FFD700" : "gray"
                }
                style={{ marginHorizontal: 5 }}
              />
            ))}
          </View>
        </View>

        {/* Review Section */}
        <View style={styles.section}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>Semua Ulasan</Text>
            <View style={styles.ratingContainer}>
              <AntDesign name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{placeData.average_rating}</Text>
            </View>
          </View>

          {placeData.reviews && placeData.reviews.length > 0 ? (
            placeData.reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewerInfo}>
                  <Image
                    source={{
                      uri:
                        review.user.profile_picture_url ||
                        "https://via.placeholder.com/40",
                    }}
                    style={styles.profilePic}
                  />
                  <View>
                    <Text style={styles.reviewerName}>
                      {review.user.username || review.user.email}
                    </Text>
                    <Text style={styles.reviewTime}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </Text>{" "}
                    {/* Format tanggal */}
                  </View>
                  <TouchableOpacity style={styles.optionsIcon}>
                    <MaterialIcons name="more-vert" size={24} color="gray" />
                  </TouchableOpacity>
                </View>
                <View style={styles.starRatingContainerSmall}>
                  {[...Array(5)].map((_, i) => (
                    <AntDesign
                      key={i}
                      name={i < review.rating ? "star" : "staro"}
                      size={14}
                      color={i < review.rating ? "#FFD700" : "gray"}
                      style={{ marginHorizontal: 1 }}
                    />
                  ))}
                </View>
                <Text style={styles.reviewTextContent}>
                  {review.comment || "No comment provided."}
                </Text>
                <TouchableOpacity style={styles.likeContainer}>
                  <AntDesign name="like2" size={18} color="gray" />
                  <Text style={styles.likeText}>Like</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noReviewsText}>
              Belum ada ulasan untuk tempat ini.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    color: "blue",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholderRight: {
    width: 24, // Same width as backButton for centering
  },
  imageContainer: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heartIcon: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 5,
  },
  infoSection: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  placeName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
    marginRight: 5,
  },
  reviewCount: {
    fontSize: 14,
    color: "gray",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "gray",
    marginLeft: 5,
  },
  section: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionTitleCentered: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 10,
    color: "#333",
  },
  starRatingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  starRatingContainerSmall: {
    flexDirection: "row",
    alignSelf: "flex-start", // Agar bintang-bintang tidak menyebar penuh
    marginBottom: 5,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  reviewItem: {
    paddingVertical: 15,
    borderTopWidth: 0.5,
    borderTopColor: "#eee",
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  reviewerName: {
    fontWeight: "bold",
    fontSize: 15,
  },
  reviewTime: {
    fontSize: 12,
    color: "gray",
  },
  optionsIcon: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  reviewTextContent: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    marginBottom: 10,
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeText: {
    marginLeft: 5,
    color: "gray",
  },
  noReviewsText: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
});

export default PlaceDetailScreen;
