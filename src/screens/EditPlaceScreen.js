import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native"; // <-- Import useRoute
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LargeButton from "../components/LargeButton";

const API_BASE_URL = "https://localspot.hafidzirham.com/api";

export default function EditPlaceScreen() {
  // =============================================================
  // === PERBAIKAN 1: Ambil parameter route (placeId)         ===
  // =============================================================
  const route = useRoute();
  const { placeId } = route.params; // Mendapatkan placeId dari parameter navigasi

  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // <-- Set true secara default untuk loading data awal
  const [isSaving, setIsSaving] = useState(false); // <-- State terpisah untuk menyimpan perubahan
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [error, setError] = useState(null);

  const [price, setPrice] = useState("");
  const [operationalHours, setOperationalHours] = useState("");
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [showOperationalHoursInput, setShowOperationalHoursInput] =
    useState(false);

  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchCategories();
    fetchPlaceData(placeId); // <-- Panggil fungsi untuk mengambil data tempat
  }, [placeId]); // Bergantung pada placeId, panggil ulang jika placeId berubah

  const fetchCategories = async () => {
    setIsCategoriesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const json = await response.json();

      if (response.ok && json.categories) {
        setCategories([
          { id: "", name: "Pilih kategori tempat" },
          ...json.categories,
        ]);
      } else {
        Alert.alert("Error", json.message || "Gagal memuat kategori.");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      Alert.alert(
        "Error",
        "Tidak dapat terhubung ke server untuk memuat kategori."
      );
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  // =============================================================
  // === PERBAIKAN 2: Fungsi untuk mengambil data tempat       ===
  // =============================================================
  const fetchPlaceData = async (id) => {
    setIsLoading(true); // Mulai loading data tempat
    setError(null);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(
          "Perlu Login",
          "Anda harus login untuk dapat melihat dan mengedit tempat."
        );
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/places/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.place) {
        const place = data.place;
        setPlaceName(place.name || "");
        setAddress(place.address || "");
        setShortDescription(place.description || "");
        setLatitude(place.latitude ? String(place.latitude) : "");
        setLongitude(place.longitude ? String(place.longitude) : "");
        setSelectedCategory(String(place.category_id) || ""); // Pastikan string
        setUploadedImage(place.main_image_url || null); // Gunakan URL gambar yang sudah ada

        if (place.price_range) {
          setPrice(place.price_range);
          setShowPriceInput(true);
        }
        if (place.opening_hours) {
          setOperationalHours(place.opening_hours);
          setShowOperationalHoursInput(true);
        }
      } else {
        Alert.alert(
          "Gagal Memuat Data",
          data.message || "Tidak dapat memuat detail tempat."
        );
        navigation.goBack(); // Kembali jika gagal memuat data
      }
    } catch (err) {
      console.error("Error fetching place data:", err);
      Alert.alert(
        "Kesalahan Jaringan",
        "Tidak dapat terhubung ke server untuk memuat data tempat."
      );
      navigation.goBack();
    } finally {
      setIsLoading(false); // Selesai loading data tempat
    }
  };

  // Kita tidak lagi butuh resetForm karena ini adalah layar edit,
  // data akan diisi dari API saat mount.

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Diperlukan",
        "Aplikasi memerlukan akses ke galeri foto Anda."
      );
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploadedImage(result.assets[0].uri);
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsFetchingLocation(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Lokasi Ditolak",
        "Harap aktifkan izin lokasi untuk menggunakan fitur ini."
      );
      setIsFetchingLocation(false);
      return;
    }
    try {
      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
      Alert.alert(
        "Lokasi Ditemukan!",
        `Koordinat Anda telah berhasil didapatkan.`
      );
    } catch (error) {
      Alert.alert(
        "Gagal",
        "Tidak dapat mengambil lokasi saat ini. Pastikan GPS Anda aktif."
      );
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  const handlePriceAdd = () => setShowPriceInput((prev) => !prev);
  const handleOperationalHoursAdd = () =>
    setShowOperationalHoursInput((prev) => !prev);

  // =============================================================
  // === PERBAIKAN 3: Fungsi untuk mengupdate tempat (handleUpdatePlace) ===
  // =============================================================
  const handleUpdatePlace = async () => {
    setError(null);
    if (
      !placeName.trim() ||
      !address.trim() ||
      !shortDescription.trim() ||
      !latitude ||
      !longitude ||
      !selectedCategory ||
      !uploadedImage // Gambar tetap wajib
    ) {
      setError(
        "Semua field wajib diisi, termasuk mendapatkan lokasi GPS dan mengunggah foto."
      );
      return;
    }

    setIsSaving(true); // Mulai proses menyimpan
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(
          "Perlu Login",
          "Anda harus login untuk dapat mengedit tempat."
        );
        setIsSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("_method", "PUT"); // Penting untuk Laravel API
      formData.append("name", placeName.trim());
      formData.append("address", address.trim());
      formData.append("description", shortDescription.trim());
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("category_id", selectedCategory);

      // Hanya tambahkan gambar jika itu adalah URI lokal baru (bukan URL dari server)
      if (
        uploadedImage &&
        (uploadedImage.startsWith("file://") ||
          uploadedImage.startsWith("content://"))
      ) {
        const uriParts = uploadedImage.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formData.append("main_image", {
          uri: uploadedImage,
          name: `photo_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      // Pastikan kirim data ini, bahkan jika kosong
      formData.append("price_range", price.trim());
      formData.append("opening_hours", operationalHours.trim());

      const response = await fetch(`${API_BASE_URL}/places/${placeId}`, {
        method: "POST", // Tetap POST, tapi sertakan _method PUT
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' TIDAK PERLU, FormData akan mengaturnya
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Berhasil",
          data.message || "Tempat berhasil diperbarui!",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.goBack(); // Kembali ke layar sebelumnya setelah sukses
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        let errorMessage = data.message || "Gagal memperbarui tempat.";
        if (data.errors) {
          errorMessage = Object.values(data.errors).flat().join("\n");
        }
        setError(errorMessage);
        Alert.alert("Gagal", errorMessage);
      }
    } catch (err) {
      console.error("Kesalahan jaringan atau server:", err);
      setError(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
      Alert.alert("Kesalahan", "Tidak dapat terhubung ke server.");
    } finally {
      setIsSaving(false); // Selesai proses menyimpan
    }
  };

  // =============================================================
  // === PERBAIKAN 4: Tampilkan loading state penuh layar      ===
  // =============================================================
  if (isLoading || isCategoriesLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8A00" />
        <Text style={styles.loadingText}>Memuat data tempat...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeAreaContainer}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Tempat</Text>{" "}
        {/* <-- Ganti teks */}
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
        >
          <Text style={styles.inputLabel}>Nama Tempat</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Contoh: Kopi Kenangan Jiwa"
            value={placeName}
            onChangeText={setPlaceName}
          />

          <Text style={styles.inputLabel}>Alamat Lengkap</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Contoh: Jl. Pahlawan No. 10, Surabaya"
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.inputLabel}>Deskripsi Singkat</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Jelaskan keunikan tempat ini..."
            multiline
            value={shortDescription}
            onChangeText={setShortDescription}
          />

          <Text style={styles.inputLabel}>Lokasi GPS (Wajib)</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleGetCurrentLocation}
            disabled={isFetchingLocation}
          >
            {isFetchingLocation ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="location" size={20} color="#fff" />
                <Text style={styles.locationButtonText}>
                  Gunakan Lokasi Saat Ini
                </Text>
              </>
            )}
          </TouchableOpacity>
          {latitude && longitude ? (
            <Text style={styles.locationDisplay}>
              Koordinat: {parseFloat(latitude).toFixed(4)},{" "}
              {parseFloat(longitude).toFixed(4)}
            </Text>
          ) : (
            <Text style={styles.locationDisplay}>
              Ambil lokasi untuk mengisi koordinat secara otomatis.
            </Text>
          )}

          <Text style={styles.inputLabel}>Kategori Tempat</Text>
          <View style={styles.pickerContainer}>
            {isCategoriesLoading ? (
              <ActivityIndicator size="small" color="#FF8A00" />
            ) : (
              <Picker
                selectedValue={selectedCategory}
                onValueChange={setSelectedCategory}
                style={styles.picker}
              >
                {categories.map((cat) => (
                  <Picker.Item
                    key={cat.id || "placeholder"}
                    label={cat.name}
                    value={cat.id}
                  />
                ))}
              </Picker>
            )}
            <Ionicons
              name="chevron-down"
              size={20}
              color="gray"
              style={styles.pickerIcon}
            />
          </View>

          <Text style={styles.inputLabel}>Unggah Foto Utama</Text>
          {uploadedImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: uploadedImage }}
                style={styles.uploadedImagePreview}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
              >
                <Ionicons name="close-circle" size={30} color="#ff3333" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleImagePick}
            >
              <Ionicons name="cloud-upload-outline" size={24} color="#FF8C69" />
              <Text style={styles.uploadButtonText}>
                Pilih Foto dari Galeri
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.optionalSectionTitle}>
            Informasi Tambahan (Opsional)
          </Text>
          <View style={styles.optionalButtonsContainer}>
            <TouchableOpacity
              style={styles.optionalButton}
              onPress={handlePriceAdd}
            >
              <Text style={styles.optionalButtonText}>Harga</Text>
              <Ionicons
                name={
                  showPriceInput
                    ? "remove-circle-outline"
                    : "add-circle-outline"
                }
                size={20}
                color="#FF8C69"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionalButton}
              onPress={handleOperationalHoursAdd}
            >
              <Text style={styles.optionalButtonText}>Jam</Text>
              <Ionicons
                name={
                  showOperationalHoursInput
                    ? "remove-circle-outline"
                    : "add-circle-outline"
                }
                size={20}
                color="#FF8C69"
              />
            </TouchableOpacity>
          </View>

          {showPriceInput && (
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Rp 50rb - Rp 100rb"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          )}
          {showOperationalHoursInput && (
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: 08:00 - 22:00"
                value={operationalHours}
                onChangeText={setOperationalHours}
              />
            </View>
          )}

          {error && <Text style={styles.errorMessage}>{error}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.bottomButtonContainer,
          { paddingBottom: insets.bottom + 15 },
        ]}
      >
        <LargeButton
          // Ganti teks tombol jika sedang saving
          title={isSaving ? "" : "Simpan Perubahan"}
          onPress={handleUpdatePlace}
          type="primary"
          disabled={isSaving}
        >
          {isSaving && <ActivityIndicator size="small" color="#fff" />}
        </LargeButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: { flex: 1, backgroundColor: "#F7F7F7" },
  keyboardAvoidingView: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#F7F7F7",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginLeft: -24,
  },
  scrollViewContent: { paddingHorizontal: 20, paddingTop: 15 },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 15,
  },
  textInput: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF8A00",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 5,
    marginBottom: 5,
  },
  locationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  locationDisplay: {
    textAlign: "center",
    color: "#555",
    fontStyle: "italic",
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    height: 50,
  },
  picker: { color: "#333" },
  pickerIcon: { position: "absolute", right: 15, pointerEvents: "none" },
  pickerLoading: { position: "absolute", alignSelf: "center" },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff0e9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF8C69",
    borderStyle: "dashed",
    paddingVertical: 30,
    marginTop: 10,
  },
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF8C69",
  },
  imagePreviewContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 4 / 3,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 8,
    overflow: "hidden",
  },
  uploadedImagePreview: { width: "100%", height: "100%", borderRadius: 8 },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
  },
  optionalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 20,
    marginBottom: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingTop: 20,
  },
  optionalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 15,
  },
  optionalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 15,
    flex: 1,
    justifyContent: "center",
  },
  optionalButtonText: { fontSize: 14, color: "#333", marginRight: 8 },
  inputGroup: { marginTop: 10 },
  errorMessage: {
    color: "red",
    fontSize: 14,
    marginTop: 15,
    textAlign: "center",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  // =============================================================
  // === STYLE BARU UNTUK LOADING AWAL DATA                    ===
  // =============================================================
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});
