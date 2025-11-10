import React, { useRef, useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Animated } from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "react-native-pressable-scale";
import { auth, db } from "../firebaseconfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import BottomNavigation from "../components/bottomnavigationnew";

// ===== MG-QoL15r =====
// Scala: 0=Per niente, 1=Abbastanza, 2=Molto (compilato dal paziente)
// Riferimento: MG-QOL15r (ITA). 
const QUESTIONS = [
  "Sono frustrato/a a causa della MG",
  "Ho problemi agli occhi a causa della MG (ad es., visione doppia)",
  "Ho problemi a mangiare a causa della MG",
  "Ho limitato la mia attività sociale a causa della MG",
  "La MG limita la mia capacità di godere dei miei hobby e attività di svago",
  "Ho problemi a provvedere alle necessità dei miei familiari a causa della MG",
  "Per pianificare qualsiasi cosa devo tenere conto della MG",
  "Sono infastidito/a dalle limitazioni che la MG mi impone nello svolgimento del mio lavoro (inclusi i lavori domestici)",
  "Ho difficoltà a parlare a causa della MG",
  "Ho perso un po’ di indipendenza personale a causa della MG (ad es. guidare, fare la spesa, sbrigare commissioni)",
  "Sono depresso/a per la mia MG",
  "Ho problemi a camminare a causa della MG",
  "Ho difficoltà a recarmi e muovermi in luoghi pubblici a causa della MG",
  "Mi sento sopraffatto/a dalla MG",
  "Ho problemi a dedicarmi alla cura della mia persona a causa della MG",
];

const SCALE = ["Per niente", "Abbastanza", "Molto"] as const;
type ScaleLabel = (typeof SCALE)[number];
const labelToValue: Record<ScaleLabel, number> = { "Per niente": 0, "Abbastanza": 1, "Molto": 2 };

export default function MGQoL15Survey() {
  // risposte testuali per item (Q01..Q15) + calcolo totalScore numerico
  const [answers, setAnswers] = useState<Record<string, ScaleLabel>>({});
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

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

  const handleAnswer = (qKey: string, label: ScaleLabel) => {
    setAnswers((prev) => ({ ...prev, [qKey]: label }));
  };

  const saveSurvey = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }
    // validazione: tutte le 15 domande
    if (Object.keys(answers).length !== QUESTIONS.length) {
      showToast("❌ Completa tutte le domande");
      return;
    }

    const totalScore = (Object.values(answers) as ScaleLabel[]).reduce(
      (sum, label) => sum + labelToValue[label],
      0
    );

    const uid = user.uid;
    const docRef = doc(db, `users/${uid}/clinical_surveys/mg_qol15`);
    try {
      await setDoc(docRef, {
        lastCompiledAt: Timestamp.now(),
        responses: answers, // ✅ testuale ("Per niente", "Abbastanza", "Molto")
        totalScore,         // ✅ numerico (0–30)
      });
      showToast("✅ Survey saved successfully");
    } catch (err: any) {
      showToast("❌ Error: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInUp" duration={600} style={{ flex: 1 }}>
        <LinearGradient
          colors={["#EFD9FF", Colors.light1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBackground}
        />

        <View style={styles.mainHeader}>
          <Ionicons name="heart" size={48} color={Colors.purple} style={{ marginBottom: 10 }} />
          <Text style={FontStyles.variants.mainTitle}>MG-QoL15r</Text>
          <Text style={[FontStyles.variants.sectionTitle, styles.subtitle]}>
            Indichi in quale misura ogni affermazione è risultata vera (ultime settimane).
          </Text>

          <View style={styles.progressWrap}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(answeredCount / QUESTIONS.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{answeredCount}/{QUESTIONS.length} Completati</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollView}>
          {QUESTIONS.map((q, index) => {
            const qKey = `Q${String(index + 1).padStart(2, "0")}`;
            const selected = answers[qKey];

            return (
              <Animatable.View key={qKey} animation="fadeInUp" delay={index * 40}>
                <View style={styles.card}>
                  <View style={styles.questionRow}>
                    <Ionicons name="help-circle" size={18} color={Colors.purple} style={{ marginRight: 8 }} />
                    <Text style={styles.questionText}>{q}</Text>
                  </View>

                  <View style={styles.optionRow}>
                    {SCALE.map((label) => (
                      <PressableScale
                        key={label}
                        onPress={() => handleAnswer(qKey, label)}
                        weight="light"
                        activeScale={0.96}
                        style={[styles.option, selected === label && styles.optionSelected]}
                      >
                        <Text style={[styles.optionText, selected === label && styles.optionTextSelected]}>
                          {label}
                        </Text>
                      </PressableScale>
                    ))}
                  </View>
                </View>
              </Animatable.View>
            );
          })}

          <PressableScale
            onPress={saveSurvey}
            weight="light"
            activeScale={0.96}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Invia</Text>
          </PressableScale>
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
  gradientBackground: { position: "absolute", top: 0, left: 0, right: 0, height: 160, zIndex: -1 },
  scrollView: { padding: 20, paddingBottom: 100 },

  mainHeader: { alignItems: "center", marginTop: 32, marginBottom: 16, paddingHorizontal: 20 },
  subtitle: { textAlign: "center", color: Colors.gray3, marginTop: 6 },
  progressWrap: { width: "90%", marginTop: 12, alignItems: "center" },
  progressBg: { width: "100%", height: 10, backgroundColor: Colors.light3, borderRadius: 10, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: Colors.purple },
  progressText: { fontSize: 12, color: Colors.gray3, marginTop: 6 },

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
  // ✅ titoli centrati
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
  // ✅ pill centrali in riga
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginHorizontal: -4,
    marginTop: 4,
  },
  option: {
    backgroundColor: Colors.light2,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  optionSelected: { backgroundColor: Colors.purple },
  optionText: { color: Colors.gray1, fontWeight: "600" },
  optionTextSelected: { color: "#fff" },

  submitButton: {
    backgroundColor: Colors.purple,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },

  toast: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: Colors.purple,
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
