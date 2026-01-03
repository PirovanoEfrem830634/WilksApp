import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import PressableScaleWithRef from "../components/PressableScaleWithRef";
import { auth, db } from "../firebaseconfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import BottomNavigation from "../components/bottomnavigationnew";
import { getPatientDocId } from "../utils/session";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Neuro-QoL Item Bank v1.0 – Fatigue (Italiano)
 * Scala: 1=Mai, 2=Raramente, 3=Qualche volta, 4=Spesso, 5=Sempre
 * Compilato dal paziente.
 */
const NEUROQOL_ITEMS = [
  { code: "NQFTG13", text: "Mi sono sentito/a esausto/a" },
  { code: "NQFTG11", text: "Mi sono sentito/a senza energie" },
  { code: "NQFTG15", text: "Mi sono sentito/a affaticato/a" },
  {
    code: "NQFTG06",
    text: "Mi sono sentito/a troppo stanco/a per occuparmi delle faccende domestiche",
  },
  {
    code: "NQFTG07",
    text: "Mi sono sentito/a troppo stanco/a per uscire di casa",
  },
  {
    code: "NQFTG10",
    text: "Ero frustrato/a perché ero troppo stanco/a per fare le cose che desideravo fare",
  },
  { code: "NQFTG14", text: "Mi sono sentito/a stanco/a" },
  {
    code: "NQFTG02",
    text: "Ho dovuto limitare la mia vita sociale perché mi sentivo stanco/a",
  },
  {
    code: "NQFTG01",
    text: "Ho avuto bisogno di aiuto per svolgere le mie attività abituali a causa del mio affaticamento",
  },
  { code: "NQFTG03", text: "Ho avuto bisogno di dormire durante il giorno" },
  {
    code: "NQFTG04",
    text: "Mi sono sentito/a così stanco/a che ho avuto difficoltà a iniziare qualunque cosa",
  },
  {
    code: "NQFTG05",
    text: "Mi sono sentito/a così stanco/a che ho avuto difficoltà a finire quello che avevo cominciato",
  },
  {
    code: "NQFTG08",
    text: "Mi sono sentito/a troppo stanco/a per fare una breve passeggiata",
  },
  { code: "NQFTG09", text: "Mi sono sentito/a troppo stanco/a per mangiare" },
  {
    code: "NQFTG12",
    text: "Mi sono sentito/a così stanco/a che ho avuto bisogno di riposarmi durante il giorno",
  },
  { code: "NQFTG16", text: "Mi sono sentito/a molto indebolito/a" },
  {
    code: "NQFTG17",
    text: "Ho avuto bisogno di aiuto per svolgere le mie attività abituali a causa della mia debolezza",
  },
  {
    code: "NQFTG18",
    text: "Ho dovuto limitare la mia vita sociale perché ero debole fisicamente",
  },
  {
    code: "NQFTG20",
    text: "Mi sono dovuto/a costringere ad alzarmi e fare qualcosa perché ero troppo debole fisicamente",
  },
];

const SCALE = ["Mai", "Raramente", "Qualche volta", "Spesso", "Sempre"] as const;
type ScaleLabel = (typeof SCALE)[number];

const labelToValue: Record<ScaleLabel, number> = {
  Mai: 1,
  Raramente: 2,
  "Qualche volta": 3,
  Spesso: 4,
  Sempre: 5,
};

