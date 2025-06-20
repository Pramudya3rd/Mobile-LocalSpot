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
import { useNavigation, useRoute } from "@react-navigation/native";

import LargeButton from "../components/LargeButton";
import LinkButton from "../components/LinkButton";

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email: userEmail, otp: userOtp } = route.params || {};

  const [otp, setOtp] = useState(userOtp || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResetPassword = async () => {
    setError(null);
    setIsLoading(true);

    if (!otp.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setError("Semua field harus diisi.");
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      const BACKEND_RESET_PASSWORD_URL =
        "https://localspot.hafidzirham.com/api/reset-password"; // <-- GANTI INI DENGAN URL API ANDA YANG ASLI!

      const response = await fetch(BACKEND_RESET_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          otp: otp.trim(),
          new_password: newPassword.trim(),
          new_password_confirmation: confirmNewPassword.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Reset Password Berhasil",
          data.message || "Password Anda berhasil direset!"
        );
        navigation.replace("Login");
      } else {
        const errorMessage =
          data.message ||
          "Reset password gagal. OTP tidak valid atau sudah kadaluarsa.";
        setError(errorMessage);
        Alert.alert("Reset Password Gagal", errorMessage);
      }
    } catch (err) {
      console.error("Kesalahan jaringan atau server:", err);
      setError(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
      Alert.alert("Kesalahan Jaringan", "Tidak dapat terhubung ke server.");
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
        <Text style={styles.headerTitle}>Create new password</Text>
        {/* Tidak ada lagi {" "} di sini */}
        <Text style={styles.headerSubText}>
          Your new password must be unique from those previously used.
        </Text>
        {/* Tidak ada lagi {" "} di sini */}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry={true}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry={true}
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
      </View>

      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <LargeButton
        title={isLoading ? "" : "Reset Password"}
        onPress={handleResetPassword}
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
