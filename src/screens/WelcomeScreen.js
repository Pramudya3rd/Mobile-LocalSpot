import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LargeButton from "../components/LargeButton"; // Pastikan path ini benar

const WelcomeScreen = () => {
  const handleLogin = () => {
    console.log("Login ditekan!");
  };

  const handleRegister = () => {
    console.log("Register ditekan!");
  };

  const handleContinueAsGuest = () => {
    console.log("Melanjutkan sebagai tamu ditekan!");
  };

  return (
    <View style={welcomeStyles.container}>
      {/* Bagian atas layar dengan gambar */}
      <View style={welcomeStyles.imageGridPlaceholder}>
        <Text style={{ fontSize: 20, color: "#aaa" }}>[Area Grid Gambar]</Text>
      </View>

      <View style={welcomeStyles.buttonContainer}>
        <LargeButton title="Login" onPress={handleLogin} type="primary" />
        <LargeButton
          title="Register"
          onPress={handleRegister}
          type="secondary"
        />
      </View>

      <TouchableOpacity
        onPress={handleContinueAsGuest}
        style={welcomeStyles.guestButton}
      >
        <Text style={welcomeStyles.guestButtonText}>Continue as a guest</Text>
      </TouchableOpacity>
    </View>
  );
};

const welcomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 30,
    justifyContent: "flex-end",
  },
  imageGridPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  guestButton: {
    alignSelf: "center",
    marginBottom: 30,
  },
  guestButtonText: {
    color: "#FF7F50",
    fontStyle: "bold",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default WelcomeScreen;
