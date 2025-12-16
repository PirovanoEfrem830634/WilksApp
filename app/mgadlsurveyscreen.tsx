import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { auth, db } from "../firebaseconfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import * as Animatable from "react-native-animatable";
import BottomNavigation from "../components/bottomnavigationnew";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import PressableScaleWithRef from "../components/PressableScaleWithRef";
import { Ionicons } from "@expo/vector-icons";
import { getPatientDocId } from "../utils/session";

// ===== MG-ADL (paziente) =====
const MGADL_ITEMS = [
  {
    label: "Linguaggio",
    icon: "mic" as const,
    levels: [
      "0 = Normale",
      "1 = Biascicamento/voce nasale intermittente",
      "2 = Biascicamento/voce nasale continuo/a ma comprensibile",
      "3 = Linguaggio difficile da comprendere",
    ],
  },
  {
    label: "Masticazione",
    icon: "restaurant" as const,
    levels: [
      "0 = Normale",
      "1 = Faticosa con cibo solido",
      "2 = Faticosa con cibo morbido",
      "3 = Necessaria sonda gastrica",
    ],
  },
  {
    label: "Deglutizione",
    icon: "water" as const,
    levels: [
      "0 = Normale",
      "1 = Rari episodi di soffocamento",
      "2 = Frequenti soffocamenti con modifiche alla dieta",
      "3 = Necessaria sonda gastrica",
    ],
  },
  {
    label: "Respirazione",
    icon: "cloud" as const,
    levels: [
      "0 = Normale",
      "1 = Respiro corto sotto sforzo",
      "2 = Respiro corto a riposo",
      "3 = Dipendenza dal ventilatore",
    ],
  },
  {
    label: "Lavarsi i denti / pettinarsi",
    icon: "body" as const,
    levels: [
      "0 = Nessuna difficoltà",
      "1 = Aumenta lo sforzo ma senza pause",
      "2 = Necessita di pause",
      "3 = Non riesce a eseguire una di queste attività",
    ],
  },
  {
    label: "Alzarsi da una sedia",
    icon: "walk" as const,
    levels: [
      "0 = Nessuna difficoltà",
      "1 = Lieve, talvolta usa le braccia",
      "2 = Moderata, usa sempre le braccia",
      "3 = Grave, necessita di assistenza",
    ],
  },
  {
    label: "Visione doppia (Diplopia)",
    icon: "eye" as const,
    levels: [
      "0 = Nessuna",
      "1 = Capita ma non tutti i giorni",
      "2 = Tutti i giorni ma non costante",
      "3 = Costante",
    ],
  },
  {
    label: "Ptosi (palpebra abbassata)",
    icon: "eye-off" as const,
    levels: [
      "0 = Nessuna",
      "1 = Capita ma non tutti i giorni",
      "2 = Tutti i giorni ma non costante",
      "3 = Costante",
    ],
  },
];

export default function MGADLSurvey() {
  // 0–3 per ciascun item, default 0 = livello “normale”
  const [answers, setAnswers] = useState<number[]>(
    Array(MGADL_ITEMS.length).fill(0)
  );

  const totalScore = useMemo(
    () => answers.reduce((sum, v) => sum + v, 0),
    [answers]
  );

  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setToastMessage(null));
  };

  const handleAnswer = (index: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const saveSurvey = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    const patientId = await getPatientDocId();
    if (!patientId) {
      showToast("❌ Profilo paziente non trovato (session)");
      return;
    }

    const docRef = doc(db, "users", patientId, "clinical_surveys", "mg_adl_paziente");

    try {
      await setDoc(
        docRef,
        {
          answers, // array numerico 0–3
          totalScore, // utile lato CDSS/analytics
          lastCompiledAt: Timestamp.now(),
          source: "patient_app",
        },
        { merge: true }
      );
      showToast("✅ Survey salvata correttamente");
    } catch (err: any) {
      console.log("❌ MG-ADL save error:", err?.message || err);
      showToast("❌ Error: " + (err?.message ?? "Save failed"));
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInUp" duration={600} style={{ flex: 1 }}>
        <LinearGradient
          colors={["#d0929bff", Colors.light1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBackground}
        />

        <View style={styles.mainHeader}>
          <Ionicons name="list" size={48} color={Colors.red} style={{ marginBottom: 10 }} />
          <Text style={FontStyles.variants.mainTitle}>MG-ADL</Text>
          <Text style={[FontStyles.variants.sectionTitle, styles.subtitle]}>
            Indichi il livello per ciascun item MG-ADL
          </Text>

          <Text style={styles.disclaimer}>
            Le risposte devono riflettere come{"\n"}si è sentito negli{" "}
            <Text style={{ fontWeight: "700" }}>ultimi 7 giorni</Text>.
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>Punteggio totale</Text>
              <Text style={styles.badgeValue}>{totalScore}/24</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollView}>
          {MGADL_ITEMS.map((item, index) => {
            const selected = answers[index]; // 0–3
            return (
              <Animatable.View key={item.label} animation="fadeInUp" delay={index * 40}>
                <View style={styles.card}>
                  <View style={styles.questionRow}>
                    <Ionicons name={item.icon} size={18} color={Colors.red} style={{ marginRight: 8 }} />
                    <Text style={styles.questionText}>{item.label}</Text>
                  </View>

                  <View style={styles.optionColumn}>
                    {item.levels.map((levelText, lvlIndex) => (
                      <PressableScaleWithRef
                        key={levelText}
                        onPress={() => handleAnswer(index, lvlIndex)}
                        weight="light"
                        activeScale={0.96}
                        style={[
                          styles.optionFull,
                          selected === lvlIndex && styles.optionSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selected === lvlIndex && styles.optionTextSelected,
                          ]}
                        >
                          {levelText}
                        </Text>
                      </PressableScaleWithRef>
                    ))}
                  </View>
                </View>
              </Animatable.View>
            );
          })}

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
          <Text style={{ color: "#fff", fontWeight: "600" }}>{toastMessage}</Text>
        </Animated.View>
      )}

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light1 },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    zIndex: -1,
  },
  scrollView: { padding: 20, paddingBottom: 100 },

  mainHeader: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  subtitle: { textAlign: "center", color: Colors.gray3, marginTop: 6 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    textAlign: "center",
    flexShrink: 1,
    flexWrap: "wrap",
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
  optionSelected: { backgroundColor: Colors.red },
  optionText: { color: Colors.gray1, fontWeight: "600", textAlign: "center" },
  optionTextSelected: { color: "#fff" },

  submitButton: {
    backgroundColor: Colors.red,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },

  disclaimer: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.gray3,
    textAlign: "center",
  },

  badgeRow: { marginTop: 14, alignItems: "center", justifyContent: "center" },
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
  badgeValue: { fontSize: 14, color: Colors.red, fontWeight: "700" },

  toast: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: Colors.red,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
