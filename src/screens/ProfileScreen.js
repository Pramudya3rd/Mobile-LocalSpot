// src/screens/ProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- Komponen Pembantu (BottomTabButton, DIHILANGKAN DARI SINI) ---
// Hapus semua kode BottomTabButton di sini jika ada
// --- Akhir Komponen Pembantu ---

export default function ProfileScreen() {
  const navigation = useNavigation();

  const [profileData, setProfileData] = useState({
    name: "Hafidz Irham A.",
    email: "youremail@domain.com",
    phone: "08123456789",
    profilePic:
      "https://images.unsplash.com/photo-1534528736697-5ae52796e949?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    notificationStatus: "Aktif",
    appLanguage: "Bahasa Indonesia",
  });

  // --- HAPUS STATE INI ---
  // const [activeTab, setActiveTab] = useState('Profile');

  useEffect(() => {
    const loadProfile = async () => {
      // ... (kode untuk memuat profil dari AsyncStorage/API, jika ada) ...
    };
    loadProfile();
  }, []);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace("Home");
    }
  };

  const handleEditProfilePic = () => {
    Alert.alert("Edit Foto Profil", "Fitur edit foto profil akan datang.");
  };

  const handleNavigateTo = (screenName) => {
    if (screenName === "AddPlace") {
      navigation.navigate(screenName);
    } else {
      Alert.alert("Navigasi", `Menuju ${screenName}`);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Apakah Anda yakin ingin logout?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await AsyncStorage.removeItem("userToken");
            navigation.replace("Login");
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  // --- HAPUS FUNGSI INI ---
  // const handleTabPress = (tabName) => {
  //   setActiveTab(tabName);
  //   if (tabName === 'Beranda') {
  //     navigation.navigate('Home');
  //   } else if (tabName === 'Tambah') {
  //     navigation.navigate('AddPlace');
  //   } else if (tabName === 'Profile') {
  //     // Sudah di ProfileScreen, tidak perlu navigasi
  //   }
  // };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header Halaman */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Bagian Foto Profil dan Info */}
        <View style={styles.profileSection}>
          <View style={styles.profilePicContainer}>
            <Image
              source={{ uri: profileData.profilePic }}
              style={styles.profilePic}
            />
            <TouchableOpacity
              style={styles.editIcon}
              onPress={handleEditProfilePic}
            >
              <Ionicons name="pencil-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{profileData.name}</Text>
          <Text style={styles.profileContact}>
            {profileData.email} | {profileData.phone}
          </Text>
        </View>

        {/* Daftar Opsi Profil */}
        <View style={styles.optionsList}>
          {/* Informasi Pribadi */}
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => handleNavigateTo("Informasi Pribadi")}
          >
            <Ionicons name="document-text-outline" size={24} color="#555" />
            <Text style={styles.optionText}>Informasi Pribadi</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#999"
              style={styles.optionArrow}
            />
          </TouchableOpacity>

          {/* Notifikasi */}
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => handleNavigateTo("Notifikasi")}
          >
            <Ionicons name="notifications-outline" size={24} color="#555" />
            <Text style={styles.optionText}>Notifikasi</Text>
            <Text style={styles.optionValue}>
              {profileData.notificationStatus}
            </Text>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#999"
              style={styles.optionArrow}
            />
          </TouchableOpacity>

          {/* Bahasa Aplikasi */}
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => handleNavigateTo("Bahasa")}
          >
            <Ionicons name="language-outline" size={24} color="#555" />
            <Text style={styles.optionText}>Bahasa Aplikasi</Text>
            <Text style={styles.optionValue}>{profileData.appLanguage}</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#999"
              style={styles.optionArrow}
            />
          </TouchableOpacity>

          {/* Tambahkan Tempat Saya */}
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => handleNavigateTo("AddPlace")}
          >
            <Ionicons name="location-outline" size={24} color="#555" />
            <Text style={styles.optionText}>Tambahkan Tempat Saya</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#999"
              style={styles.optionArrow}
            />
          </TouchableOpacity>

          {/* Ulasan Saya */}
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => handleNavigateTo("Ulasan Saya")}
          >
            <Ionicons name="star-outline" size={24} color="#555" />
            <Text style={styles.optionText}>Ulasan Saya</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#999"
              style={styles.optionArrow}
            />
          </TouchableOpacity>
        </View>

        {/* Tombol Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation Bar (DIHILANGKAN DARI SINI) */}
      {/* Hapus seluruh View untuk bottomNavBar jika ada */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 20,
  },
  scrollViewContent: {
    paddingBottom: 90,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  profilePicContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  profilePic: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF8C69",
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: "white",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  profileContact: {
    fontSize: 14,
    color: "gray",
  },
  optionsList: {
    backgroundColor: "white",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
    flex: 1,
  },
  optionValue: {
    fontSize: 14,
    color: "#FF8C69",
    marginRight: 10,
  },
  optionArrow: {
    marginLeft: 5,
  },
  logoutButton: {
    backgroundColor: "#FF3030",
    borderRadius: 10,
    paddingVertical: 15,
    marginHorizontal: 20,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  // --- HAPUS STYLE INI ---
  // bottomNavBar: { ... },
  // bottomTabButton: { ... },
  // bottomTabButtonText: { ... },
});
