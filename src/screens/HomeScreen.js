// src/screens/HomeScreen.js
import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Untuk logout
import { useNavigation } from "@react-navigation/native"; // Untuk logout

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken"); // Hapus token saat logout
    navigation.replace("Login"); // Kembali ke layar login setelah logout
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selamat Datang di Aplikasi!</Text>
      <Text>Anda telah berhasil login.</Text>
      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
