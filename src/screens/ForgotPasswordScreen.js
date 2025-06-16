// src/screens/ForgotPasswordScreen.js
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import LargeButton from "../components/LargeButton";
import LinkButton from "../components/LinkButton";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const navigation = useNavigation();

  const handleSendCode = async () => {
    setError(null);
    setIsLoading(true);
    setIsCodeSent(false);

    if (!email.trim()) {
      setError("Email tidak boleh kosong.");
      setIsLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Format email tidak valid.");
      setIsLoading(false);
      return;
    }

    try {
      const BACKEND_FORGOT_PASSWORD_URL =
        "http://10.0.2.2:8000/api/forgot-password";

      const response = await fetch(BACKEND_FORGOT_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsCodeSent(true);
        // --- NAVIGASI KE OTPSCREEN SETELAH KODE TERKIRIM ---
        navigation.navigate("OTPScreen", { email: email.trim() }); // Kirim email sebagai parameter
      } else {
        const errorMessage =
          data.message || "Gagal mengirim kode. Pastikan email terdaftar.";
        setError(errorMessage);
        // Alert.alert("Gagal Mengirim Kode", errorMessage); // Alert bisa dihilangkan jika ingin pesan di UI saja
      }
    } catch (err) {
      console.error("Kesalahan jaringan atau server:", err);
      setError(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
      // Alert.alert("Kesalahan Jaringan", "Tidak dapat terhubung ke server."); // Alert bisa dihilangkan jika ingin pesan di UI saja
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace("Login");
    }
  };

  const handleRememberPassword = () => {
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Forgot Password?</Text>
        <Text style={styles.headerSubText}>
          Dont worry! It occurs. Please enter the email address linked with your
          account.
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {error && <Text style={styles.errorMessage}>{error}</Text>}
      {isCodeSent && !error && (
        <Text style={styles.successMessage}>
          Kode telah dikirim! Silakan cek email Anda.
        </Text>
      )}

      <LargeButton
        title={isLoading ? "" : "Send Code"}
        onPress={handleSendCode}
        type="primary"
        disabled={isLoading}
      >
        {isLoading && <ActivityIndicator size="small" color="#fff" />}
      </LargeButton>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Remember Password? </Text>
        <LinkButton
          title="Login"
          onPress={handleRememberPassword}
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
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 30,
  },
  headerContainer: {
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  headerSubText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: "white",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
  },
  errorMessage: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  successMessage: {
    color: "green",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
});
