import React, { useState, useEffect } from "react"; // Impor useState dan useEffect
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native"; // Text dan View mungkin tidak perlu di App.js ini
// tergantung apakah ada konten di App.js langsung
// atau hanya merender screen lain.

// Impor komponen SplashScreen dan WelcomeScreen sebagai default import (tanpa {})
import SplashScreen from "./src/screens/SplashScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";

export default function App() {
  // Atur nilai awal isShowSplash menjadi TRUE agar SplashScreen muncul duluan
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    // Jalankan timer hanya sekali saat komponen di-mount
    setTimeout(() => {
      setIsShowSplash(false); // Sembunyikan splash screen setelah 3 detik
    }, 3000); // Durasi 3 detik
  }, []); // Tambahkan dependency array kosong agar useEffect hanya berjalan sekali

  // Kondisional rendering: Tampilkan SplashScreen jika isShowSplash TRUE, selain itu tampilkan WelcomeScreen
  return isShowSplash ? <SplashScreen /> : <WelcomeScreen />;
}

// Catatan: StyleSheet ini tidak digunakan di App.js yang sekarang, bisa dihapus jika tidak diperlukan
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });
