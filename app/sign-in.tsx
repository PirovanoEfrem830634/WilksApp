import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from "react-native";
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
import { Ionicons } from "@expo/vector-icons";
import { setPatientDocId } from "../utils/session";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ UX states
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // ✅ Inline error banner (invece di solo console)
  const [uiError, setUiError] = useState<string | null>(null);

  const router = useRouter();
  const navigation = useNavigation();

  // Micro-animazioni (Apple-like)
  const enterOpacity = useRef(new Animated.Value(0)).current;
  const enterY = useRef(new Animated.Value(10)).current;
  const shakeX = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // 🔐 AUTO-LOGOUT: ogni volta che entro nella schermata SignIn
  useEffect(() => {
    signOut(auth)
      .then(() => console.log("Auto-logout eseguito all'avvio di SignIn"))
      .catch((err) => {
        console.log("Errore durante l'auto-logout (puoi ignorarlo in dev):", err);
      });
  }, []);

  // ✅ Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(enterOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(enterY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [enterOpacity, enterY]);

  const normalizeEmail = (s: string) => (s || "").trim().toLowerCase();

  const triggerShake = () => {
    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const setError = (msg: string) => {
    setUiError(msg);
    triggerShake();
  };

  const clearError = () => setUiError(null);

  const handleSignIn = async () => {
    if (loading) return;

    clearError();

    const safeEmail = normalizeEmail(email);
    const safePwd = password;

    if (!safeEmail || !safeEmail.includes("@")) {
      setError("Inserisci un’email valida.");
      return;
    }
    if (!safePwd) {
      setError("Inserisci la password.");
      return;
    }

    try {
      setLoading(true);

      // 1) Login su Firebase Auth
      const { user } = await signInWithEmailAndPassword(auth, safeEmail, safePwd);

      if (!user.email) {
        setError("L'account non ha un'email valida.");
        return;
      }

      // 2) Cerca il documento paziente tramite EMAIL
      const q = query(collection(db, "users"), where("email", "==", user.email));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError(
          "Non risulta alcun profilo paziente associato a questa email. Contatta il tuo medico."
        );
        return;
      }

      const patientDoc = snap.docs[0];
      await setPatientDocId(patientDoc.id);
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

      // ✅ Messaggi più chiari + banner inline
      const code = err?.code || "";
      if (code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Email o password non corretti.");
      } else if (code === "auth/invalid-email") {
        setError("Formato email non valido.");
      } else if (code === "auth/too-many-requests") {
        setError("Troppi tentativi. Riprova tra qualche minuto.");
      } else if (code === "auth/network-request-failed") {
        setError("Connessione assente. Controlla la rete e riprova.");
      } else {
        setError("Problema temporaneo o permessi mancanti. Riprova tra poco.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Animated.View
          style={{
            opacity: enterOpacity,
            transform: [{ translateY: enterY }],
            alignItems: "center",
            width: "100%",
          }}
        >
          <Image source={require("../assets/images/Wilks-logo3x.png")} style={styles.logo} />
          <Text style={styles.brandTitle}>Wilks</Text>

          <Animated.View style={[styles.glassCard, { transform: [{ translateX: shakeX }] }]}>
            <Text style={styles.title}>Sign In</Text>

            {/* ✅ Inline error banner */}
            {!!uiError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#B42318" />
                <Text style={styles.errorText}>{uiError}</Text>
                <Pressable onPress={clearError} hitSlop={10} style={styles.errorClose}>
                  <Ionicons name="close" size={16} color="#B42318" />
                </Pressable>
              </View>
            )}

            {/* Email */}
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color="#6B7280" style={styles.leftIcon} />
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (uiError) clearError();
                }}
                style={styles.input}
                placeholderTextColor="#8A8A8A"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrap}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#6B7280"
                style={styles.leftIcon}
              />
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (uiError) clearError();
                }}
                secureTextEntry={!showPwd}
                style={styles.input}
                placeholderTextColor="#8A8A8A"
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
              <Pressable
                onPress={() => setShowPwd((p) => !p)}
                hitSlop={10}
                style={styles.rightIconBtn}
              >
                <Ionicons
                  name={showPwd ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#6B7280"
                />
              </Pressable>
            </View>

            {/* CTA */}
            <Pressable
              onPress={handleSignIn}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                loading && { opacity: 0.6 },
                pressed && !loading && { transform: [{ scale: 0.99 }] },
              ]}
            >
              <Text style={styles.buttonText}>{loading ? "Accesso..." : "Sign In"}</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("#")}
              style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.linkText}>Forgot Password?</Text>
            </Pressable>

            {/* ❌ RIMOSSO SIGN-UP */}
            <Text style={styles.footerMsg}>Per attivare l'account contatta il tuo medico.</Text>
          </Animated.View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F7", // più Apple-like
    paddingHorizontal: 16,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
    resizeMode: "contain",
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1C1C1E",
    marginBottom: 18,
    letterSpacing: -0.2,
  },
  glassCard: {
    width: "100%",
    maxWidth: 440,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(229, 229, 234, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1C1C1E",
    marginBottom: 14,
    letterSpacing: -0.2,
  },

  // ✅ error banner
  errorBanner: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FEF3F2",
    borderWidth: 1,
    borderColor: "#FEE4E2",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#B42318",
    lineHeight: 18,
    marginTop: 1,
  },
  errorClose: {
    width: 26,
    height: 26,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // ✅ input row (no extra cards, solo input più puliti)
  inputWrap: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  leftIcon: { marginRight: 10 },
  rightIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1C1C1E",
  },

  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#007AFF",
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  linkBtn: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  linkText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "700",
  },
  footerMsg: {
    marginTop: 10,
    fontSize: 13,
    color: "#6e6e73",
    textAlign: "center",
    lineHeight: 18,
  },
});
