import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Hapus import AsyncStorage karena tidak lagi dibutuhkan di sini
// import AsyncStorage from "@react-native-async-storage/async-storage";

// Import hook 'useAuth' dari AuthContext
import { useAuth } from "../contexts/AuthContext";

import LargeButton from "../components/LargeButton";
import LinkButton from "../components/LinkButton";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState(null); // State error lokal untuk form

  const navigation = useNavigation();

  // Ambil fungsi 'login' dan status 'isLoading' dari AuthContext
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    setError(null);

    // Validasi Sederhana di sisi klien
    if (!email.trim() || !password.trim()) {
      setError("Email dan password tidak boleh kosong.");
      return;
    }

    try {
      // Panggil fungsi login dari context.
      // AuthContext yang akan menangani API call, penyimpanan token, dan update state global.
      await login(email.trim(), password.trim());

      // Jika login berhasil, AuthContext akan mengubah state 'user'
      // dan navigator utama Anda akan otomatis berpindah layar.
      // Anda mungkin tidak perlu navigasi manual di sini jika navigator sudah diatur.
      // Jika masih perlu, pastikan tujuannya benar.
      navigation.replace("MainAppTabs");
    } catch (err) {
      // Jika login di context gagal (misal: password salah), ia akan melempar error
      // yang bisa kita tangkap dan tampilkan di sini.
      setError(err.message || "Terjadi kesalahan saat login.");
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };
  const handleRegisterNow = () => {
    navigation.navigate("Register");
  };
  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

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
        />

        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
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

      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <View style={styles.forgotPasswordContainer}>
        <LinkButton
          title="Forgot Password?"
          onPress={handleForgotPassword}
          color="#333333"
        />
      </View>

      <LargeButton
        title={isLoading ? "" : "Login"}
        onPress={handleLogin}
        type="primary"
        disabled={isLoading}
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
    alignSelf: "flex-start",
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
