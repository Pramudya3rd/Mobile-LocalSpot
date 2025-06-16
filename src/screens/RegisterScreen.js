// src/screens/RegisterScreen.js
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
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNavigation } from "@react-navigation/native";

import LargeButton from "../components/LargeButton";
import LinkButton from "../components/LinkButton";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigation = useNavigation();

  const handleRegister = async () => {
    setError(null);
    setIsLoading(true);

    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !password_confirmation.trim()
    ) {
      setError("Semua field harus diisi.");
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
      setError("Password minimal 6 karakter.");
      setIsLoading(false);
      return;
    }
    if (password !== password_confirmation) {
      setError("Konfirmasi password tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      const BACKEND_REGISTER_URL =
        "https://localspot.hafidzirham.com/api/register";

      const response = await fetch(BACKEND_REGISTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
          password_confirmation: password_confirmation.trim(),
        }),
      });

      const rawResponseText = await response.text();

      let data = {};
      try {
        data = JSON.parse(rawResponseText);
      } catch (jsonErr) {
        console.error("Gagal menguraikan respons JSON:", jsonErr);
        setError("Respon dari server bukan format JSON yang valid.");
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        if (data.token) {
          await AsyncStorage.setItem("userToken", data.token);
          Alert.alert("Pendaftaran Berhasil", "Akun Anda berhasil dibuat!");
          setUsername("");
          setEmail("");
          setPassword("");
          setPasswordConfirmation("");
          navigation.replace("Home");
        } else {
          setError("Pendaftaran berhasil, tapi tidak ada token diterima.");
          Alert.alert(
            "Pendaftaran Berhasil",
            "Selamat datang kembali! (Token tidak diterima)"
          );
          navigation.replace("Login");
        }
      } else {
        const errorMessage =
          data.message || "Pendaftaran gagal. Silakan coba lagi.";
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Kesalahan jaringan atau server:", err);
      setError(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau URL API."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace("Welcome");
    }
  };

  const handleLoginNow = () => {
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Hello! Register to get started</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry={true}
          value={password_confirmation}
          onChangeText={setPasswordConfirmation}
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
      </View>

      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <LargeButton
        title={isLoading ? "" : "Register"}
        onPress={handleRegister}
        type="primary"
        disabled={isLoading}
      >
        {isLoading && <ActivityIndicator size="small" color="#fff" />}
      </LargeButton>

      <View style={styles.loginNowContainer}>
        <Text style={styles.loginNowText}>Already have an account? </Text>
        <LinkButton
          title="Login Now"
          onPress={handleLoginNow}
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
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  errorMessage: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  loginNowContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginNowText: {
    color: "#666",
    fontSize: 14,
  },
});
