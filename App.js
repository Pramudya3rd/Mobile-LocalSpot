// App.js
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// --- IMPORT INI ---
import { GestureHandlerRootView } from "react-native-gesture-handler"; // Import GestureHandlerRootView

import SplashScreen from "./src/screens/SplashScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000));
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
    // --- BUNGKUS SELURUH APLIKASI DENGAN GestureHandlerRootView ---
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          {/* Tambahkan layar 'Register' di sini jika Anda membuatnya */}
          {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
    // --- AKHIR PEMBUNGKUSAN ---
  );
}
