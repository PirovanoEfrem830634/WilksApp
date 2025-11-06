import React, { useState, useLayoutEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, Image, StyleSheet } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../firebaseconfig";
import { useRouter, useNavigation } from "expo-router";
import { doc, getDocs, query, collection, where, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";


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
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    // 1) PROVA DIRETTA: users/{uid}
    const directRef = doc(db, "users", user.uid);
    const directSnap = await getDoc(directRef);

    if (directSnap.exists()) {
      // siamo a posto: il paziente può leggere il SUO doc
      // opzionale: assicurati che sia marcato come mobile-linked
      const data = directSnap.data() || {};
      if (!data.has_mobile_account) {
        await updateDoc(directRef, {
          has_mobile_account: true,
          last_modified_by: user.uid,
          mobile_linked_at: serverTimestamp(),
        });
      }
    } else {
      // 2) FALLBACK: cerca per email e linka il primo doc trovato
      const q = query(collection(db, "users"), where("email", "==", user.email));
      const r = await getDocs(q);

      if (r.empty) {
        // nessun profilo paziente creato dal medico con questa email
        // puoi decidere di bloccare o di crearne uno nuovo lato app (sconsigliato ora)
        throw new Error("no_patient_doc_for_email");
      }

      const ref = r.docs[0].ref;
      await updateDoc(ref, {
        firebase_uid: user.uid,
        has_mobile_account: true,
        last_modified_by: user.uid,
        mobile_linked_at: serverTimestamp(),
      });
    }

    // SUCCESSO → vai in home
    router.replace("/homenew");
  } catch (err: any) {
    console.error("Login error:", err);
    // Messaggi un filo più chiari
    if (String(err?.message || "").includes("no_patient_doc_for_email")) {
      Alert.alert("Account non collegato",
        "Non trovo un profilo paziente con questa email. Contatta il tuo medico.");
    } else {
      Alert.alert("Errore", "Missing/insufficient permissions o credenziali non valide.");
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