export default function NeuroQoLFatigueScreen() {
  const insets = useSafeAreaInsets();

  const [answers, setAnswers] = useState<Record<string, ScaleLabel>>({});
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const totalScore = useMemo(() => {
    const values = Object.values(answers) as ScaleLabel[];
    return values.reduce((sum, label) => sum + labelToValue[label], 0);
  }, [answers]);

  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastColor, setToastColor] = useState<string>(Colors.blue);

  const showToast = (message: string, color: string = Colors.blue) => {
    setToastMessage(message);
    setToastColor(color);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => setToastMessage(null));
  };

  const handleSelect = (code: string, label: ScaleLabel) => {
    setAnswers((prev) => ({ ...prev, [code]: label }));
  };

  const saveSurvey = async () => {
    const firebaseUid = auth.currentUser?.uid;
    if (!firebaseUid) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    const patientId = await getPatientDocId();
    if (!patientId) {
      showToast("❌ Profilo paziente non trovato (session)", Colors.red);
      return;
    }

    if (Object.keys(answers).length !== NEUROQOL_ITEMS.length) {
      showToast("❌ Completa tutte le domande", Colors.red);
      return;
    }

    const ref = doc(db, "users", patientId, "clinical_surveys", "neuro_qol_fatigue");

    try {
      await setDoc(
        ref,
        {
          lastCompiledAt: Timestamp.now(),
          responses: answers,
          totalScore,
          source: "patient_app",
        },
        { merge: true }
      );
      showToast("✅ Survey salvata correttamente", Colors.blue);
    } catch (e: any) {
      console.log("❌ NeuroQoL save error:", e?.message || e);
      showToast("❌ Save failed", Colors.red);
    }
  };

  // BottomNavigation height (pattern progetto)
  const bottomNavH = 56;
  const safeBottom = Math.max(insets.bottom, 10);
  const scrollBottomPad = bottomNavH + safeBottom + 40;

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInUp" duration={600} style={{ flex: 1 }}>
        <LinearGradient
          colors={[Colors.turquoise, Colors.light1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBackground}
        />

        <View style={styles.header}>
          <Ionicons name="flash" size={48} color={Colors.blue} style={{ marginBottom: 10 }} />
          <Text style={FontStyles.variants.mainTitle}>Neuro-QoL Fatigue</Text>
          <Text style={[FontStyles.variants.sectionTitle, styles.subtitle]}>
            Negli ultimi 7 giorni, indica quanto ciascuna affermazione è stata vera per te.
          </Text>

          <View style={styles.progressWrap}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(answeredCount / NEUROQOL_ITEMS.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {answeredCount}/{NEUROQOL_ITEMS.length} Completati
            </Text>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>Punteggio totale</Text>
              <Text style={styles.badgeValue}>{totalScore}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollView,
            { paddingBottom: scrollBottomPad },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {NEUROQOL_ITEMS.map((item, idx) => (
            <Animatable.View key={item.code} animation="fadeInUp" delay={idx * 40}>
              <View style={styles.card}>
                <View style={styles.questionRow}>
                  <Ionicons name="help-circle" size={18} color={Colors.blue} style={{ marginRight: 8 }} />
                  <Text style={styles.questionText}>{item.text}</Text>
                </View>

                <View style={styles.optionColumn}>
                  {SCALE.map((label) => {
                    const selected = answers[item.code] === label;
                    return (
                      <PressableScaleWithRef
                        key={label}
                        onPress={() => handleSelect(item.code, label)}
                        weight="light"
                        activeScale={0.96}
                        style={[styles.optionFull, selected && styles.optionSelected]}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                          {label}
                        </Text>
                      </PressableScaleWithRef>
                    );
                  })}
                </View>
              </View>
            </Animatable.View>
          ))}

          <PressableScaleWithRef
            onPress={saveSurvey}
            weight="light"
            activeScale={0.96}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Invia</Text>
          </PressableScaleWithRef>
        </ScrollView>
      </Animatable.View>

      {toastMessage && (
        <Animated.View
          style={[
            styles.toast,
            {
              backgroundColor: toastColor,
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light1 },

  // Gradient hero top (NO zIndex negativo)
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    height: 180, // (puoi rimettere 160 se vuoi identico alle altre)
  },

  header: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  subtitle: {
    textAlign: "center",
    color: Colors.gray3,
    marginTop: 6,
  },

  progressWrap: { width: "90%", marginTop: 12, alignItems: "center" },
  progressBg: {
    width: "100%",
    height: 10,
    backgroundColor: Colors.light3,
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: Colors.blue },
  progressText: { fontSize: 12, color: Colors.gray3, marginTop: 6 },

  badgeRow: { marginTop: 10, alignItems: "center", justifyContent: "center" },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.light2,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgeLabel: { fontSize: 12, color: Colors.gray3, fontWeight: "500" },
  badgeValue: { fontSize: 14, color: Colors.blue, fontWeight: "700" },

  scrollView: { padding: 20 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },

  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray1,
    flexShrink: 1,
    flexWrap: "wrap",
    textAlign: "center",
  },

  optionColumn: { flexDirection: "column", alignItems: "stretch", gap: 8 },
  optionFull: {
    backgroundColor: Colors.light2,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  optionSelected: { backgroundColor: Colors.blue },
  optionText: { color: Colors.gray1, fontWeight: "600", textAlign: "center" },
  optionTextSelected: { color: Colors.white },

  submitButton: {
    backgroundColor: Colors.blue,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: { fontSize: 16, fontWeight: "600", color: Colors.white },

  toast: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
