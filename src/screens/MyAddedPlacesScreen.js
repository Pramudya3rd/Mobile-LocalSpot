// src/screens/MyAddedPlacesScreen.js
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext"; // 1. Import hook useAuth

import RecommendationCard from "../components/RecommendationCard";

const API_BASE_URL = "https://localspot.hafidzirham.com/api";

const MyAddedPlacesScreen = () => {
  const navigation = useNavigation();
  const { user, token, logout } = useAuth(); // 2. Gunakan user dan token dari context

  const [myPlaces, setMyPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Gunakan useFocusEffect untuk refresh data saat layar ditampilkan
  useFocusEffect(
    React.useCallback(() => {
      // Hanya fetch data jika user sudah login (bukan tamu)
      if (user && !user.isGuest) {
        fetchMyPlaces();
      } else {
        setIsLoading(false); // Hentikan loading jika user tamu/null
      }
    }, [user]) // Dependensi pada 'user'
  );

  const fetchMyPlaces = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 4. Panggil endpoint BARU yang lebih efisien
      const response = await fetch(`${API_BASE_URL}/my-added-places`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`, // Sertakan token
        },
      });
      const data = await response.json();

      if (response.ok) {
        // 5. TIDAK PERLU FILTER LAGI! Backend sudah memberikan data yang benar.
        const transformedPlaces = data.map((place) => ({
          id: place.id.toString(),
          title: place.name,
          rating: parseFloat(place.average_rating || "0").toFixed(1),
          // Anda bisa menambahkan kalkulasi jarak di sini jika diperlukan
          distance: "N/A",
          image: {
            uri: place.main_image_url || "https://via.placeholder.com/120",
          },
        }));
        setMyPlaces(transformedPlaces);
      } else {
        setError(data.message || `Gagal memuat tempat.`);
      }
    } catch (err) {
      console.error("Error fetching my places:", err);
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardPress = (placeItem) => {
    navigation.navigate("ManageMyPlace", { placeId: placeItem.id });
  };

  // 6. Tambahkan "Penjaga Gerbang" untuk pengguna tamu
  if (!user || user.isGuest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tempat Tambahan Saya</Text>
          <View style={styles.rightPlaceholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            Fitur ini hanya untuk pengguna terdaftar.
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={logout}>
            <Text style={styles.loginButtonText}>Login atau Daftar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="large"
          color="#8A2BE2"
          style={{ marginTop: 50 }}
        />
      );
    }
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }
    if (myPlaces.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Anda belum menambahkan tempat.</Text>
          <Text style={styles.emptySubText}>
            Bagikan tempat favorit Anda dengan komunitas!
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        data={myPlaces}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleCardPress(item)}
            style={styles.cardWrapper}
          >
            <RecommendationCard item={item} />
            {/* Tambahkan icon edit di pojok kanan atas card */}
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() =>
                navigation.navigate("EditPlaceScreen", { placeId: item.id })
              }
            >
              <Ionicons name="create-outline" size={22} color="#FF8A00" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.columnWrapper}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tempat Tambahan Saya</Text>
        <View style={styles.rightPlaceholder} />
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
  backButton: { width: 24, justifyContent: "center", alignItems: "flex-start" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  rightPlaceholder: { width: 24 },
  gridContainer: { paddingHorizontal: 8, paddingVertical: 10 },
  columnWrapper: { justifyContent: "space-between" },
  cardWrapper: { flex: 0.5, marginHorizontal: 8, marginBottom: 16 },
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
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    /* Anda bisa menambahkan style untuk ini jika mau */
  },
  retryButtonText: { color: "#8A2BE2", fontSize: 16, fontWeight: "bold" },
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
    marginTop: 10,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
  },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  editIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    zIndex: 10,
  },
});

export default MyAddedPlacesScreen;
