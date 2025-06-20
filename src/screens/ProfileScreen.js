import React, { useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator, // Import ActivityIndicator untuk loading
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker untuk upload
import { useAuth } from "../contexts/AuthContext"; // Import hook useAuth

const ProfileScreen = () => {
  const navigation = useNavigation();

  // Ambil data dan fungsi yang relevan dari AuthContext
  const { user, logout, uploadProfilePhoto } = useAuth();

  // State loading khusus untuk proses upload foto
  const [isUploading, setIsUploading] = useState(false);

  // Fungsi ini sekarang hanya untuk navigasi ke halaman edit info teks
  const handleNavigateToEdit = () => {
    navigation.navigate("InformasiPribadi");
  };

  // Fungsi baru untuk menangani pemilihan dan upload foto profil
  const handlePhotoChange = async () => {
    // 1. Minta izin akses galeri
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Diperlukan",
        "Aplikasi memerlukan akses ke galeri foto Anda."
      );
      return;
    }

    // 2. Buka galeri gambar
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Foto profil biasanya persegi
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const photo = result.assets[0];

      // 3. Buat FormData untuk dikirim ke backend
      const formData = new FormData();
      const uriParts = photo.uri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      formData.append("photo", {
        uri: photo.uri,
        name: `profile_${user.id}.${fileType}`,
        type: `image/${fileType}`,
      });

      // 4. Panggil fungsi dari context untuk memulai proses upload
      setIsUploading(true);
      try {
        await uploadProfilePhoto(formData);
        Alert.alert("Berhasil", "Foto profil berhasil diperbarui!");
      } catch (error) {
        Alert.alert("Gagal", error.message || "Gagal mengupload foto.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Fungsi untuk menangani klik pada item menu lainnya
  const handleMenuItemPress = (routeName) => {
    if (!user || user.isGuest) {
      Alert.alert(
        "Perlu Login",
        "Anda harus login untuk mengakses fitur ini.",
        [
          { text: "Login atau Daftar", onPress: logout },
          { text: "Batal", style: "cancel" },
        ]
      );
      return;
    }
    navigation.navigate(routeName);
  };

  // Fungsi untuk logout
  const handleLogout = () => {
    Alert.alert("Konfirmasi Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      { text: "Logout", onPress: logout },
    ]);
  };

  // Tampilan "Penjaga Gerbang" jika pengguna belum login atau adalah tamu
  if (!user || user.isGuest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.guestView}>
          <Ionicons name="person-circle-outline" size={80} color="#ccc" />
          <Text style={styles.guestTitle}>Halaman Profil</Text>
          <Text style={styles.guestText}>
            Silakan login atau daftar untuk melihat profil Anda dan mengakses
            fitur lainnya.
          </Text>
          <TouchableOpacity
            style={styles.guestButton}
            onPress={logout} // Memanggil logout akan membawa ke halaman Welcome/Login
          >
            <Text style={styles.guestButtonText}>Login atau Daftar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Tampilan utama jika pengguna sudah login
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user.profile_picture_url ||
                  `https://ui-avatars.com/api/?name=${user.username}&background=ADD8E6&color=FFFFFF&size=128`,
              }}
              style={styles.avatar}
            />
            {/* Tombol pensil sekarang untuk ganti foto */}
            <TouchableOpacity
              onPress={handlePhotoChange}
              style={styles.editButton}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#333" />
              ) : (
                <Ionicons name="camera-outline" size={20} color="#333" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.username}</Text>
          <Text style={styles.userInfo}>{user.email}</Text>
        </View>

        <View style={styles.menuContainer}>
          {/* Menu Item "Informasi Pribadi" sekarang untuk edit teks */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleNavigateToEdit}
          >
            <Ionicons
              name="document-text-outline"
              size={24}
              color="#555"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Informasi Pribadi</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuItemPress("MyReviews")}
          >
            <Ionicons
              name="star-outline"
              size={24}
              color="#555"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Ulasan Saya</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuItemPress("MyAddedPlaces")}
          >
            <Ionicons
              name="location-outline"
              size={24}
              color="#555"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Tempat Tambahan Saya</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("AboutApp")}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#555"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Tentang Aplikasi</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  backButton: {
    padding: 5,
    width: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 24,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileHeader: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 20,
    position: "relative",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#eee",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userInfo: {
    fontSize: 14,
    color: "#777",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIcon: {
    marginRight: 15,
    width: 24,
    textAlign: "center",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    marginHorizontal: 16,
    paddingVertical: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  guestView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  guestText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  guestButton: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  guestButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
