import React, { useState, useLayoutEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, Image, StyleSheet } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../firebaseconfig";
import { useRouter, useNavigation } from "expo-router";
import { doc, getDocs, query, collection, where, updateDoc } from "firebase/firestore";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

const handleSignIn = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Cerca il documento del paziente con la stessa email
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;

      await updateDoc(docRef, {
        firebase_uid: user.uid,
        has_mobile_account: true,
      });

      console.log("✅ Firebase UID salvato con successo nel documento utente");
    } else {
      console.warn("⚠️ Nessun documento utente trovato con questa email.");
    }

    Alert.alert("Success", "Logged in successfully!");
    router.push("/");

  } catch (error) {
    console.error("Login error:", error);
    Alert.alert("Error", "Invalid email or password");
  }
};

  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/Wilks-logo3x.png")} style={styles.logo} />
      <Text style={styles.brandTitle}>Wilks</Text>
      <View style={styles.glassCard}>
        <Text style={styles.title}>Sign In</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#8A8A8A"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#8A8A8A"
        />

        <Pressable onPress={handleSignIn} style={styles.button}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/recover-password")}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </Pressable>
        
        <Pressable onPress={() => router.push("/sign-up")}>
          <Text style={styles.linkText}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDFEFE",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#5DADE2",
    marginBottom: 20,
  },
  glassCard: {
    width: "90%",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginBottom: 15,
    fontSize: 16,
    color: "#2C3E50",
    borderWidth: 1,
    borderColor: "#2C3E50",
  },
  inputFocused: {
    borderColor: "#5DADE2",
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#5DADE2",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FDFEFE",
  },
  linkText: {
    marginTop: 10,
    fontSize: 14,
    color: "#5DADE2",
  },
});