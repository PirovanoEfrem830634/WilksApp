import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import { useRouter } from "expo-router";
import BottomNavigation from "../app/BottomNavigation";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
  try {
    // ✅ 1. Crea l'utente su Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ 2. Crea il documento su Firestore con lo stesso ID del Firebase UID
    await setDoc(doc(db, "users", user.uid), {
      firstName,
      lastName,
      email,
      firebase_uid: user.uid,           // 🔐 richiesto dalle regole
      has_mobile_account: true,         // ✅ opzionale ma utile
    });

    Alert.alert("Registrazione completata", "Benvenuto!");
    router.push("/sign-in");

  } catch (error) {
  console.error("Errore Firebase SignUp:", error);

  if (error instanceof Error) {
    Alert.alert("Errore", error.message);
  } else {
    Alert.alert("Errore", "Registrazione fallita. Riprova.");
  }
}

};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.innerContainer} keyboardShouldPersistTaps="handled">
        {/* Logo e Titolo */}
        <Image source={require("../assets/images/Wilks-logo3x.png")} style={styles.logo} />
        <Text style={styles.logoText}>Wilks</Text>

        {/* Card di registrazione */}
        <View style={styles.card}>
          <Text style={styles.title}>Sign Up</Text>

          <TextInput
            placeholder="First Name"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            placeholder="Last Name"
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/sign-in")} style={{ marginTop: 12 }}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.linkText}>Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <BottomNavigation />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  innerContainer: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#5DADE2",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2C3E50",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D6DBDF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#5DADE2",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerText: {
    textAlign: "center",
    color: "#555",
  },
  linkText: {
    color: "#5DADE2",
    fontWeight: "600",
  },
});
