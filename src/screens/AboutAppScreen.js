// src/screens/AboutAppScreen.js
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AboutAppScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/Logo-LocalSpot.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Section 1: Temukan Pesona Kuliner & Tempat Lokal Favoritmu */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="star"
              size={20}
              color="#FFD700"
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>
              Temukan Pesona Kuliner & Tempat Lokal Favoritmu dengan LocalSpot!
            </Text>
          </View>
          <Text style={styles.sectionDescription}>
            Di tengah kesibukan kota, ada sejuta rasa dan cerita yang
            tersembunyi di balik warung kaki lima, kafe mungil di gang sempit,
            hingga spot kece yang belum banyak dijamah. LocalSpot hadir sebagai
            teman setiamu untuk menjelajahi keindahan lokal, mulai dari kuliner
            legendaris hingga tempat nongkrong yang cozy dan penuh cerita bahkan
            tempat belanja dan tempat penginapan.
          </Text>
        </View>

        {/* Section 2: Apa itu LocalSpot? */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="bulb-outline"
              size={20}
              color="#FFA500"
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>Apa itu LocalSpot?</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Di tengah hiruk-pikuk kehidupan, seringkali kita merindukan sentuhan
            otentik dan kehangatan dari tempat-tempat lokal. Baik itu warung
            makan legendaris dengan cita rasa rumahan, kafe mungil yang nyaman
            untuk bercengkrama, tempat belanja yang murah, atau destinasi unik
            yang belum banyak terjamah, LocalSpot hadir sebagai jembatan yang
            menghubungkan Anda dengan semua harta karun tersembunyi di sekitar
            Anda.
          </Text>
        </View>

        {/* Section 3: Dibuat dengan Cinta oleh: */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="heart"
              size={20}
              color="#FF6347"
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>Dibuat dengan Cinta oleh:</Text>
          </View>
          <View style={styles.teamContainer}>
            <View style={styles.teamMember}>
              {/* ======================================================= */}
              {/* === PERBAIKAN 1: Gunakan require() untuk gambar lokal === */}
              {/* ======================================================= */}
              <Image
                source={require("../../assets/images/foto-kelompok/pramudya.jpg")}
                style={styles.profilePic}
              />
              <View>
                <Text style={styles.memberName}>
                  Pramudya Reksha K. (22081010186)
                </Text>
                <Text style={styles.memberRole}>Backend Developer</Text>
              </View>
            </View>
            <View style={styles.teamMember}>
              {/* ======================================================= */}
              {/* === PERBAIKAN 2: Gunakan require() untuk gambar lokal === */}
              {/* ======================================================= */}
              <Image
                source={require("../../assets/images/foto-kelompok/hafidz.jpg")}
                style={styles.profilePic}
              />
              <View>
                <Text style={styles.memberName}>
                  Hafidz Irham Ar Ridlo (22081010068)
                </Text>
                <Text style={styles.memberRole}>
                  UI/UX & Frontend Developer
                </Text>
              </View>
            </View>
            <View style={styles.teamMember}>
              {/* Kode ini sudah benar karena menggunakan URL dari internet */}
              <Image
                source={require("../../assets/images/foto-kelompok/shanty.jpg")}
                style={styles.profilePic}
              />
              <View>
                <Text style={styles.memberName}>
                  Shanty Kurnia Dewi (22081010199)
                </Text>
                <Text style={styles.memberRole}>Frontend Developer</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ... (Styles tidak berubah)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 24,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  logo: {
    width: 150,
    height: 50,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flexShrink: 1,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    textAlign: "justify",
  },
  teamContainer: {
    marginTop: 10,
  },
  teamMember: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#eee",
  },
  memberName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  memberRole: {
    fontSize: 13,
    color: "#666",
  },
});

export default AboutAppScreen;
