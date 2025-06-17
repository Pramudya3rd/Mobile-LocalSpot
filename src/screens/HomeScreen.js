// screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from "react"; // Tambahkan useCallback
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert, // Tambahkan Alert untuk notifikasi user
} from "react-native";

import AppHeader from "../components/AppHeader";
import SearchBar from "../components/SearchBar";
import PromoBanner from "../components/PromoBanner";
import SectionHeader from "../components/SectionHeader";
import CategoryCard from "../components/CategoryCard";
import FavoriteCard from "../components/FavoriteCard";

// Pastikan IP ini adalah IP lokal komputer Anda tempat Laravel backend berjalan.
// Untuk emulator Android, 10.0.2.2 mengarah ke localhost mesin host Anda.
// Jika menggunakan perangkat fisik, ganti dengan IP lokal Anda, misal 'http://192.168.1.xxx:8000/api'
const API_BASE_URL = "http://10.0.2.2:8000/api";

const HomeScreen = () => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [favoritesData, setFavoritesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Menggunakan useCallback untuk mencegah re-render fungsi yang tidak perlu
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const json = await response.json();

      if (response.ok) {
        // Data kategori dari backend Anda (CategoryController@index)
        // seharusnya sudah memiliki `icon_url` berkat accessor di Category model.
        const transformedCategories = json.map((cat) => ({
          id: cat.id.toString(),
          title: cat.name,
          icon: { uri: cat.icon_url || "https://via.placeholder.com/40" }, // icon_url seharusnya sudah tersedia
        }));
        setCategoriesData(transformedCategories);
      } else {
        // Penanganan error dari response API (misal status 500 atau 4xx)
        const errorMessage = json.message || `Status ${response.status}`;
        throw new Error("Gagal memuat kategori: " + errorMessage);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(
        "Error jaringan saat memuat kategori. Pastikan backend berjalan & IP benar. Detail: " +
          err.message
      );
      // Anda bisa menampilkan Alert di sini jika mau langsung memberi tahu user
      // Alert.alert("Error", "Gagal memuat kategori. Coba lagi nanti.");
    }
  }, []); // Dependensi kosong karena tidak ada props/state yang digunakan di dalamnya

  const fetchPlaces = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/places`);
      const json = await response.json();

      if (response.ok) {
        // Data tempat dari backend Anda (PlaceController@index)
        // seharusnya sudah memiliki `main_image_url` berkat accessor di Place model.
        const transformedFavorites = json
          .filter((place) => {
            // PERBAIKAN UTAMA 1: Pastikan reviews_avg_rating diparse dengan aman
            // Backend seharusnya sudah memberikan ini sebagai float/double, tapi parsing lagi tidak ada salahnya
            const avgRating = parseFloat(place.reviews_avg_rating);
            // Jika bukan angka valid, perlakukan sebagai 0 untuk filtering.
            // Rating 4.0 harusnya sudah dihitung oleh backend
            return (isNaN(avgRating) ? 0 : avgRating) >= 4.0;
          })
          .map((place) => ({
            id: place.id.toString(),
            title: place.name,
            // PERBAIKAN UTAMA 2: Konversi reviews_avg_rating ke angka yang aman untuk display
            rating: (() => {
              const avgRating = parseFloat(place.reviews_avg_rating);
              // Jika bukan angka valid, kembalikan "N/A", jika tidak, format
              return isNaN(avgRating) ? "N/A" : avgRating.toFixed(1);
            })(),
            distance: place.distance
              ? `${place.distance.toFixed(1)} km`
              : "N/A",
            // main_image_url seharusnya sudah URL lengkap dari backend
            image: {
              uri: place.main_image_url || "https://via.placeholder.com/120",
            },
          }));
        setFavoritesData(transformedFavorites);
      } else {
        // Penanganan error dari response API
        const errorMessage = json.message || `Status ${response.status}`;
        throw new Error("Gagal memuat tempat: " + errorMessage);
      }
    } catch (err) {
      console.error("Error fetching places:", err);
      setError(
        "Error jaringan saat memuat tempat. Pastikan backend berjalan & IP benar. Detail: " +
          err.message
      );
      // Alert.alert("Error", "Gagal memuat tempat. Coba lagi nanti.");
    } finally {
      // Pastikan isLoading diatur ke false setelah kedua fetch selesai
      // Ini bisa ditangani dengan Promise.all jika urutan fetch tidak penting
    }
  }, []); // Dependensi kosong

  // Menggunakan Promise.all untuk menjalankan fetchCategories dan fetchPlaces secara paralel
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchCategories(), fetchPlaces()]);
    } catch (err) {
      // Error sudah ditangani di masing-masing fetch function,
      // tapi ini bisa menangkap error jika Promise.all gagal secara keseluruhan
      console.error("Failed to fetch all data:", err);
      // setError(err.message); // Atau biarkan error dari masing-masing fetch yang terekam
    } finally {
      setIsLoading(false);
    }
  }, [fetchCategories, fetchPlaces]); // Tambahkan fetchCategories dan fetchPlaces sebagai dependensi

  useEffect(() => {
    fetchData(); // Panggil fungsi fetchData yang baru
  }, [fetchData]); // Hanya panggil sekali saat komponen dimuat

  const renderCategoryItem = ({ item }) => <CategoryCard item={item} />;
  const renderFavoriteItem = ({ item }) => <FavoriteCard item={item} />;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A2BE2" />
        <Text>Memuat data dari server...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Terjadi Kesalahan: {error}</Text>
        <TouchableOpacity
          onPress={fetchData} // Panggil fetchData untuk coba lagi
        >
          <Text style={styles.retryButton}>Coba Lagi</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader />
        <SearchBar />
        <PromoBanner />

        <SectionHeader title="Jelajahi Berdasarkan Kategori" />
        <FlatList
          data={categoriesData}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />

        <SectionHeader title="Terfavorit di Sekitarmu" />
        <FlatList
          data={favoritesData}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />

        {/* --- BAGIAN REKOMENDASI --- */}
        <SectionHeader title="Rekomendasi Buat Kamu" />
        <View style={styles.recommendationPlaceholder}>
          <Text>Konten rekomendasi akan datang!</Text>
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
  flatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  recommendationPlaceholder: {
    height: 150,
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderColor: "#e0e0e0",
    borderWidth: 1,
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
});

export default HomeScreen;
