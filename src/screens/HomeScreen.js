// screens/HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";

import AppHeader from "../components/AppHeader";
import SearchBar from "../components/SearchBar";
import PromoBanner from "../components/PromoBanner";
import SectionHeader from "../components/SectionHeader";
import CategoryCard from "../components/CategoryCard";
import FavoriteCard from "../components/FavoriteCard";

const API_BASE_URL = "http://10.0.2.2:8000/api";

const HomeScreen = () => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [favoritesData, setFavoritesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const json = await response.json();
      if (response.ok) {
        const transformedCategories = json.map((cat) => ({
          id: cat.id.toString(),
          title: cat.name,
          icon: { uri: cat.icon_url || "https://via.placeholder.com/40" },
        }));
        setCategoriesData(transformedCategories);
      } else {
        setError(
          "Gagal memuat kategori: " +
            (json.message || `Status ${response.status}`)
        );
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(
        "Error jaringan saat memuat kategori. Pastikan backend berjalan & IP benar."
      );
    }
  };

  const fetchPlaces = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/places`);
      const json = await response.json();

      if (response.ok) {
        const transformedFavorites = json
          .filter((place) => {
            // --- PERBAIKAN UTAMA 1: Konversi reviews_avg_rating ke angka yang aman untuk filter ---
            const avgRating = parseFloat(place.reviews_avg_rating);
            // Gunakan isNaN untuk menangani kasus string kosong, null, atau tidak dapat di-parse
            return (isNaN(avgRating) ? 0 : avgRating) >= 4.0;
          })
          .map((place) => ({
            id: place.id.toString(),
            title: place.name,
            // --- PERBAIKAN UTAMA 2: Konversi reviews_avg_rating ke angka yang aman untuk display ---
            rating: (() => {
              const avgRating = parseFloat(place.reviews_avg_rating);
              // Jika bukan angka valid, kembalikan "N/A", jika tidak, format
              return isNaN(avgRating) ? "N/A" : avgRating.toFixed(1);
            })(),
            distance: place.distance
              ? `${place.distance.toFixed(1)} km`
              : "N/A",
            image: {
              uri: place.main_image_url || "https://via.placeholder.com/120",
            },
          }));
        setFavoritesData(transformedFavorites);
      } else {
        setError(
          "Gagal memuat tempat: " +
            (json.message || `Status ${response.status}`)
        );
      }
    } catch (err) {
      console.error("Error fetching places:", err);
      setError(
        "Error jaringan saat memuat tempat. Pastikan backend berjalan & IP benar."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchCategories();
    fetchPlaces();
  }, []);

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
          onPress={() => {
            setIsLoading(true);
            setError(null);
            fetchCategories();
            fetchPlaces();
          }}
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
