import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

import LargeButton from "../components/LargeButton";

export default function AddPlaceScreen() {
  const [placeName, setPlaceName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- STATE BARU UNTUK HARGA DAN JAM OPERASIONAL ---
  const [price, setPrice] = useState("");
  const [operationalHours, setOperationalHours] = useState("");
  // --- STATE BARU UNTUK MENGONTROL VISIBILITAS FORM ---
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [showOperationalHoursInput, setShowOperationalHoursInput] =
    useState(false);
  // --- AKHIR STATE BARU ---

  const navigation = useNavigation();

  // --- Data Kategori (sesuai dengan backend Anda) ---
  const categories = [
    { label: "Pilih kategori tempat", value: "" },
    { label: "Kuliner", value: "1" },
    { label: "Wisata", value: "2" },
    { label: "Belanja", value: "3" },
    { label: "Hiburan", value: "4" },
    { label: "Penginapan", value: "5" },
  ];

  // --- Fungsi Penanganan Event ---
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace("Home");
    }
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUploadedImage(result.assets[0].uri);
    }
  };

  // --- FUNGSI UNTUK MENGONTROL VISIBILITAS INPUT HARGA ---
  const handlePriceAdd = () => {
    setShowPriceInput((prev) => !prev); // Toggle visibilitas
    if (showPriceInput) {
      // Jika akan disembunyikan, kosongkan nilainya
      setPrice("");
    }
  };

  // --- FUNGSI UNTUK MENGONTROL VISIBILITAS INPUT JAM OPERASIONAL ---
  const handleOperationalHoursAdd = () => {
    setShowOperationalHoursInput((prev) => !prev); // Toggle visibilitas
    if (showOperationalHoursInput) {
      // Jika akan disembunyikan, kosongkan nilainya
      setOperationalHours("");
    }
  };
  // --- AKHIR FUNGSI PENGONTROL VISIBILITAS ---

  const handleAddPlace = async () => {
    setError(null);
    setIsLoading(true);

    // --- Validasi Client-Side (disesuaikan) ---
    if (
      !placeName.trim() ||
      !shortDescription.trim() ||
      !selectedCategory ||
      !uploadedImage
    ) {
      setError("Nama tempat, deskripsi, kategori, dan foto harus diisi.");
      setIsLoading(false);
      return;
    }
    // --- Akhir Validasi ---

    try {
      const BACKEND_ADD_PLACE_URL =
        "http://<IP_ADDRESS_KOMPUTER_ANDA>:<PORT_BACKEND>/api/places";

      const formData = new FormData();
      formData.append("name", placeName.trim());
      formData.append("description", shortDescription.trim());
      formData.append("category_id", selectedCategory);

      const uriParts = uploadedImage.split(".");
      const fileType = uriParts[uriParts.length - 1];
      formData.append("main_image", {
        uri: uploadedImage,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });

      // --- TAMBAHKAN HARGA DAN JAM OPERASIONAL KE FORM DATA (hanya jika inputnya terlihat/diisi) ---
      if (showPriceInput && price.trim()) {
        formData.append("price", price.trim());
      }
      if (showOperationalHoursInput && operationalHours.trim()) {
        formData.append("opening_hours", operationalHours.trim());
      }
      // --- AKHIR TAMBAHKAN ---

      const response = await fetch(BACKEND_ADD_PLACE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Berhasil", data.message || "Tempat berhasil ditambahkan!");
        // Reset form setelah berhasil
        setPlaceName("");
        setShortDescription("");
        setSelectedCategory("");
        setUploadedImage(null);
        setPrice("");
        setOperationalHours("");
        setShowPriceInput(false); // Sembunyikan kembali input
        setShowOperationalHoursInput(false); // Sembunyikan kembali input
        navigation.goBack();
      } else {
        console.error("Backend Error:", data);
        let errorMessage = "Gagal menambahkan tempat. Silakan coba lagi.";
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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambahkan Tempat</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Nama Tempat */}
        <Text style={styles.inputLabel}>Nama Tempat</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Contoh: Warung Bu Nurul"
          value={placeName}
          onChangeText={setPlaceName}
        />

        {/* Deskripsi Singkat */}
        <Text style={styles.inputLabel}>Deskripsi Singkat</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Tulis deskripsi singkat tentang tempat ini"
          multiline={true}
          numberOfLines={4}
          value={shortDescription}
          onChangeText={setShortDescription}
        />

        {/* Kategori Tempat (Picker) */}
        <Text style={styles.inputLabel}>Kategori Tempat</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedCategory(itemValue)
            }
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {categories.map((cat) => (
              <Picker.Item
                key={cat.value}
                label={cat.label}
                value={cat.value}
              />
            ))}
          </Picker>
          <Ionicons
            name="chevron-down"
            size={20}
            color="gray"
            style={styles.pickerIcon}
          />
        </View>

        {/* Unggah Foto */}
        <Text style={styles.inputLabel}>Unggah Foto</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
          <Ionicons name="cloud-upload-outline" size={24} color="#FF8C69" />
          <Text style={styles.uploadButtonText}>Tambahkan foto tempat</Text>
        </TouchableOpacity>
        {uploadedImage && (
          <Image
            source={{ uri: uploadedImage }}
            style={styles.uploadedImagePreview}
          />
        )}

        {/* Bagian Opsional */}
        <Text style={styles.optionalSectionTitle}>Opsional</Text>
        <View style={styles.optionalButtonsContainer}>
          {/* Tombol Harga */}
          <TouchableOpacity
            style={styles.optionalButton}
            onPress={handlePriceAdd}
          >
            <Text style={styles.optionalButtonText}>Harga</Text>
            <Ionicons
              name={
                showPriceInput ? "remove-circle-outline" : "add-circle-outline"
              } // Ubah ikon
              size={20}
              color="#FF8C69"
              style={styles.optionalButtonIcon}
            />
          </TouchableOpacity>
          {/* Tombol Jam Operasional */}
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
              } // Ubah ikon
              size={20}
              color="#FF8C69"
              style={styles.optionalButtonIcon}
            />
          </TouchableOpacity>
        </View>

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
              keyboardType="default" // Bisa diubah ke 'numeric' jika hanya angka
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

        {error && <Text style={styles.errorMessage}>{error}</Text>}
      </ScrollView>

      {/* Tombol Tambahkan (Fixed di Bawah) */}
      <View style={styles.bottomButtonContainer}>
        <LargeButton
          title={isLoading ? "" : "Tambahkan"}
          onPress={handleAddPlace}
          type="primary"
          disabled={isLoading}
        >
          {isLoading && <ActivityIndicator size="small" color="#fff" />}
        </LargeButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 20,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
  pickerItem: {
    //
  },
  pickerIcon: {
    position: "absolute",
    right: 15,
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
  uploadedImagePreview: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
    marginTop: 10,
    marginBottom: 15,
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
  optionalButtonIcon: {
    //
  },
  // --- GAYA BARU UNTUK GROUP INPUT JIKA DIPERLUKAN ---
  inputGroup: {
    marginBottom: 15, // Memberikan sedikit jarak antar group input opsional
  },
  errorMessage: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});
