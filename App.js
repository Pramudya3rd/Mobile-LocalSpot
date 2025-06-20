// App.js
import React, { useState, useEffect } from "react"; // <-- 1. Import useState dan useEffect
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

// Import Semua Screen Anda
import SplashScreen from "./src/screens/SplashScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import OTPScreen from "./src/screens/OTPScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";
import DetailTempatScreen from "./src/screens/DetailTempat";
import AllReviewsScreen from "./src/screens/AllReviewsScreen";
import AppNavigator from "./src/navigation/AppNavigator";
import AddPlaceScreen from "./src/screens/AddPlaceScreen";
import MyReviewScreen from "./src/screens/MyReviewScreen";
import AboutAppScreen from "./src/screens/AboutAppScreen";
import MyAddedPlacesScreen from "./src/screens/MyAddedPlacesScreen";
import ManageMyPlaceScreen from "./src/screens/ManageMyPlaceScreen";
import InformasiPribadiScreen from "./src/screens/InformasiPribadiScreen";
import FavoriteScreen from "./src/screens/FavoriteScreen";
import EditPlaceScreen from "./src/screens/EditPlaceScreen";

const Stack = createStackNavigator();

const AppRootNavigator = () => {
  // Ambil state dari AuthContext. Kita ganti nama 'isLoading' menjadi 'isAuthLoading' agar tidak bentrok.
  const { user, isLoading: isAuthLoading } = useAuth();

  // =================================================================
  // === PERBAIKAN: Tambahkan state untuk timer splash screen       ===
  // =================================================================
  const [isMinTimePassed, setIsMinTimePassed] = useState(false);

  useEffect(() => {
    // Jalankan timer selama 3 detik
    const timer = setTimeout(() => {
      setIsMinTimePassed(true);
    }, 3000); // 3000 milidetik = 3 detik

    // Cleanup function untuk membersihkan timer jika komponen unmount
    return () => clearTimeout(timer);
  }, []); // Array kosong berarti efek ini hanya berjalan sekali saat komponen mount

  // =================================================================
  // === PERBAIKAN: Ubah kondisi untuk menampilkan SplashScreen     ===
  // =================================================================
  // Tampilkan SplashScreen jika pengecekan auth BELUM selesai ATAU timer 3 detik BELUM selesai.
  if (!isMinTimePassed || isAuthLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // --- JIKA PENGGUNA SUDAH LOGIN (atau sebagai Tamu) ---
        <>
          <Stack.Screen name="MainAppTabs" component={AppNavigator} />
          <Stack.Screen name="DetailTempat" component={DetailTempatScreen} />
          <Stack.Screen name="AllReviews" component={AllReviewsScreen} />
          <Stack.Screen name="AddPlace" component={AddPlaceScreen} />
          <Stack.Screen name="AboutApp" component={AboutAppScreen} />
          <Stack.Screen name="MyReviews" component={MyReviewScreen} />
          <Stack.Screen name="MyAddedPlaces" component={MyAddedPlacesScreen} />
          <Stack.Screen name="ManageMyPlace" component={ManageMyPlaceScreen} />
          <Stack.Screen name="EditPlaceScreen" component={EditPlaceScreen} />
          <Stack.Screen
            name="InformasiPribadi"
            component={InformasiPribadiScreen}
          />
          <Stack.Screen name="FavoriteList" component={FavoriteScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="OTPScreen" component={OTPScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        // --- JIKA PENGGUNA BELUM LOGIN ---
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ animationEnabled: false }}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="OTPScreen" component={OTPScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#ffffff"
            translucent={false}
          />
          <AppRootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
