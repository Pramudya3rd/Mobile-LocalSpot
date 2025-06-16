// components/SearchBar.js
import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SearchBar = () => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search"
        size={20}
        color="gray"
        style={styles.searchIcon}
      />
      <TextInput
        placeholder="Cari tempat seru di sekitarmu..."
        style={styles.searchInput}
      />
      <TouchableOpacity style={styles.micButton}>
        <Ionicons name="mic" size={20} color="white" />
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
    marginHorizontal: 16, // Agar padding konsisten dengan layar utama
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
    backgroundColor: "#8A2BE2", // Warna ungu dari gambar
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
});

export default SearchBar;
