import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  FlatList,
  Text,
  ActivityIndicator,
  StatusBar,
  Platform,
  TouchableOpacity,
  Alert, // Import Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import RecommendationCard from "../components/RecommendationCard";

const API_BASE_URL = "https://localspot.hafidzirham.com/api";

const FavoriteScreen = () => {
  const navigation = useNavigation();
  const [favoritePlaces, setFavoritePlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const checkAuthAndFetchData = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem("userToken");

        if (!token) {
          // JIKA PENGGUNA BELUM LOGIN
          // =============================================================
          // === PERBAIKAN: JANGAN SET isLoading KE FALSE DI SINI ===
          // Biarkan layar tetap loading di belakang Alert
          // setIsLoading(false); // <-- HAPUS ATAU KOMENTARI BARIS INI
          // =============================================================
          setFavoritePlaces([]);

          Alert.alert(
            "Perlu Login",
            "Anda harus login untuk melihat daftar favorit Anda.",
            [
              {
                text: "Login Sekarang",
                // Pastikan nama screen 'Login' sudah benar sesuai navigator Anda
                onPress: () => navigation.navigate("Login"),
              },
              {
                text: "Batal",
                onPress: () => navigation.goBack(),
                style: "cancel",
              },
            ],
            { cancelable: false }
          );
          // Karena pengguna akan dinavigasikan keluar, kita tidak perlu menghentikan loading
          return; // Hentikan eksekusi fungsi di sini
        }

        // JIKA PENGGUNA SUDAH LOGIN, lanjutkan ambil data
        fetchFavoritePlaces(token);
      };

      checkAuthAndFetchData();
    }, [navigation])
  );

  const fetchFavoritePlaces = async (token) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        const transformedPlaces = data.map((place) => ({
          id: place.id.toString(),
          title: place.name,
          rating: parseFloat(place.average_rating || "0").toFixed(1),
          distance: place.distance ? `${place.distance.toFixed(1)} km` : null,
          image: {
            uri: place.main_image_url || "https://via.placeholder.com/150",
          },
        }));
        setFavoritePlaces(transformedPlaces);
      } else {
        if (response.status === 401) {
          setFavoritePlaces([]);
          AsyncStorage.removeItem("userToken");
          Alert.alert(
            "Sesi Habis",
            "Sesi Anda telah berakhir, silakan login kembali.",
            [{ text: "OK", onPress: () => navigation.navigate("Login") }]
          );
        } else {
          setError(data.message || "Gagal memuat favorit.");
        }
      }
    } catch (err) {
      console.error("Error fetching favorite places:", err);
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardPress = (item) => {
    navigation.navigate("DetailTempat", { placeId: item.id });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8A00" />
          <Text>Memuat daftar favorit...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={async () => {
              const token = await AsyncStorage.getItem("userToken");
              if (token) {
                setIsLoading(true);
                fetchFavoritePlaces(token);
              } else {
                Alert.alert(
                  "Anda Belum Login",
                  "Silakan login terlebih dahulu untuk mencoba lagi."
                );
              }
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (favoritePlaces.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Anda belum punya favorit.</Text>
          <Text style={styles.emptySubText}>
            Tekan ikon hati di halaman detail untuk menambahkan tempat ke
            favorit!
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={favoritePlaces}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <TouchableOpacity onPress={() => handleCardPress(item)}>
              <RecommendationCard item={item} />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerIcon}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorit Saya</Text>
        <View style={styles.headerIcon} />
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerIcon: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  gridContainer: {
    padding: 8,
  },
  cardWrapper: {
    flex: 1 / 2,
    padding: 8,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    paddingHorizontal: 40,
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

export default FavoriteScreen;
