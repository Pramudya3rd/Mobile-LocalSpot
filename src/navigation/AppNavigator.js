// src/navigation/AppNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; 

// Import Screens yang akan menjadi tab
import HomeScreen from "../screens/HomeScreen";
import AddScreen from "../screens/AddPlaceScreen";
import ProfileScreen from "../screens/ProfileScreen";

// --- Import Icon Kustom Anda ---
const HomeIconActive = require("../../assets/icons/beranda_aktif.png");
const HomeIconInactive = require("../../assets/icons/beranda_tidak_aktif.png");
const AddIconActive = require("../../assets/icons/tambah_aktif.png");
const AddIconInactive = require("../../assets/icons/tambah_tidak_aktif.png");
const ProfileIconActive = require("../../assets/icons/profil_aktif.png");
const ProfileIconInactive = require("../../assets/icons/profil_tidak_aktif.png");

const Tab = createBottomTabNavigator();

// Ini adalah komponen Tab Navigator Anda
const AppNavigator = () => { // Nama AppNavigator di sini adalah Tab Navigator
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;
          if (route.name === "Beranda") {
            iconSource = focused ? HomeIconActive : HomeIconInactive;
          } else if (route.name === "Tambah") {
            iconSource = focused ? AddIconActive : AddIconInactive;
          } else if (route.name === "Profile") {
            iconSource = focused ? ProfileIconActive : ProfileIconInactive;
          }
          return (
            <Image
              source={iconSource}
              style={styles.tabIcon}
            />
          );
        },
        tabBarActiveTintColor: "#FF8A00",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: 5 + insets.bottom,
          backgroundColor: '#ffffff',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Tambah" component={AddScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});

export default AppNavigator;