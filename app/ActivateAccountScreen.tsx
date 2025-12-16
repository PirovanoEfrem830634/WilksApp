// src/screens/ActivateAccountScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Animatable from "react-native-animatable";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import PressableScaleWithRef from "../components/PressableScaleWithRef";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";

import { auth, db } from "../firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

type TicketDoc = {
  patientDocId: string;
  email: string;
  codeHash: string; // (in v1 è il codice in chiaro)
  used: boolean;
};

const norm = (s: string) => (s || "").trim();

export default function ActivateAccountScreen() {
  const router = useRouter();

  const [ticketId, setTicketId] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      norm(ticketId).length >= 6 &&
      norm(code).length >= 4 &&
      norm(email).includes("@") &&
      norm(password).length >= 6 &&
      !loading
    );
  }, [ticketId, code, email, password, loading]);

  const toast = (
    type: "success" | "error" | "info",
    title: string,
    msg?: string
  ) => {
    Toast.show({
      type,
      text1: title,
      text2: msg,
      position: "top",
      visibilityTime: 2600,
    });
  };

  const getAuthUid = async (e: string, p: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, e, p);
      return cred.user.uid;
    } catch (err: any) {
      // Se l'email esiste già, facciamo sign-in e proseguiamo
      if (err?.code === "auth/email-already-in-use") {
        const cred = await signInWithEmailAndPassword(auth, e, p);
        return cred.user.uid;
      }
      throw err;
    }
  };

  const handleActivate = async () => {
    const tId = norm(ticketId);
    const c = norm(code);
    const e = norm(email).toLowerCase();
    const p = password;

    if (!tId || !c || !e || p.length < 6) {
      toast(
        "error",
        "Compila tutti i campi",
        "Controlla Ticket ID, Codice, Email e Password."
      );
      return;
    }

    setLoading(true);

    try {
      // 1) Crea o entra con Auth user (sign-in automatico)
      const uid = await getAuthUid(e, p);

      // 2) Leggi ticket (rules: serve signed-in, ora lo sei)
      const ticketRef = doc(db, "activationTickets", tId);
      const snap = await getDoc(ticketRef);

      if (!snap.exists()) {
        await signOut(auth);
        throw new Error("Ticket non trovato. Controlla il Ticket ID.");
      }

      const ticket = snap.data() as TicketDoc;

      // 3) Validazioni
      if (ticket.used === true) {
        await signOut(auth);
        throw new Error("Questo ticket è già stato usato.");
      }

      if ((ticket.email || "").toLowerCase() !== e) {
        await signOut(auth);
        throw new Error("L’email non corrisponde al ticket.");
      }

      if (String(ticket.codeHash || "") !== String(c)) {
        await signOut(auth);
        throw new Error("Codice errato. Ricontrolla le cifre.");
      }

      if (!ticket.patientDocId) {
        await signOut(auth);
        throw new Error("Ticket non valido: manca userId.");
      }

      // 4) Consuma ticket (NON cambiare userId/email/code)
      await updateDoc(ticketRef, {
        used: true,
        firebase_uid: uid,
        usedAt: serverTimestamp(),
        usedByUid: uid,
        usedByEmail: e,
      });

      // 5) Link su /users/{userId}
      const userRef = doc(db, "users", ticket.patientDocId);
      await updateDoc(userRef, {
        firebase_uid: uid,
        has_mobile_account: true,
        has_mobile_account_at: serverTimestamp(),
      });

      toast("success", "Account attivato ✅", "Ora puoi entrare normalmente.");
      setTimeout(() => router.replace("/sign-in"), 700);
    } catch (err: any) {
      // Se sei loggato ma qualcosa va storto (rules / ticket), meglio sloggare per non lasciare sessione sporca
      try {
        await signOut(auth);
      } catch {}

      // Messaggi utili
      const msg =
        err?.code === "auth/wrong-password"
          ? "Password errata per questa email. Se l’email è già registrata, devi usare la sua password."
          : err?.code === "permission-denied"
          ? "Permission denied: le Firestore Rules stanno bloccando la scrittura. (Aggiorna le rules activationTickets)."
          : err?.message || "Errore imprevisto.";

      toast("error", "Attivazione fallita", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.light1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* HERO */}
        <Animatable.View
          animation="fadeInDown"
          duration={650}
          style={styles.heroWrap}
        >
          <LinearGradient
            colors={[Colors.blue, Colors.turquoise]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroRow}>
              <Ionicons name="key-outline" size={22} color={Colors.white} />
              <Text style={styles.heroTitle}>Attiva account</Text>
            </View>
            <Text style={styles.heroSub}>
              Inserisci Ticket ID e Codice (monouso), poi crea la password.
            </Text>
          </LinearGradient>
        </Animatable.View>

        {/* CARD: Ticket */}
        <Animatable.View animation="fadeInUp" delay={120} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="ticket-outline" size={18} color={Colors.blue} />
            <Text style={styles.cardTitle}>Dati ticket</Text>
          </View>

          <Text style={styles.label}>Ticket ID</Text>
          <TextInput
            value={ticketId}
            onChangeText={setTicketId}
            placeholder="Es. 6lwkuv1hH5wnF3F0YqMI"
            placeholderTextColor={Colors.secondary}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Codice</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Es. 766390"
            placeholderTextColor={Colors.secondary}
            style={styles.input}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Animatable.View>

        {/* CARD: Credenziali */}
        <Animatable.View animation="fadeInUp" delay={180} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="person-circle-outline"
              size={18}
              color={Colors.green}
            />
            <Text style={styles.cardTitle}>Credenziali</Text>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="nome@dominio.it"
            placeholderTextColor={Colors.secondary}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password (min 6 caratteri)</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Crea (o inserisci) una password"
            placeholderTextColor={Colors.secondary}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Animatable.View>

        {/* ACTIONS */}
        <Animatable.View animation="fadeInUp" delay={240} style={styles.actions}>
          <PressableScaleWithRef
            disabled={!canSubmit}
            onPress={handleActivate}
            style={[styles.primaryBtn, { opacity: canSubmit ? 1 : 0.45 }]}
          >
            <LinearGradient
              colors={[Colors.blue, Colors.turquoise]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtnGradient}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color={Colors.white}
                  />
                  <Text style={styles.primaryBtnText}>Attiva</Text>
                </>
              )}
            </LinearGradient>
          </PressableScaleWithRef>

          <PressableScaleWithRef
            onPress={() => router.replace("/sign-in")}
            style={styles.secondaryBtn}
          >
            <Ionicons name="log-in-outline" size={18} color={Colors.gray1} />
            <Text style={styles.secondaryBtnText}>Ho già un account</Text>
          </PressableScaleWithRef>
        </Animatable.View>

        <Text style={styles.footerNote}>
          Nota: il ticket è monouso. Se hai problemi, contatta il medico.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 28 },

  heroWrap: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  hero: { padding: 16 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  heroTitle: { color: Colors.white, fontSize: 20, fontWeight: "700" },
  heroSub: {
    marginTop: 8,
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    lineHeight: 18,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light2,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    ...(FontStyles?.variants?.sectionTitle || {}),
    color: Colors.gray1,
  },

  label: {
    color: Colors.secondary,
    fontSize: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.light1,
    borderWidth: 1,
    borderColor: Colors.light2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: Colors.gray1,
    fontSize: 14,
  },

  actions: { marginTop: 6, gap: 10 },

  primaryBtn: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },
  primaryBtnGradient: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryBtnText: { color: Colors.white, fontWeight: "700", fontSize: 15 },

  secondaryBtn: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.light2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  secondaryBtnText: { color: Colors.gray1, fontWeight: "600", fontSize: 14 },

  footerNote: {
    marginTop: 14,
    color: Colors.secondary,
    fontSize: 12,
    textAlign: "center",
  },
});
