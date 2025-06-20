// src/services/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";

// Ganti dengan URL dasar backend Anda
const API_BASE_URL = "http://10.0.2.2:8000/api";
const API_PRODUCTION_URL = "https://localspot.hafidzirham.com/api"; // Ganti dengan URL produksi jika ada

/**
 * Fungsi fetch yang sudah dilengkapi dengan header autentikasi.
 * @param {string} endpoint - Endpoint API yang akan dipanggil (misal: '/places').
 * @param {object} options - Opsi tambahan untuk fetch (method, body, dll).
 * @returns {Promise<Response>} - Promise yang berisi respons dari server.
 */
const apiFetch = async (endpoint, options = {}) => {
  // 1. Ambil token dari AsyncStorage
  const token = await AsyncStorage.getItem("userToken");

  // 2. Siapkan header default
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers, // Gabungkan dengan header kustom jika ada
  };

  // 3. Tambahkan header Authorization jika token ada
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 4. Gabungkan semua opsi dan lakukan fetch
  const config = {
    ...options,
    headers,
  };

  return fetch(`${API_PRODUCTION_URL}${endpoint}`, config);
};

// Export fungsi ini agar bisa digunakan di seluruh aplikasi
export default apiFetch;
