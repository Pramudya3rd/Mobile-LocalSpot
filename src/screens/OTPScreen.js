// src/screens/OTPScreen.js
import React, { useState, useRef } from "react"; 
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Keyboard, 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native"; 

import LargeButton from "../components/LargeButton";
import LinkButton from "../components/LinkButton";

export default function OTPScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email: userEmail } = route.params || {}; 

  const [otp, setOtp] = useState(["", "", "", "", "", ""]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const otpTextInputRefs = useRef([]);

  const handleChangeOTP = (value, index) => {
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      otpTextInputRefs.current[index + 1]?.focus();
    }

    if (!value && index > 0) {
      otpTextInputRefs.current[index - 1]?.focus();
    }
    if (newOtp.every((digit) => digit !== "") && index === otp.length - 1) {
      Keyboard.dismiss();
    }
  };

  const handleVerify = async () => {
    setError(null);
    setIsLoading(true);

    const fullOtp = otp.join("");

    if (fullOtp.length !== otp.length) {
      // Pastikan panjang OTP sesuai
      setError("Kode OTP harus 6 digit.");
      setIsLoading(false);
      return;
    }

    console.log("Navigasi ke ResetPasswordScreen dengan OTP dan Email.");
    navigation.navigate("ResetPassword", { email: userEmail, otp: fullOtp });

    setIsLoading(false);
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
        <Text style={styles.headerTitle}>OTP Verification</Text>
        <Text style={styles.headerSubText}>
          Enter the verification code we just sent on your email address
        </Text>
      </View>

      <View style={styles.otpInputContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            ref={(ref) => (otpTextInputRefs.current[index] = ref)} 
            maxLength={1} 
            keyboardType="number-pad"
            onChangeText={(value) => handleChangeOTP(value, index)}
            value={digit}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
                otpTextInputRefs.current[index - 1]?.focus(); 
              }
            }}
          />
        ))}
      </View>

      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <LargeButton
        title={isLoading ? "" : "Verify"}
        onPress={handleVerify}
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
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between", 
    marginBottom: 40, 
    height: 60,
  },
  otpInput: {
    width: 50, 
    height: 50, 
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    backgroundColor: "white",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowColor: "#000",
    shadowOffset: { height: 2, width: 0 },
    elevation: 2,
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
