import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location"; // Pastikan ini adalah import yang benar untuk Expo Location

// Catatan Penting: Pastikan TIDAK ADA import lain ke komponen lokal
// dari folder 'src/components' di sini yang bisa menyebabkan siklus.
// Misalnya, JANGAN import SearchBar, PromoBanner, dll. di dalam AppHeader.
// AppHeader ini adalah komponen mandiri yang hanya bergantung pada React Native dan Expo Location.

const AppHeader = () => {
  const [currentLocation, setCurrentLocation] = useState("Rungkut Asri");

  const fetchAndSetLocation = async () => {
    setCurrentLocation("Mendapatkan lokasi...");

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Lokasi Ditolak",
        "Aplikasi memerlukan akses lokasi Anda untuk menampilkan tempat terdekat."
      );
      setCurrentLocation("Izin ditolak");
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      console.log(
        `Koordinat dari emulator/perangkat: Latitude: ${latitude}, Longitude: ${longitude}`
      );

      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

      const response = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "LocalSpotApp/1.0 (pramu.dev@example.com)", // Ganti dengan info aplikasi Anda
        },
      });
      const data = await response.json();

      if (response.ok && data && data.address) {
        const address = data.address;
        let locationName = "Lokasi Tidak Diketahui";

        if (address.road && address.city) {
          locationName = `${address.road}, ${address.city}`;
        } else if (address.city) {
          locationName = address.city;
        } else if (address.village) {
          locationName = address.village;
        } else if (address.town) {
          locationName = address.town;
        } else if (address.county) {
          locationName = address.county;
        } else if (data.display_name) {
          locationName = data.display_name.split(",")[0];
        }

        setCurrentLocation(locationName);
        console.log("Nominatim response:", data);
      } else {
        setCurrentLocation(
          `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`
        );
        Alert.alert(
          "Info Lokasi",
          "Tidak dapat menemukan nama lokasi detail dari Nominatim."
        );
        console.log("Nominatim error or empty response:", data);
      }
    } catch (error) {
      console.log("Error mendapatkan lokasi atau geocoding:", error);
      setCurrentLocation("Gagal mendapatkan lokasi");
      Alert.alert(
        "Error",
        "Tidak dapat mendapatkan lokasi Anda atau melakukan geocoding. Pastikan GPS aktif dan koneksi internet stabil."
      );
    }
  };

  const handleLocationIconPress = () => {
    fetchAndSetLocation();
  };

  return (
    <View style={styles.header}>
      <View style={styles.locationInput}>
        <TouchableOpacity
          onPress={handleLocationIconPress}
          style={styles.locationIconTouchable}
        >
          <Image
            // Pastikan jalur gambar ini benar relative terhadap 'components/AppHeader.js'
            source={require("../../assets/icons/icon-gps.png")}
            style={styles.locationIcon}
          />
        </TouchableOpacity>
        <Text style={styles.locationText}>{currentLocation}</Text>
      </View>
      <TouchableOpacity style={styles.heartButton}>
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
    paddingVertical: 5,
    marginRight: 10,
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  locationIconTouchable: {
    paddingRight: 8,
  },
  locationIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  locationText: {
    marginLeft: 0,
    fontSize: 16,
    color: "#333",
  },
  heartButton: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    borderColor: "#e0e0e0",
    borderWidth: 2,
    padding: 5,
    borderRadius: 25,
  },
});

export default AppHeader;
