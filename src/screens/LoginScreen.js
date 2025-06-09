// src/screens/LoginScreen.js
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator, // Untuk indikator loading
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Untuk menyimpan token

import { useNavigation } from "@react-navigation/native";

import LargeButton from "../components/LargeButton";
import LinkButton from "../components/LinkButton";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State untuk indikator loading
  const [error, setError] = useState(null); // State untuk pesan error

  const navigation = useNavigation();

  // --- Fungsi Penanganan Event ---
  const handleLogin = async () => {
    setError(null); // Reset pesan error sebelumnya
    setIsLoading(true); // Mulai loading

    // --- Validasi Input Client-Side ---
    if (!email.trim() || !password.trim()) {
      setError("Email dan password tidak boleh kosong.");
      setIsLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Format email tidak valid.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      // Contoh: password minimal 6 karakter
      setError("Password minimal 6 karakter.");
      setIsLoading(false);
      return;
    }
    // --- Akhir Validasi Input Client-Side ---

    try {
      // --- PANGGIL API LOGIN BACKEND ANDA DI SINI ---
      // GANTI URL placeholder ini dengan URL endpoint login backend Anda yang sebenarnya.
      // Jika backend di localhost, gunakan IP address komputer Anda di jaringan lokal, BUKAN 'localhost' atau '127.0.0.1'.
      // Contoh: 'http://192.168.1.100:8000/api/login' (ganti IP dan port sesuai backend Anda)
      const BACKEND_LOGIN_URL = "http://10.0.2.2:8000/api/login"; // <-- GANTI INI!

      const response = await fetch(BACKEND_LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json(); // Ambil respons JSON dari backend

      if (response.ok) {
        // Jika status HTTP 200-299 (login berhasil)
        if (data.token) {
          // Asumsi backend mengembalikan properti 'token'
          await AsyncStorage.setItem("userToken", data.token); // Simpan token
          // Opsional: Simpan juga informasi user lainnya:
          // await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));

          Alert.alert("Login Berhasil", "Selamat datang kembali!");
          setEmail(""); // Bersihkan input
          setPassword(""); // Bersihkan input

          navigation.replace("Home"); // Navigasi ke layar utama (HomeScreen)
        } else {
          setError("Login berhasil, tapi tidak ada token diterima.");
          Alert.alert(
            "Login Berhasil",
            "Selamat datang kembali! (Token tidak diterima)"
          );
          navigation.replace("Home"); // Tetap navigasi
        }
      } else {
        // Jika status HTTP 4xx atau 5xx (login gagal)
        const errorMessage =
          data.message || "Email atau password salah. Silakan coba lagi.";
        setError(errorMessage);
        // Alert bisa dihilangkan jika error sudah tampil di UI
      }
    } catch (err) {
      console.error("Kesalahan jaringan atau server:", err);
      setError(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau URL API."
      );
    } finally {
      setIsLoading(false); // Selesai loading
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Lupa Kata Sandi",
      "Anda akan diarahkan ke halaman reset password."
    );
    // Logika navigasi ke layar lupa kata sandi
  };

  const handleRegisterNow = () => {
    Alert.alert(
      "Daftar Sekarang",
      "Anda akan diarahkan ke halaman pendaftaran."
    );
    // Logika navigasi ke layar pendaftaran
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      Alert.alert(
        "Tidak Bisa Kembali",
        "Tidak ada layar sebelumnya di tumpukan."
      );
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.welcomeSubText}>Glad to see you again!</Text>
      </View>

      <View style={styles.inputSection}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#999"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tampilkan pesan error jika ada */}
      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <View style={styles.forgotPasswordContainer}>
        <LinkButton
          title="Forgot Password?"
          onPress={handleForgotPassword}
          color="#333333"
        />
      </View>

      <LargeButton
        title={isLoading ? "" : "Login"} // Teks kosong jika loading
        onPress={handleLogin}
        type="primary"
        disabled={isLoading} // Nonaktifkan tombol saat loading
      >
        {isLoading && <ActivityIndicator size="small" color="#fff" />}
      </LargeButton>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <LinkButton
          title="Register Now"
          onPress={handleRegisterNow}
          color="#FF4500"
          underline={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 35,
  },
  welcomeContainer: {
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  welcomeSubText: {
    fontSize: 16,
    color: "#666",
  },
  inputSection: {
    marginBottom: 20,
  },
  textInput: {
    height: 50,
    backgroundColor: "white",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  errorMessage: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  registerText: {
    color: "#666",
    fontSize: 14,
  },
});
