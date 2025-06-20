import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

const InformasiPribadiScreen = () => {
  const navigation = useNavigation();
  const { user, updateProfile } = useAuth();

  // PERBAIKAN: Hapus state untuk 'name' karena tidak ada di data backend
  // const [name, setName] = useState('');
  const [username, setUsername] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Sinkronkan state form dengan data dari context
    if (user && !user.isGuest) {
      // PERBAIKAN: Hanya set data yang ada
      setUsername(user.username || "");
    }
  }, [user]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSaveChanges = async () => {
    // PERBAIKAN: Validasi hanya untuk username
    if (!username.trim()) {
      Alert.alert("Input Tidak Valid", "Username tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      // PERBAIKAN: Hanya kirim data yang bisa diubah dan ada di backend
      formData.append("username", username);

      await updateProfile(formData);

      Alert.alert("Berhasil", "Profil Anda telah berhasil diperbarui.");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Gagal Menyimpan", error.message || "Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setUsername(user.username || "");
    }
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    navigation.navigate("ForgotPassword");
  };

  if (!user || user.isGuest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Informasi Pribadi</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.guestView}>
          <Ionicons name="lock-closed-outline" size={60} color="#ccc" />
          <Text style={styles.guestText}>
            Silakan login untuk melihat informasi pribadi Anda.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Informasi Pribadi</Text>
        <View style={styles.placeholder}>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.headerButtonText}>Ubah</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={styles.headerButtonText}>Batal</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* PERBAIKAN: Hapus field untuk "Nama Lengkap" */}

        {/* Kolom Username */}
        <View style={styles.infoFieldContainer}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={
              isEditing
                ? styles.textInput
                : [styles.textInput, styles.disabledInput]
            }
            value={username}
            onChangeText={setUsername}
            editable={isEditing}
            autoCapitalize="none"
          />
        </View>

        {/* Kolom Email (tidak bisa diedit) */}
        <View style={styles.infoFieldContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={[styles.textInput, styles.disabledInput]}
            value={user.email || ""}
            editable={false}
          />
        </View>

        {/* Kolom Ubah Password */}
        <View style={styles.infoFieldContainer}>
          <Text style={styles.inputLabel}>Keamanan</Text>
          <TouchableOpacity
            style={styles.passwordButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.passwordButtonText}>Ubah Password</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Tombol Simpan hanya muncul saat mode edit aktif */}
        {isEditing && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Style tidak diubah, hanya ditambahkan beberapa style baru jika dibutuhkan
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 50,
    alignItems: "flex-end",
  },
  headerButtonText: {
    fontSize: 16,
    color: "#8A2BE2",
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  infoFieldContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
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
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#888",
  },
  passwordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  passwordButtonText: {
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#8A2BE2",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  guestView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  guestText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
});

export default InformasiPribadiScreen;
