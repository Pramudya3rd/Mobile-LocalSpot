import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const API_BASE_URL = "https://localspot.hafidzirham.com/api";

// 1. Membuat Context
export const AuthContext = createContext();

// 2. Membuat Provider yang akan menjadi "otak" autentikasi
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Untuk loading awal saat memeriksa token

  // Fungsi untuk LOGIN
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      } else {
        throw new Error(data.message || "Email atau password salah.");
      }
    } catch (error) {
      console.error("Kesalahan pada fungsi login di AuthContext:", error);
      throw error;
    }
  };

  // Fungsi untuk LOGOUT (untuk pengguna asli dan tamu)
  const logout = async () => {
    setIsLoading(true);
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.error("API logout error (diabaikan):", e);
    } finally {
      setUser(null);
      setToken(null);
      await AsyncStorage.multiRemove(["userToken", "user"]);
      setIsLoading(false);
    }
  };

  // Fungsi untuk masuk sebagai TAMU
  const continueAsGuest = () => {
    console.log("Memasuki mode tamu...");
    setUser({ isGuest: true });
    setToken(null);
  };

  // Fungsi untuk UPDATE DATA TEKS PROFIL (username, dll)
  const updateProfile = async (dataToUpdate) => {
    if (!token) throw new Error("Tidak ada token untuk autentikasi.");
    try {
      // Backend Anda mengharapkan POST ke /api/profile untuk update
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "POST", // Laravel sering menggunakan POST untuk update via FormData
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: dataToUpdate, // FormData dari layar InformasiPribadi
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        return data.user; // Kembalikan data baru agar UI bisa langsung update
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join("\n");
          throw new Error(errorMessages);
        }
        throw new Error(data.message || "Gagal memperbarui profil.");
      }
    } catch (error) {
      console.error("Update profile error di AuthContext:", error);
      throw error;
    }
  };

  // Fungsi untuk UPLOAD FOTO PROFIL
  const uploadProfilePhoto = async (photoFormData) => {
    if (!token) throw new Error("Tidak ada token untuk autentikasi.");
    try {
      const response = await fetch(`${API_BASE_URL}/profile/upload-photo`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: photoFormData,
      });

      const data = await response.json();

      if (response.ok) {
        // Update state user hanya pada bagian URL foto
        setUser((prevUser) => {
          const updatedUser = {
            ...prevUser,
            profile_picture_url: data.profile_picture_url,
          };
          // Update juga AsyncStorage
          AsyncStorage.setItem("user", JSON.stringify(updatedUser));
          return updatedUser;
        });
      } else {
        throw new Error(data.message || "Gagal mengupload foto.");
      }
    } catch (error) {
      console.error("Upload photo error di AuthContext:", error);
      throw error;
    }
  };

  // Fungsi yang berjalan saat aplikasi pertama kali dibuka
  const checkInitialAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("userToken");

      if (storedToken) {
        setToken(storedToken);
        const response = await fetch(`${API_BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Jika token tidak valid, logout
          await logout();
        }
      }
    } catch (e) {
      console.error("Gagal memeriksa status auth awal:", e);
    } finally {
      // Ini memastikan aplikasi tidak akan pernah stuck di splash screen
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkInitialAuthStatus();
  }, []);

  // Sediakan semua state dan fungsi ini ke seluruh aplikasi
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        continueAsGuest,
        updateProfile,
        uploadProfilePhoto, // <-- Sediakan fungsi baru
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook untuk mempermudah penggunaan context
export const useAuth = () => {
  return useContext(AuthContext);
};
