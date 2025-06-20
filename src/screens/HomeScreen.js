// HomeScreen.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";

// Import helper dan komponen Anda
import apiFetch from "../services/api";
import AppHeader from "../components/AppHeader";
import SearchBar from "../components/SearchBar"; // Pastikan SearchBar telah diperbarui
import PromoBanner from "../components/PromoBanner";
import SectionHeader from "../components/SectionHeader";
import CategoryCard from "../components/CategoryCard"; // Pastikan CategoryCard telah diperbarui
import FavoriteCard from "../components/FavoriteCard";
import RecommendationCard from "../components/RecommendationCard";

const HomeScreen = ({ navigation }) => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [favoritesData, setFavoritesData] = useState([]);
  const [recommendationsData, setRecommendationsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [error, setError] = useState(null);

  const [userAddress, setUserAddress] = useState(
    "Ketuk ikon untuk mencari lokasi"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
  const [currentUserCoords, setCurrentUserCoords] = useState(null);

  const searchDebounceTimer = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Bersihkan timer sebelumnya jika ada
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }

    // Set timer baru untuk memicu pencarian setelah 500ms
    searchDebounceTimer.current = setTimeout(() => {
      console.log(
        "Memicu fetchHomeSections karena search/filter/lokasi berubah..."
      );
      if (
        recommendationsData.length === 0 ||
        searchQuery !== "" ||
        selectedCategoryFilter !== null
      ) {
        setIsLoading(true);
      }
      setError(null);
      fetchHomeSections(
        currentUserCoords,
        searchQuery,
        selectedCategoryFilter
      ).finally(() => setIsLoading(false));
    }, 500);

    // Cleanup function: Hapus timer jika komponen di-unmount atau dependensi berubah
    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, [searchQuery, selectedCategoryFilter, currentUserCoords]);

  useFocusEffect(
    useCallback(() => {
      console.log(
        "Layar fokus, memicu fetchHomeSections untuk data awal/refresh..."
      );
      setIsLoading(true);
      setError(null);
      fetchHomeSections(
        currentUserCoords,
        searchQuery,
        selectedCategoryFilter
      ).finally(() => setIsLoading(false));

      return () => {
        // Opsional: cleanup jika diperlukan saat layar kehilangan fokus
      };
    }, [])
  );

  const handleRefreshWithLocation = async () => {
    console.log("Memulai proses refresh lokasi dan jarak...");
    setIsRefreshingLocation(true);
    setError(null);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Izin lokasi ditolak. Fitur jarak tidak dapat digunakan.");
      setIsRefreshingLocation(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = location.coords;
      setCurrentUserCoords(coords);
      console.log("Koordinat didapat:", coords);

      try {
        let geocode = await Location.reverseGeocodeAsync(coords);
        if (geocode && geocode.length > 0) {
          const firstResult = geocode[0];
          const addressString = `${firstResult.street || ""}, ${
            firstResult.subregion || ""
          }`;
          setUserAddress(addressString);
          console.log("Alamat ditemukan:", addressString);
        } else {
          setUserAddress("Alamat tidak dapat ditemukan");
        }
      } catch (geocodeError) {
        console.error("Gagal melakukan reverse geocode:", geocodeError);
        setUserAddress("Alamat tidak ditemukan");
      }
    } catch (locationError) {
      setError(`Gagal mendapatkan lokasi: ${locationError.message}`);
      setUserAddress("Gagal mendapatkan lokasi");
    } finally {
      setIsRefreshingLocation(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiFetch("/categories");
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const json = await response.json();
      if (json.categories) {
        const transformedCategories = json.categories.map((cat) => ({
          id: cat.id.toString(),
          title: cat.name,
          icon: { uri: cat.icon_url || "https://via.placeholder.com/40" },
        }));
        setCategoriesData(transformedCategories);
      } else {
        throw new Error("Format respons kategori tidak valid.");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError((prevError) =>
        prevError
          ? `${prevError}\n- Gagal memuat kategori.`
          : "Gagal memuat kategori."
      );
    }
  };

  const fetchHomeSections = async (
    userCoords,
    currentSearchQuery,
    currentSelectedCategoryFilter
  ) => {
    try {
      let apiUrl = "/places?";
      const params = [];

      if (userCoords) {
        params.push(`latitude=${userCoords.latitude}`);
        params.push(`longitude=${userCoords.longitude}`);
      }

      if (currentSearchQuery) {
        params.push(
          `search_query=${encodeURIComponent(currentSearchQuery.trim())}`
        );
      }

      if (currentSelectedCategoryFilter) {
        params.push(`category_id=${currentSelectedCategoryFilter}`);
      }

      apiUrl += params.join("&");

      console.log(`[API CALL] Memanggil API: ${apiUrl}`);

      const response = await apiFetch(apiUrl);
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const json = await response.json();

      console.log(
        "[API RESPONSE] Respons JSON dari server (setelah filter):",
        JSON.stringify(json, null, 2)
      );

      if (json.places) {
        const transformedPlaces = json.places.map((place) => ({
          id: place.id.toString(),
          title: place.name,
          rating: parseFloat(place.average_rating)
            ? parseFloat(place.average_rating).toFixed(1)
            : "N/A",
          distance:
            place.distance !== null && place.distance !== undefined
              ? `${parseFloat(place.distance).toFixed(1)} km`
              : "N/A",
          image: {
            uri: place.main_image_url || "https://via.placeholder.com/150",
          },
        }));

        const favoritePlaces = transformedPlaces
          .filter((p) => parseFloat(p.rating) >= 4.0)
          .slice(0, 10);
        setFavoritesData(favoritePlaces);
        setRecommendationsData(transformedPlaces);
      } else {
        throw new Error("Format respons tempat tidak valid.");
      }
    } catch (err) {
      console.error("Error fetching places (with filter):", err);
      setError((prevError) =>
        prevError
          ? `${prevError}\n- Gagal memuat tempat dengan filter.`
          : "Gagal memuat tempat dengan filter."
      );
      throw err;
    }
  };

  const handleCategoryPress = (categoryId) => {
    if (selectedCategoryFilter === categoryId) {
      setSelectedCategoryFilter(null);
    } else {
      setSelectedCategoryFilter(categoryId);
    }
    setSearchQuery("");
  };

  const renderCategoryItem = ({ item }) => (
    <CategoryCard
      item={item}
      navigation={navigation}
      onPress={() => handleCategoryPress(item.id)}
      isSelected={selectedCategoryFilter === item.id}
    />
  );
  const renderFavoriteItem = ({ item }) => (
    <FavoriteCard item={item} navigation={navigation} />
  );
  const renderRecommendationItem = ({ item }) => (
    <RecommendationCard item={item} navigation={navigation} />
  );

  if (isLoading && recommendationsData.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8A00" />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !categoriesData.length && !recommendationsData.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={async () => {
              setIsLoading(true);
              setError(null);
              await fetchCategories();
              await fetchHomeSections(
                currentUserCoords,
                searchQuery,
                selectedCategoryFilter
              );
              setIsLoading(false);
            }}
          >
            <Text style={styles.retryButton}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AppHeader
          navigation={navigation}
          onPressLocation={handleRefreshWithLocation}
          isRefreshingLocation={isRefreshingLocation}
          address={userAddress}
        />
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <PromoBanner />

        {/* Bagian yang diperbaiki/ditambahkan: Indikator loading kecil */}
        {isLoading && recommendationsData.length > 0 && (
          <ActivityIndicator
            size="small"
            color="#FF8A00"
            style={{ marginVertical: 10 }}
          />
        )}
        {error && <Text style={styles.partialErrorText}>{error}</Text>}

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
          contentContainerStyle={styles.horizontalFlatListContent}
        />

        <SectionHeader title="Rekomendasi Buat Kamu" />
        <FlatList
          data={recommendationsData}
          renderItem={renderRecommendationItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.recommendationGrid}
          columnWrapperStyle={styles.singleColumnAlignLeft}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  horizontalFlatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  recommendationGrid: {
    paddingVertical: 10,
    marginBottom: 20,
  },
  singleColumnAlignLeft: {
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  partialErrorText: {
    color: "#D8000C",
    fontSize: 14,
    textAlign: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#FFD2D2",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8000C",
  },
  retryButton: {
    color: "#8A2BE2",
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#8A2BE2",
  },
});

export default HomeScreen;
