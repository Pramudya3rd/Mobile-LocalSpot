import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  PanResponder,
  Animated,
  SafeAreaView,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// =================================================================
// === PERBAIKAN 1: Import hook 'useAuth' dari AuthContext       ===
// =================================================================
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = "https://localspot.hafidzirham.com/api";

const DetailTempatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { placeId } = route.params;
  const insets = useSafeAreaInsets();

  // =====================================================================
  // === PERBAIKAN 2: Gunakan 'user', 'token', dan 'logout' dari AuthContext ===
  // =====================================================================
  const { user: currentUser, token, logout } = useAuth();

  const [placeData, setPlaceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [selectedReviewForEdit, setSelectedReviewForEdit] = useState(null);

  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dy: panY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          closeRatingModal();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  useFocusEffect(
    React.useCallback(() => {
      // 3. Logika disederhanakan, hanya perlu memanggil fetchPlaceDetails
      // karena status user sudah dikelola secara global oleh AuthContext.
      fetchPlaceDetails();
    }, [placeId, token]) // Refresh data jika ID tempat atau token pengguna berubah
  );

  const fetchPlaceDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = { Accept: "application/json" };
      // 4. Gunakan token dari context
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/places/${placeId}`, {
        headers,
      });
      const json = await response.json();

      if (response.ok && json.place) {
        setPlaceData(json.place);
        setIsFavorite(json.place.is_favorited || false);
      } else {
        setError(
          json.message || `Gagal memuat detail. Status: ${response.status}`
        );
      }
    } catch (err) {
      console.error("Error fetching place details:", err);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleFavorite = async () => {
    // =================================================================
    // === PERBAIKAN 5: Ubah onPress di Alert menjadi 'logout'       ===
    // =================================================================
    if (!currentUser || currentUser.isGuest) {
      Alert.alert(
        "Perlu Akun",
        "Anda harus login atau mendaftar untuk menggunakan fitur ini.",
        [
          {
            text: "Login atau Daftar",
            // Memanggil logout akan otomatis mengarahkan ke Auth Stack (layar Welcome/Login)
            onPress: logout,
          },
          {
            text: "Batal",
            style: "cancel",
          },
        ]
      );
      return;
    }

    const originalIsFavorite = isFavorite;
    setIsFavorite(!originalIsFavorite);

    try {
      const response = await fetch(
        `${API_BASE_URL}/places/${placeId}/toggle-favorite`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`, // Gunakan token dari context
          },
        }
      );
      const result = await response.json();
      if (!response.ok) {
        setIsFavorite(originalIsFavorite);
        Alert.alert(
          "Gagal",
          result.message || "Gagal mengubah status favorit."
        );
      } else {
        console.log("Server response on favorite toggle:", result.message);
      }
    } catch (err) {
      setIsFavorite(originalIsFavorite);
      console.error("Error toggling favorite:", err);
      Alert.alert("Error", "Gagal terhubung ke server untuk mengubah favorit.");
    }
  };

  const openRatingModal = (reviewToEdit = null) => {
    if (!currentUser || currentUser.isGuest) {
      Alert.alert(
        "Perlu Akun",
        "Anda harus login atau mendaftar untuk bisa memberikan ulasan.",
        [
          { text: "Login atau Daftar", onPress: logout },
          { text: "Batal", style: "cancel" },
        ]
      );
      return;
    }
    if (reviewToEdit) {
      setUserRating(reviewToEdit.rating || 0);
      setUserComment(reviewToEdit.comment || "");
      setSelectedReviewForEdit(reviewToEdit);
    } else {
      // Jika tidak ada review yang diedit, reset form untuk ulasan baru
      setUserRating(0);
      setUserComment("");
      setSelectedReviewForEdit(null);
    }
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    // Reset state saat modal ditutup
    setUserRating(0);
    setUserComment("");
    setSelectedReviewForEdit(null);
  };

  const handleStarPress = (rating) => {
    setUserRating(rating);
  };

  // NEW: Function to handle adding a new review
  const handleAddReview = async () => {
    if (userRating === 0) {
      Alert.alert("Peringatan", "Harap berikan bintang rating Anda.");
      return;
    }
    setIsLoading(true);
    try {
      if (!token) {
        Alert.alert("Autentikasi Gagal", "Sesi Anda telah berakhir.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          place_id: placeId,
          rating: userRating,
          comment: userComment,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert("Sukses", result.message || "Ulasan berhasil ditambahkan!");
        closeRatingModal();
        fetchPlaceDetails();
      } else {
        Alert.alert(
          "Gagal",
          result.message || "Terjadi kesalahan saat menambah ulasan."
        );
      }
    } catch (err) {
      Alert.alert("Error Koneksi", "Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Function to handle editing an existing review
  const handleEditReview = async () => {
    if (userRating === 0) {
      Alert.alert("Peringatan", "Harap berikan bintang rating Anda.");
      return;
    }
    if (!selectedReviewForEdit) {
      Alert.alert("Error", "Tidak ada ulasan yang dipilih untuk diedit.");
      return;
    }
    setIsLoading(true);
    try {
      if (!token) {
        Alert.alert("Autentikasi Gagal", "Sesi Anda telah berakhir.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/reviews/${selectedReviewForEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            place_id: placeId, // Ensure place_id is sent even for PUT
            rating: userRating,
            comment: userComment,
          }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        Alert.alert("Sukses", result.message || "Ulasan berhasil diperbarui!");
        closeRatingModal();
        fetchPlaceDetails();
      } else {
        Alert.alert(
          "Gagal",
          result.message || "Terjadi kesalahan saat memperbarui ulasan."
        );
      }
    } catch (err) {
      Alert.alert("Error Koneksi", "Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    Alert.alert("Konfirmasi Hapus", "Apakah Anda yakin?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true);
          try {
            if (!token) {
              Alert.alert("Autentikasi Gagal", "Sesi Anda telah berakhir.");
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

            if (response.ok) {
              Alert.alert("Sukses", "Ulasan berhasil dihapus.");
              fetchPlaceDetails();
            } else {
              const result = await response.json();
              Alert.alert("Gagal", result.message || "Gagal menghapus.");
            }
          } catch (err) {
            Alert.alert("Error Koneksi", "Gagal terhubung ke server.");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const renderReviewStars = (rating) => {
    const stars = [];
    const validRating = typeof rating === "number" ? rating : 0;
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
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  const formatReviewDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleSeeAllReviews = () => {
    if (placeData && Array.isArray(placeData.reviews)) {
      navigation.navigate("AllReviewsScreen", {
        reviews: placeData.reviews,
        placeName: placeData.name,
      });
    } else {
      Alert.alert("Info", "Tidak ada ulasan yang dapat ditampilkan.");
    }
  };

  const userReview = placeData?.reviews?.find(
    (review) => review.user && currentUser && review.user.id === currentUser.id
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8A00" />
        <Text>Memuat...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchPlaceDetails}>
          <Text style={styles.retryButton}>Coba Lagi</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!placeData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text>Tempat tidak ditemukan.</Text>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.retryButton}>Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#FF4500" : "white"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{
            uri:
              placeData.main_image_url || "https://via.placeholder.com/600x400",
          }}
          style={styles.mainImage}
        />
        <View style={styles.content}>
          <View style={styles.infoSection}>
            <Text style={styles.placeName}>{placeData.name}</Text>
            <View style={styles.ratingAddressContainer}>
              <View style={styles.ratingInfo}>
                <Ionicons name="star" size={18} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {placeData.average_rating}
                </Text>
                <Text style={styles.reviewCount}>
                  ({placeData.review_count} Ulasan)
                </Text>
              </View>
              <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {placeData.address}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deskripsi Tempat</Text>
            <Text style={styles.descriptionText}>{placeData.description}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.detailItem}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#666"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                Dari {placeData.added_by_user?.username || "Admin"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="time-outline"
                size={20}
                color="#666"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                Buka - {placeData.opening_hours}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="cash-outline"
                size={20}
                color="#666"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                {placeData.price_range || "Informasi tidak tersedia"}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bagaimana Tempatnya?</Text>
            {userReview ? (
              <View style={styles.yourReviewContainer}>
                <View style={styles.reviewAuthorHeader}>
                  <Image
                    source={{
                      uri:
                        userReview.user?.profile_picture_url ||
                        "https://via.placeholder.com/40",
                    }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.reviewAuthorDetails}>
                    <Text style={styles.userName}>Ulasan Anda</Text>
                    <Text style={styles.reviewDate}>
                      {formatReviewDate(userReview.created_at)}
                    </Text>
                    {renderReviewStars(userReview.rating || 0)}
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowOptionsMenu((prev) => !prev)}
                    style={styles.optionsButton}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                  </TouchableOpacity>
                  {showOptionsMenu && (
                    <View style={styles.optionsMenu}>
                      <TouchableOpacity
                        onPress={() => {
                          setShowOptionsMenu(false);
                          openRatingModal(userReview);
                        }}
                        style={styles.optionMenuItem}
                      >
                        <Text style={styles.optionMenuText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setShowOptionsMenu(false);
                          handleDeleteReview(userReview.id);
                        }}
                        style={[
                          styles.optionMenuItem,
                          { borderBottomWidth: 0 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionMenuText,
                            styles.optionMenuTextDelete,
                          ]}
                        >
                          Hapus
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <Text style={styles.reviewText}>
                  {userReview.comment || "Tidak ada komentar."}
                </Text>
              </View>
            ) : (
              // >>> Perbaikan di sini: Mengembalikan tombol "Beri Rating Sekarang"
              <TouchableOpacity
                style={styles.rateNowButton}
                onPress={() => openRatingModal(null)} // Panggil openRatingModal tanpa review untuk membuat baru
              >
                <Ionicons name="star" size={20} color="white" />
                <Text style={styles.rateNowButtonText}>
                  Beri Rating Sekarang
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.reviewHeader}>
              <Text style={styles.sectionTitle}>Ulasan Lainnya</Text>
            </View>
            {placeData.reviews &&
            placeData.reviews.filter(
              (r) => !(currentUser && r.user && r.user.id === currentUser.id)
            ).length > 0 ? (
              placeData.reviews
                .filter(
                  (review) =>
                    !(
                      currentUser &&
                      review.user &&
                      review.user.id === currentUser.id
                    )
                )
                .slice(0, 2)
                .map((review) => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewAuthorHeader}>
                      <Image
                        source={{
                          uri:
                            review.user?.profile_picture_url ||
                            "https://via.placeholder.com/40",
                        }}
                        style={styles.userAvatar}
                      />
                      <View>
                        <Text style={styles.userName}>
                          {review.user?.username || "Pengguna"}
                        </Text>
                        <Text style={styles.reviewDate}>
                          {formatReviewDate(review.created_at)}
                        </Text>
                        {renderReviewStars(review.rating || 0)}
                      </View>
                    </View>
                    <Text style={styles.reviewText}>
                      {review.comment || "Tidak ada komentar."}
                    </Text>
                  </View>
                ))
            ) : (
              <Text style={styles.noReviewsText}>
                Belum ada ulasan lain untuk tempat ini.
              </Text>
            )}
            {placeData.reviews && placeData.reviews.length > 2 && (
              <TouchableOpacity
                style={styles.seeAllReviewsButton}
                onPress={handleSeeAllReviews}
              >
                <Text style={styles.seeAllReviewsText}>
                  Lihat Semua {placeData.review_count} Ulasan
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showRatingModal}
        onRequestClose={closeRatingModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={closeRatingModal}
        >
          <Animated.View
            style={[
              styles.ratingModalContent,
              { transform: [{ translateY: panY }] },
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            <View
              onStartShouldSetResponder={() => true}
              style={{ width: "100%", alignItems: "center" }}
            >
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>
                {selectedReviewForEdit
                  ? "Edit Ulasan Anda"
                  : "Bagaimana Tempatnya?"}
              </Text>
              <Text style={styles.modalSubtitle}>
                (1 Mengecewakan, 5 Luar Biasa!)
              </Text>
              <View style={styles.modalStarContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarPress(star)}
                  >
                    <Ionicons
                      name={star <= userRating ? "star" : "star-outline"}
                      size={40}
                      color={star <= userRating ? "#FFD700" : "#ccc"}
                      style={styles.modalStar}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder="Bagaimana menurutmu?"
                multiline
                numberOfLines={4}
                value={userComment}
                onChangeText={setUserComment}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={
                  selectedReviewForEdit ? handleEditReview : handleAddReview
                }
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading
                    ? "Mengirim..."
                    : selectedReviewForEdit
                    ? "Perbarui Ulasan"
                    : "Kirim Ulasan"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  headerButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
  },
  mainImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  content: {
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 20,
    minHeight: 500,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 15,
    marginTop: -40,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  placeName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  ratingAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginLeft: 5,
  },
  reviewCount: {
    fontSize: 14,
    color: "#888",
    marginLeft: 5,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginTop: 5,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
    flexShrink: 1,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 15,
    marginHorizontal: 10,
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 15,
  },
  detailText: {
    fontSize: 16,
    color: "#555",
  },
  howRatingSubtitleLeft: {
    fontSize: 14,
    color: "#888",
    textAlign: "left",
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewItem: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 15,
    marginTop: 15,
  },
  reviewAuthorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#eee",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  reviewDate: {
    fontSize: 12,
    color: "#888",
  },
  reviewText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginTop: 5,
  },
  noReviewsText: {
    textAlign: "center",
    color: "#888",
    fontSize: 15,
    paddingVertical: 20,
  },
  seeAllReviewsButton: {
    marginTop: 15,
    alignItems: "center",
    padding: 10,
  },
  seeAllReviewsText: {
    color: "#FF8A00",
    fontSize: 16,
    fontWeight: "bold",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  ratingModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  modalHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
  },
  modalStarContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalStar: {
    marginHorizontal: 8,
  },
  commentInput: {
    width: "100%",
    minHeight: 100,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#FF8A00",
    borderRadius: 10,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  rateNowButton: {
    backgroundColor: "#FF8A00",
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  rateNowButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  yourReviewContainer: {},
  optionsButton: {
    padding: 5,
  },
  optionsMenu: {
    position: "absolute",
    top: 35,
    right: 5,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  optionMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionMenuText: {
    fontSize: 16,
    color: "#333",
  },
  optionMenuTextDelete: {
    color: "red",
  },
  reviewAuthorDetails: {
    flex: 1,
  },
});

export default DetailTempatScreen;
