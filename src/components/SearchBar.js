// components/SearchBar.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Voice from "@react-native-community/voice";

// Bagian yang diperbaiki: Menerima searchQuery dan setSearchQuery sebagai props
const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState(""); // Menyimpan teks yang dikenali dari suara

  useEffect(() => {
    // Setup event listeners untuk Voice
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    // Bersihkan event listeners saat komponen di-unmount
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // --- Fungsi Callback Voice ---
  const onSpeechStart = (e) => {
    console.log("onSpeechStart: ", e);
    setRecognizedText(""); // Hapus teks sebelumnya saat mulai merekam
    setSearchQuery(""); // Bagian yang diperbaiki: Kosongkan search query di HomeScreen saat mulai mendengarkan
  };

  const onSpeechEnd = (e) => {
    console.log("onSpeechEnd: ", e);
    setIsRecording(false);
  };

  const onSpeechResults = (e) => {
    console.log("onSpeechResults: ", e);
    if (e.value && e.value.length > 0) {
      const text = e.value[0];
      setRecognizedText(text);
      // Bagian yang diperbaiki: Set global searchQuery dari hasil suara
      setSearchQuery(text);
    }
  };

  const onSpeechError = (e) => {
    console.log("onSpeechError: ", e);
    setIsRecording(false);
    let errorMessage = "Terjadi kesalahan pengenalan suara.";
    if (e.error && e.error.message) {
      errorMessage += `\nError: ${e.error.message}`;
    }
    Alert.alert("Error Suara", errorMessage);
    // Bagian yang diperbaiki: Jika ada error, pastikan TextInput tidak menunjukkan "sedang mendengarkan"
    // dan kembali ke searchQuery terakhir jika ada
    if (!searchQuery) {
      // Jika tidak ada searchQuery sebelumnya, kosongkan input
      setSearchQuery("");
    }
  };

  // --- Fungsi Penanganan Mic Button ---
  const startRecording = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Izin Mikrofon",
            message:
              "Aplikasi ini memerlukan akses ke mikrofon Anda untuk fitur pencarian suara.",
            buttonNeutral: "Tanya Nanti",
            buttonNegative: "Tolak",
            buttonPositive: "Izinkan",
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            "Izin Ditolak",
            "Fitur pencarian suara tidak dapat digunakan tanpa izin mikrofon."
          );
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    setIsRecording(true);
    setRecognizedText("");
    try {
      await Voice.start("id-ID");
    } catch (e) {
      console.error(e);
      setIsRecording(false);
      Alert.alert("Error Mulai Rekaman", "Gagal memulai perekaman suara.");
      // Bagian yang diperbaiki: Jika gagal start, pastikan TextInput kembali ke nilai terakhir
      if (recognizedText) setSearchQuery(recognizedText);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
    setIsRecording(false);
  };

  const onMicButtonPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Bagian yang diperbaiki: Handler untuk perubahan teks di TextInput
  const handleTextChange = (text) => {
    setSearchQuery(text); // Langsung update state searchQuery di HomeScreen
  };

  return (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search"
        size={20}
        color="gray"
        style={styles.searchIcon}
      />
      <TextInput
        placeholder={
          isRecording
            ? "Sedang mendengarkan..."
            : "Cari tempat seru di sekitarmu..."
        }
        style={styles.searchInput}
        // Bagian yang diperbaiki: Gunakan `searchQuery` dari props sebagai value
        value={searchQuery}
        // Bagian yang diperbaiki: Panggil handleTextChange saat teks berubah
        onChangeText={handleTextChange}
        editable={!isRecording} // Tidak bisa mengetik saat merekam
      />
      <TouchableOpacity
        style={[styles.micButton, isRecording && styles.micButtonActive]}
        onPress={onMicButtonPress}
      >
        <Ionicons
          name={isRecording ? "mic" : "mic-outline"}
          size={20}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  micButton: {
    backgroundColor: "#8A2BE2",
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  micButtonActive: {
    backgroundColor: "red",
  },
});

export default SearchBar;
