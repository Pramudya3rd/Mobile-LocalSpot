// App.js
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native"; // View diimpor tapi tidak dipakai, bisa dihapus kalau tidak perlu

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import semua Screens Anda
import SplashScreen from "./src/screens/SplashScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
// HomeScreen tidak lagi langsung di Stack.Screen karena akan ada di dalam AppNavigator
// import HomeScreen from "./src/screens/HomeScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import OTPScreen from "./src/screens/OTPScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";
// PlaceCard, ReviewCard, FeatureButton adalah komponen, bukan screen navigasi
// import PlaceCard from "./src/components/PlaceCard";
// import ReviewCard from "./src/components/ReviewCard";
// import FeatureButton from "./src/components/FeatureButton";
import PlaceDetailScreen from "./src/screens/PlaceDetailScreen";

// Import AppNavigator Anda (ini adalah Bottom Tab Navigator)
import AppNavigator from "./src/navigation/AppNavigator";

const Stack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Simulasikan waktu loading (misalnya untuk memuat aset, cek token, dll.)
        await new Promise((resolve) => setTimeout(resolve, 3000));
        // Di sini Anda bisa menambahkan logika untuk mengecek apakah pengguna sudah login
        // Jika sudah login, set initialRouteName ke 'MainAppTabs' (AppNavigator)
        // Jika belum, biarkan di 'Welcome'
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepareApp();
  }, []);

  if (!appIsReady) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Welcome" // Atau 'MainAppTabs' jika pengguna sudah login
        screenOptions={{ headerShown: false }} // Menyembunyikan header untuk semua screen di Stack ini
      >
        {/* Screens untuk Alur Autentikasi */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OTPScreen" component={OTPScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

        {/* Screen untuk Main App Tabs (AppNavigator) */}
        {/* Ketika pengguna masuk ke "MainAppTabs", maka Bottom Tab Navigator akan muncul */}
        <Stack.Screen name="MainAppTabs" component={AppNavigator} />

        {/* Screens yang mungkin diakses DARI DALAM tab (misal: PlaceDetail dari HomeScreen) */}
        {/* PlaceDetailScreen tetap di Stack utama agar bisa diakses dari mana saja (misal: dari HomeScreen yang ada di dalam MainAppTabs) */}
        <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />

        {/* HomeScreen dihapus dari sini karena sekarang menjadi bagian dari AppNavigator (Bottom Tabs) */}
        {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
      </Stack.Navigator>
      {/* <AppNavigator /> <-- INI HARUS DIHAPUS karena sudah di nesting di atas */}
    </NavigationContainer>
  );
}
