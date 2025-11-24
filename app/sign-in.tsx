import React, { useState, useLayoutEffect, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, Image, StyleSheet } from "react-native";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db, auth } from "../firebaseconfig";
import { useRouter, useNavigation } from "expo-router";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // 🔐 AUTO-LOGOUT: ogni volta che entro nella schermata SignIn
  useEffect(() => {
    signOut(auth)
      .then(() => {
        console.log("Auto-logout eseguito all'avvio di SignIn");
      })
      .catch((err) => {
        console.log("Errore durante l'auto-logout (puoi ignorarlo in dev):", err);
      });
  }, []);

  const handleSignIn = async () => {
    try {
      // 1) Login su Firebase Auth
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!user.email) {
        Alert.alert("Errore", "L'account non ha un'email valida.");
        return;
      }

      // 2) Cerca il documento paziente tramite EMAIL
      const q = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        Alert.alert(
          "Profilo non trovato",
          "Non risulta alcun profilo paziente associato a questa email. Contatta il tuo medico."
        );
        return;
      }

      const patientDoc = snap.docs[0];
      const patientRef = patientDoc.ref;
      const data = patientDoc.data() || {};

      // 3) Se firebase_uid è vuoto → collega l'account
      if (!data.firebase_uid) {
        await updateDoc(patientRef, {
          firebase_uid: user.uid,
          has_mobile_account: true,
          mobile_linked_at: serverTimestamp(),
        });
      }

      // 4) Login OK → vai in home
      router.replace("/homenew");

    } catch (err: any) {
      console.error("Login error:", err);

      if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        Alert.alert("Errore", "Email o password non corretti.");
      } else {
        Alert.alert("Errore", "Missing/insufficient permissions o problema temporaneo.");
      }
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
          autoCapitalize="none"
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

        {/* ❌ RIMOSSO SIGN-UP */}
        <Text style={styles.footerMsg}>
          Per attivare l'account contatta il tuo medico.
        </Text>
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
  footerMsg: {
    marginTop: 10,
    fontSize: 13,
    color: "#777",
  },
});
