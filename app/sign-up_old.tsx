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
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import { useRouter } from "expo-router";
import BottomNavigation from "../app/BottomNavigation";

export default function SignUp() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  // Helper che collega un utente Auth al doc paziente corrispondente all'email
  const attachUserToPatient = async (user: User, trimmedEmail: string) => {
  const q = query(collection(db, "users"), where("email", "==", trimmedEmail));
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error("no_patient_doc_for_email");
  }

  const patientDoc = snap.docs[0];
  const patientRef = patientDoc.ref;
  const data = patientDoc.data() || {};

  const updates: any = {
    created_by_doctor_id: data.created_by_doctor_id,  // obbligatorio secondo le rules
    last_modified_by: user.uid,                       // richiesto dalle rules
  };

  if (!data.firebase_uid) {
    updates.firebase_uid = user.uid;
    updates.has_mobile_account = true;
    updates.mobile_linked_at = serverTimestamp();
  }

  if (firstName.trim()) updates.firstName = firstName.trim();
  if (lastName.trim()) updates.lastName = lastName.trim();

  console.log("🔥 UPDATE COMPLETO CHE INVIO A FIRESTORE:", updates);
  await updateDoc(patientRef, updates);
};

  const handleSignUp = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      Alert.alert("Errore", "Inserisci email e password.");
      return;
    }

    try {
      // 1) TENTATIVO: creare un nuovo utente Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );
      const user = userCredential.user;

      try {
        // 2) Collega l'utente creato al paziente
        await attachUserToPatient(user, trimmedEmail);

        Alert.alert(
          "Registrazione completata",
          "Account attivato correttamente. Ora puoi effettuare il login."
        );
        router.push("/sign-in");
      } catch (linkErr: any) {
        console.error("Errore link paziente (nuovo utente):", linkErr);

        if (String(linkErr.message || "").includes("no_patient_doc_for_email")) {
          // Non esiste un paziente con questa email → eliminiamo l'utente creato
          await deleteUser(user);
          Alert.alert(
            "Account non trovato",
            "Non risulta alcun profilo paziente associato a questa email. Contatta il tuo medico."
          );
        } else {
          Alert.alert(
            "Errore",
            "Impossibile collegare l'account al profilo paziente. Riprova o contatta il medico."
          );
        }
      }
    } catch (error: any) {
      console.error("Errore Firebase SignUp:", error);

      // 3) Caso: email già in uso → proviamo a usare le credenziali come login
      if (error?.code === "auth/email-already-in-use") {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            trimmedEmail,
            password
          );
          const user = userCredential.user;

          await attachUserToPatient(user, trimmedEmail);

          Alert.alert(
            "Account già registrato",
            "Abbiamo collegato il tuo account esistente al profilo paziente. Ora puoi effettuare il login."
          );
          router.push("/sign-in");
        } catch (signInError: any) {
          console.error("Errore SignIn nella fase di SignUp:", signInError);

          if (signInError?.code === "auth/wrong-password") {
            Alert.alert(
              "Password non corretta",
              "Questa email è già registrata. Usa la password corretta oppure la funzione di recupero password."
            );
          } else {
            Alert.alert(
              "Errore",
              "Non riusciamo a collegare l'account esistente al profilo paziente. Prova ad accedere da Sign In o contatta il medico."
            );
          }
        }
        return;
      }

      // 4) Altri errori generici
      Alert.alert(
        "Errore",
        "Registrazione fallita. Riprova o contatta il tuo medico."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.innerContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo e Titolo */}
        <Image
          source={require("../assets/images/Wilks-logo3x.png")}
          style={styles.logo}
        />
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

          <Pressable
            onPress={() => router.push("/sign-in")}
            style={{ marginTop: 12 }}
          >
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.linkText}>Sign In</Text>
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
