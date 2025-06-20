// src/components/AppHeader.js
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 1. Ubah props untuk menerima semua data dan fungsi dari HomeScreen
const AppHeader = ({
  navigation,
  address,
  isRefreshingLocation,
  onPressLocation,
}) => {
  // TIDAK ADA LAGI useState dan fungsi fetchAndSetLocation di sini.
  // Semua logika sudah dipindahkan ke HomeScreen.

  return (
    <View style={styles.header}>
      <View style={styles.locationInput}>
        {/* 2. Gunakan onPressLocation yang diterima dari props */}
        <TouchableOpacity
          onPress={onPressLocation} // Panggil fungsi dari HomeScreen
          style={styles.locationIconTouchable}
          disabled={isRefreshingLocation} // Nonaktifkan tombol saat sedang loading
        >
          {/* 3. Tampilkan loading spinner atau ikon berdasarkan prop isRefreshingLocation */}
          {isRefreshingLocation ? (
            <ActivityIndicator size="small" color="#8A2BE2" />
          ) : (
            <Image
              source={require("../../assets/icons/icon-gps.png")}
              style={styles.locationIcon}
            />
          )}
        </TouchableOpacity>

        {/* 4. Tampilkan alamat yang diterima dari props */}
        <Text style={styles.locationText} numberOfLines={1}>
          {address}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.heartButton}
        onPress={() => navigation.navigate("FavoriteList")}
      >
        <Ionicons name="heart" size={24} color="#ff3030" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  locationInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10, // Sedikit lebih tinggi agar pas dengan ActivityIndicator
    marginRight: 10,
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  locationIconTouchable: {
    paddingRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  locationIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  locationText: {
    flex: 1, // Agar teks bisa memendek jika terlalu panjang
    marginLeft: 0,
    fontSize: 14, // Ukuran disesuaikan
    color: "#333",
  },
  heartButton: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    borderColor: "#e0e0e0",
    borderWidth: 2,
    padding: 8, // Padding disesuaikan
    borderRadius: 25,
  },
});

export default AppHeader;
