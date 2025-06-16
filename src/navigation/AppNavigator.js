// src/navigation/AppNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, StyleSheet } from "react-native"; // Import Image dan StyleSheet dari react-native

// Import Screens yang akan menjadi tab
import HomeScreen from "../screens/HomeScreen";
import AddScreen from "../screens/AddScreen";
import ProfileScreen from "../screens/ProfileScreen";

// --- Import Icon Kustom Anda ---
// Pastikan path (jalur) ke file icon Anda benar relatif terhadap AppNavigator.js
const HomeIconActive = require("../../assets/icons/beranda_aktif.png");
const HomeIconInactive = require("../../assets/icons/beranda_tidak_aktif.png");
const AddIconActive = require("../../assets/icons/tambah_aktif.png");
const AddIconInactive = require("../../assets/icons/tambah_tidak_aktif.png");
const ProfileIconActive = require("../../assets/icons/profil_aktif.png");
const ProfileIconInactive = require("../../assets/icons/profil_tidak_aktif.png");

const Tab = createBottomTabNavigator(); // Buat instance Tab Navigator

const AppNavigator = () => {
  return (
    <Tab.Navigator
      // Konfigurasi umum untuk semua tab
      screenOptions={({ route }) => ({
        // Fungsi ini akan menentukan icon untuk setiap tab
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource; // Variabel untuk menyimpan sumber gambar icon

          // Logika untuk memilih icon aktif atau tidak aktif berdasarkan nama route (tab)
          if (route.name === "Beranda") {
            iconSource = focused ? HomeIconActive : HomeIconInactive;
          } else if (route.name === "Tambah") {
            iconSource = focused ? AddIconActive : AddIconInactive;
          } else if (route.name === "Profile") {
            iconSource = focused ? ProfileIconActive : ProfileIconInactive;
          }

          // Menggunakan komponen Image untuk menampilkan icon kustom
          return (
            <Image
              source={iconSource}
              style={styles.tabIcon} // Aplikasikan style dasar untuk ukuran icon
              // Catatan: Jika icon Anda dari Figma sudah memiliki warna yang tepat
              // untuk aktif/tidak aktif, Anda bisa menghapus `tintColor`.
              // Jika icon Anda hanya satu warna (misal: hitam-putih) dan ingin
              // mengubah warnanya secara programatis, gunakan `tintColor`.
              // Contoh: style={[styles.tabIcon, { tintColor: focused ? '#FF8A00' : 'gray' }]}
            />
          );
        },
        // Warna label dan icon (jika tintColor digunakan) saat tab aktif
        tabBarActiveTintColor: "#FF8A00", // Sesuaikan dengan warna orange di desain Anda
        // Warna label dan icon (jika tintColor digunakan) saat tab tidak aktif
        tabBarInactiveTintColor: "gray", // Warna abu-abu default
        // Gaya untuk container tab bar keseluruhan
        tabBarStyle: {
          height: 60, // Sesuaikan tinggi bottom tab bar
          paddingBottom: 5, // Sedikit padding di bagian bawah untuk penampilan yang lebih baik
        },
        // Gaya untuk teks label di bawah icon
        tabBarLabelStyle: {
          fontSize: 12, // Ukuran font label
          fontWeight: "bold", // Ketebalan font label
        },
        // Sembunyikan header default dari navigator karena Anda sudah punya AppHeader
        headerShown: false,
      })}
    >
      {/* Definisi setiap tab */}
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Tambah" component={AddScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// --- StyleSheet untuk Icon Kustom ---
const styles = StyleSheet.create({
  tabIcon: {
    width: 28, // Sesuaikan ukuran icon Anda (misal: 24, 28, 32)
    height: 28, // Harus sama dengan width agar tidak gepeng
    resizeMode: "contain", // Menjaga rasio aspek icon
  },
});

export default AppNavigator;
