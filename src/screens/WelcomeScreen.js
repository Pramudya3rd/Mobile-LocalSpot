// src/screens/WelcomeScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import LargeButton from "../components/LargeButton";

import { useNavigation } from "@react-navigation/native";

const IMAGES = {
  img1: require("../../assets/welcomePage/image-1.jpg"),
  img2: require("../../assets/welcomePage/image-2.jpg"),
  img3: require("../../assets/welcomePage/image-3.jpg"),
  img4: require("../../assets/welcomePage/image-4.jpg"),
  img5: require("../../assets/welcomePage/image-5.jpg"),
  img6: require("../../assets/welcomePage/image-6.jpg"),
  img7: require("../../assets/welcomePage/image-7.jpg"),
  img8: require("../../assets/welcomePage/image-8.jpg"),
  logo: require("../../assets/Logo-LocalSpot.png"),
};

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const handleLogin = () => {
    navigation.navigate("Login");
  };
  const handleRegister = () => {
    navigation.navigate("Register");
  };
  const handleContinueAsGuest = () => {
    console.log("Melanjutkan sebagai tamu ditekan! Navigasi ke Home.");
    navigation.replace("MainAppTabs");
  };

  return (
    <View style={welcomeStyles.container}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={welcomeStyles.imageScrollViewContent}
        style={welcomeStyles.imageScrollView}
      >
        <View style={welcomeStyles.column}>
          <Image source={IMAGES.img1} style={welcomeStyles.imageTall} />
          <Image source={IMAGES.img3} style={welcomeStyles.imageSquare} />
        </View>

        <View style={welcomeStyles.column}>
          <Image source={IMAGES.img2} style={welcomeStyles.imageSquare} />
          <Image source={IMAGES.img4} style={welcomeStyles.imageTall} />
        </View>

        <View style={welcomeStyles.column}>
          <Image source={IMAGES.img5} style={welcomeStyles.imageTall} />
          <Image source={IMAGES.img7} style={welcomeStyles.imageSquare} />
        </View>

        <View style={welcomeStyles.column}>
          <Image source={IMAGES.img6} style={welcomeStyles.imageSquare} />
          <Image source={IMAGES.img8} style={welcomeStyles.imageTall} />
        </View>
      </ScrollView>

      <View style={welcomeStyles.logoContainer}>
        <Image source={IMAGES.logo} style={welcomeStyles.logoImage} />
      </View>

      <View style={welcomeStyles.jargonContainer}>
        <Text style={welcomeStyles.jargonText}>
          "Temukan tempat terbaik di sekitarmu"
        </Text>
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
    paddingTop: 60,
    paddingBottom: 60,
    justifyContent: "space-between",
  },
  imageScrollView: {
    flex: 1,
    marginBottom: 40,
  },
  imageScrollViewContent: {
    flexDirection: "row",
    paddingHorizontal: 30,
    alignItems: "flex-start",
  },
  column: {
    flexDirection: "column",
    marginHorizontal: 5,
  },
  imageSquare: {
    width: 130,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "cover",
  },
  imageTall: {
    width: 130,
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "cover",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 300,
    height: 120,
    resizeMode: "contain",
  },
  jargonContainer: {
    alignItems: "center",
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  jargonText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  guestButton: {
    alignSelf: "center",
  },
  guestButtonText: {
    color: "#FF8C69",
    fontWeight: "bold",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default WelcomeScreen;
