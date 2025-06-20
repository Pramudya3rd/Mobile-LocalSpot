// src/screens/ManageMyPlaceScreen.js
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
import { useNavigation, useRoute } from "@react-navigation/native"; // Tambah useRoute
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import LargeButton from "../components/LargeButton"; // Jika ini komponen tombol Anda

const API_BASE_URL = "https://localspot.hafidzirham.com:8000/api";

export default function ManageMyPlaceScreen() {
  const navigation = useNavigation();
  const route = useRoute(); // Gunakan useRoute untuk mendapatkan params
  const { placeId } = route.params; // Dapatkan placeId dari params

  const [placeName, setPlaceName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null); // URL gambar yang sudah ada atau yang baru diupload
  const [initialImage, setInitialImage] = useState(null); // Untuk menyimpan URL gambar awal dari DB
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [price, setPrice] = useState("");
  const [operationalHours, setOperationalHours] = useState("");
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [showOperationalHoursInput, setShowOperationalHoursInput] =
    useState(false);

  const [categories, setCategories] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true); // Untuk loading data tempat dan kategori

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsDataLoading(true);
      setError(null);
      try {
        // Ambil kategori
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
        const categoriesJson = await categoriesResponse.json();
        if (categoriesResponse.ok) {
          setCategories([
            { id: "", name: "Pilih kategori tempat" },
            ...categoriesJson,
          ]);
        } else {
          Alert.alert(
            "Error",
            categoriesJson.message || "Gagal memuat kategori."
          );
          setError("Gagal memuat kategori.");
        }

        // Ambil detail tempat berdasarkan placeId
        const placeResponse = await fetch(`${API_BASE_URL}/places/${placeId}`);
        const placeJson = await placeResponse.json();

        if (placeResponse.ok) {
          setPlaceName(placeJson.name || "");
          setShortDescription(placeJson.description || "");
          setSelectedCategory(placeJson.category_id?.toString() || ""); // Pastikan ID kategori match
          setUploadedImage(placeJson.main_image_url || null); // Set gambar yang sudah ada
          setInitialImage(placeJson.main_image_url || null); // Simpan untuk referensi

          if (placeJson.price_range) {
            setPrice(placeJson.price_range);
            setShowPriceInput(true);
          }
          if (placeJson.opening_hours) {
            setOperationalHours(placeJson.opening_hours);
            setShowOperationalHoursInput(true);
          }
        } else {
          Alert.alert(
            "Error",
            placeJson.message || "Gagal memuat detail tempat."
          );
          setError("Gagal memuat detail tempat.");
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Tidak dapat terhubung ke server untuk memuat data.");
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchInitialData();
  }, [placeId]); // Bergantung pada placeId agar data diperbarui jika ID berubah

  const handleBack = () => {
    navigation.goBack();
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Diperlukan",
        "Aplikasi memerlukan akses ke galeri foto Anda untuk mengunggah gambar."
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
    } else if (result.canceled) {
      console.log("Image picking cancelled.");
    } else {
      console.log("No assets selected.");
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    Alert.alert("Gambar Dihapus", "Gambar berhasil dihapus.");
  };

  const handlePriceAdd = () => {
    setShowPriceInput((prev) => !prev);
    if (showPriceInput) {
      // Jika mau disembunyikan, kosongkan nilainya
      setPrice("");
    }
  };

  const handleOperationalHoursAdd = () => {
    setShowOperationalHoursInput((prev) => !prev);
    if (showOperationalHoursInput) {
      // Jika mau disembunyikan, kosongkan nilainya
      setOperationalHours("");
    }
  };

  const handleUpdatePlace = async () => {
    setError(null);
    setIsLoading(true);

    if (!placeName.trim() || !shortDescription.trim() || !selectedCategory) {
      setError("Nama tempat, deskripsi, dan kategori harus diisi.");
      setIsLoading(false);
      return;
    }

    if (!uploadedImage && !initialImage) {
      // Jika tidak ada gambar sama sekali
      setError("Foto utama tempat harus diunggah.");
      setIsLoading(false);
      return;
    }

    try {
      const BACKEND_UPDATE_PLACE_URL = `${API_BASE_URL}/places/${placeId}`;

      const formData = new FormData();
      formData.append("_method", "PUT"); // Penting untuk Laravel jika menggunakan POST untuk PUT/PATCH

      formData.append("name", placeName.trim());
      formData.append("description", shortDescription.trim());
      formData.append("category_id", selectedCategory);

      if (uploadedImage) {
        // Hanya upload jika ada gambar baru yang dipilih atau jika gambar awal diubah
        // Cek apakah gambar yang diupload berbeda dari gambar awal
        if (uploadedImage !== initialImage) {
          const uriParts = uploadedImage.split(".");
          const fileType = uriParts[uriParts.length - 1];
          formData.append("main_image", {
            uri: uploadedImage,
            name: `photo_${Date.now()}.${fileType}`,
            type: `image/${fileType}`,
          });
        }
      } else if (initialImage && !uploadedImage) {
        // Jika gambar awal dihapus, kirim indikator ke backend untuk menghapus gambar
        // Ini tergantung bagaimana API Anda menangani penghapusan gambar.
        // Misalnya: formData.append("main_image_removed", "true");
        // Untuk saat ini, kita biarkan saja jika tidak ada gambar baru.
      }

      if (showPriceInput && price.trim()) {
        formData.append("price", price.trim());
      } else if (!showPriceInput) {
        formData.append("price", ""); // Kosongkan jika checkbox tidak dicentang
      }

      if (showOperationalHoursInput && operationalHours.trim()) {
        formData.append("opening_hours", operationalHours.trim());
      } else if (!showOperationalHoursInput) {
        formData.append("opening_hours", ""); // Kosongkan jika checkbox tidak dicentang
      }

      const response = await fetch(BACKEND_UPDATE_PLACE_URL, {
        method: "POST", // Menggunakan POST karena FormData dengan _method=PUT
        headers: {
          Accept: "application/json",
          // 'Authorization': 'Bearer YOUR_AUTH_TOKEN', // Jika Anda memiliki sistem otentikasi
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Berhasil", data.message || "Tempat berhasil diperbarui!");
        navigation.goBack(); // Kembali setelah berhasil
      } else {
        console.error("Backend Error:", data);
        let errorMessage = "Gagal memperbarui tempat. Silakan coba lagi.";
        if (data.errors) {
          const validationErrors = Object.values(data.errors)
            .map((err) => err.join(", "))
            .join("\n");
          errorMessage = "Validasi gagal:\n" + validationErrors;
        } else if (data.message) {
          errorMessage = data.message;
        }
        setError(errorMessage);
        Alert.alert("Gagal", errorMessage);
      }
    } catch (err) {
      console.error("Kesalahan jaringan atau server:", err);
      setError(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau URL API."
      );
      Alert.alert("Kesalahan", "Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlace = async () => {
    Alert.alert(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus "${placeName}" secara permanen?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              const BACKEND_DELETE_PLACE_URL = `${API_BASE_URL}/places/${placeId}`;
              const response = await fetch(BACKEND_DELETE_PLACE_URL, {
                method: "DELETE",
                headers: {
                  Accept: "application/json",
                  // 'Authorization': 'Bearer YOUR_AUTH_TOKEN', // Jika Anda memiliki sistem otentikasi
                },
              });

              if (response.ok || response.status === 204) {
                // 204 No Content untuk DELETE sukses
                Alert.alert("Berhasil", "Tempat berhasil dihapus!");
                navigation.goBack(); // Kembali ke MyAddedPlacesScreen
              } else {
                const data = await response.json();
                Alert.alert(
                  "Gagal",
                  data.message || "Terjadi kesalahan saat menghapus tempat."
                );
              }
            } catch (err) {
              console.error("Error deleting place:", err);
              Alert.alert(
                "Kesalahan",
                "Tidak dapat terhubung ke server untuk menghapus tempat."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (isDataLoading) {
    return (
      <SafeAreaView
        style={[styles.loadingContainer, { paddingTop: insets.top }]}
      >
        <ActivityIndicator size="large" color="#FF8A00" />
        <Text>Memuat data tempat...</Text>
      </SafeAreaView>
    );
  }

  if (error && !isDataLoading) {
    // Tampilkan error hanya jika bukan loading awal
    return (
      <SafeAreaView style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Terjadi Kesalahan: {error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.retryButton}>Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeAreaContainer}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F7F7"
        translucent={false}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Tempat Saya</Text>{" "}
        {/* Judul berubah */}
        <TouchableOpacity
          onPress={handleDeletePlace}
          style={styles.deleteButtonHeader}
        >
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 60 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          <Text style={styles.inputLabel}>Nama Tempat</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Contoh: Warung Bu Nurul"
            value={placeName}
            onChangeText={setPlaceName}
          />

          <Text style={styles.inputLabel}>Deskripsi Singkat</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Tulis deskripsi singkat tentang tempat ini"
            multiline={true}
            numberOfLines={4}
            value={shortDescription}
            onChangeText={setShortDescription}
          />

          <Text style={styles.inputLabel}>Kategori Tempat</Text>
          <View style={styles.pickerContainer}>
            {isDataLoading ? ( // Gunakan isDataLoading untuk kategori juga
              <ActivityIndicator
                size="small"
                color="#FF8A00"
                style={styles.pickerLoading}
              />
            ) : (
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {categories.map((cat) => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
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

          <Text style={styles.inputLabel}>Unggah Foto</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleImagePick}
          >
            <Ionicons name="cloud-upload-outline" size={24} color="#FF8C69" />
            <Text style={styles.uploadButtonText}>Tambahkan foto tempat</Text>
          </TouchableOpacity>
          {(uploadedImage || initialImage) && ( // Tampilkan pratinjau jika ada gambar awal atau baru diupload
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: uploadedImage || initialImage }} // Tampilkan gambar yang diupload atau gambar awal
                style={styles.uploadedImagePreview}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
              >
                <Ionicons name="close-circle" size={30} color="red" />
              </TouchableOpacity>
            </View>
          )}

          {/* Input Harga (Conditional Rendering) */}
          {showPriceInput && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Harga (Contoh: Rp 50.000 - Rp 100.000)
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Masukkan perkiraan harga"
                value={price}
                onChangeText={setPrice}
                keyboardType="default"
              />
            </View>
          )}

          {/* Input Jam Operasional (Conditional Rendering) */}
          {showOperationalHoursInput && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Jam Operasional (Contoh: 08:00 - 22:00)
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Masukkan jam operasional"
                value={operationalHours}
                onChangeText={setOperationalHours}
              />
            </View>
          )}

          <Text style={styles.optionalSectionTitle}>Opsional</Text>
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
                style={styles.optionalButtonIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionalButton}
              onPress={handleOperationalHoursAdd}
            >
              <Text style={styles.optionalButtonText}>Jam Operasional</Text>
              <Ionicons
                name={
                  showOperationalHoursInput
                    ? "remove-circle-outline"
                    : "add-circle-outline"
                }
                size={20}
                color="#FF8C69"
                style={styles.optionalButtonIcon}
              />
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorMessage}>{error}</Text>}
        </ScrollView>

        <View
          style={[
            styles.bottomButtonContainer,
            { paddingBottom: insets.bottom + 15 },
          ]}
        >
          <LargeButton
            title={isLoading ? "" : "Perbarui Tempat"} // Tombol untuk update
            onPress={handleUpdatePlace} // Fungsi untuk update
            type="primary"
            disabled={isLoading}
          >
            {isLoading && <ActivityIndicator size="small" color="#fff" />}
          </LargeButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#F7F7F7",
  },
  backButton: {
    width: 24,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  deleteButtonHeader: {
    // Gaya untuk tombol hapus di header
    width: 24, // Agar posisinya sejajar dengan tombol kembali
    justifyContent: "center",
    alignItems: "flex-end",
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    justifyContent: "center",
    height: 50,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#333",
  },
  pickerItem: {},
  pickerIcon: {
    position: "absolute",
    right: 15,
  },
  pickerLoading: {
    position: "absolute",
    alignSelf: "center",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF8C69",
    paddingVertical: 12,
    marginTop: 15,
    marginBottom: 15,
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
    height: 150,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 8,
    overflow: "hidden",
  },
  uploadedImagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 15,
    padding: 2,
    zIndex: 1,
  },
  optionalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 15,
  },
  optionalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
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
    marginRight: 10,
    flex: 1,
    justifyContent: "center",
  },
  optionalButtonText: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  optionalButtonIcon: {},
  inputGroup: {
    marginBottom: 15,
  },
  errorMessage: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  loadingContainer: {
    // Tambahkan style ini
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorContainer: {
    // Tambahkan style ini
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    // Tambahkan style ini
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    // Tambahkan style ini
    color: "#8A2BE2",
    fontSize: 16,
    fontWeight: "bold",
  },
});
