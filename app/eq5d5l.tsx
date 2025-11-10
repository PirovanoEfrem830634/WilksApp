import React, { useRef, useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, Animated } from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import PressableScaleWithRef from "../components/PressableScaleWithRef";
import { auth, db } from "../firebaseconfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import BottomNavigation from "../components/bottomnavigationnew";

// ===== EQ-5D-5L (Italiano) =====
const DIMENSIONS = [
  {
    key: "mobility",
    icon: "walk" as const,
    label: "Capacità di movimento",
    levels: [
      "Non ho difficoltà nel camminare",
      "Ho lievi difficoltà nel camminare",
      "Ho moderate difficoltà nel camminare",
      "Ho gravi difficoltà nel camminare",
      "Non sono in grado di camminare",
    ],
  },
  {
    key: "selfCare",
    icon: "body" as const,
    label: "Cura della persona",
    levels: [
      "Non ho difficoltà nel lavarmi o vestirmi",
      "Ho lievi difficoltà nel lavarmi o vestirmi",
      "Ho moderate difficoltà nel lavarmi o vestirmi",
      "Ho gravi difficoltà nel lavarmi o vestirmi",
      "Non sono in grado di lavarmi o vestirmi",
    ],
  },
  {
    key: "usualActivities",
    icon: "briefcase" as const,
    label: "Attività abituali",
    levels: [
      "Non ho difficoltà nello svolgimento delle attività abituali",
      "Ho lievi difficoltà nello svolgimento delle attività abituali",
      "Ho moderate difficoltà nello svolgimento delle attività abituali",
      "Ho gravi difficoltà nello svolgimento delle attività abituali",
      "Non sono in grado di svolgere le mie attività abituali",
    ],
  },
  {
    key: "painDiscomfort",
    icon: "alert-circle" as const,
    label: "Dolore / Fastidio",
    levels: [
      "Non provo alcun dolore o fastidio",
      "Provo lieve dolore o fastidio",
      "Provo moderato dolore o fastidio",
      "Provo grave dolore o fastidio",
      "Provo estremo dolore o fastidio",
    ],
  },
  {
    key: "anxietyDepression",
    icon: "sad" as const,
    label: "Ansia / Depressione",
    levels: [
      "Non sono ansioso/a o depresso/a",
      "Sono lievemente ansioso/a o depresso/a",
      "Sono moderatamente ansioso/a o depresso/a",
      "Sono gravemente ansioso/a o depresso/a",
      "Sono estremamente ansioso/a o depresso/a",
    ],
  },
] as const;

type DimKey = typeof DIMENSIONS[number]["key"];
type Answers = Partial<Record<DimKey, string>>;

export default function EQ5D5LSurvey() {
  const [answers, setAnswers] = useState<Answers>({});
  const [vasScore, setVasScore] = useState<string>("");

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

  const handleAnswer = (key: DimKey, label: string) => {
    setAnswers((prev) => ({ ...prev, [key]: label }));
  };

  const saveSurvey = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "User not logged in");
      return;
    }
    if (Object.keys(answers).length !== DIMENSIONS.length) {
      showToast("❌ Completa tutte le sezioni");
      return;
    }
    const vas = Number(vasScore);
    if (!vasScore || isNaN(vas) || vas < 0 || vas > 100) {
      showToast("❌ VAS non valido: inserisci un valore 0–100");
      return;
    }

    const docRef = doc(db, `users/${uid}/clinical_surveys/eq5d5l`);
    try {
      await setDoc(docRef, {
        lastCompiledAt: Timestamp.now(),
        responses: {
          ...answers,     // ✅ TESTUALE per ogni dimensione
          vasScore: vas,  // ✅ numerico 0–100
        },
      });
      showToast("✅ Survey saved successfully");
    } catch (err: any) {
      showToast("❌ Save failed");
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInUp" duration={600} style={{ flex: 1 }}>
        <LinearGradient
          colors={["#FFD6BA", Colors.light1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBackground}
        />

        <View style={styles.mainHeader}>
          <Ionicons name="fitness" size={48} color={Colors.orange} style={{ marginBottom: 10 }} />
          <Text style={FontStyles.variants.mainTitle}>EQ-5D-5L</Text>
          <Text style={[FontStyles.variants.sectionTitle, styles.subtitle]}>
            Indichi la sua salute OGGI per ciascuna dimensione e inserisca il valore VAS (0–100).
          </Text>

        <View style={styles.progressWrap}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(answeredCount / DIMENSIONS.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{answeredCount}/{DIMENSIONS.length} Completati</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollView}>
          {DIMENSIONS.map((dim, idx) => {
            const selected = answers[dim.key];
            return (
              <Animatable.View key={dim.key} animation="fadeInUp" delay={idx * 40}>
                <View style={styles.card}>
                  <View style={styles.questionRow}>
                    <Ionicons name={dim.icon} size={18} color={Colors.orange} style={{ marginRight: 8 }} />
                    <Text style={styles.questionText}>{dim.label}</Text>
                  </View>

                  {/* ✅ Pill full-width con wrapping del testo */}
                  <View style={styles.optionColumn}>
                    {dim.levels.map((label) => (
                      <PressableScaleWithRef
                        key={label}
                        onPress={() => handleAnswer(dim.key, label)}
                        weight="light"
                        activeScale={0.96}
                        style={[styles.optionFull, selected === label && styles.optionSelected]}
                      >
                        <Text style={[styles.optionText, selected === label && styles.optionTextSelected]}>
                          {label}
                        </Text>
                      </PressableScaleWithRef>
                    ))}
                  </View>
                </View>
              </Animatable.View>
            );
          })}

          {/* === VAS === */}
          <View style={styles.card}>
            <View style={styles.questionRow}>
              <Ionicons name="speedometer" size={18} color={Colors.orange} style={{ marginRight: 8 }} />
              <Text style={styles.questionText}>VAS (0–100) – La sua salute oggi</Text>
            </View>
            <Text style={styles.helperText}>
              0 = la peggiore salute che può immaginare{"\n"}
              100 = la migliore salute che può immaginare.{"\n"}
              Inserisca un numero intero tra 0 e 100 che rappresenta come si sente OGGI.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Es. 75"
              keyboardType="numeric"
              maxLength={3}
              value={vasScore}
              onChangeText={setVasScore}
            />
          </View>

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
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>{toastMessage}</Text>
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

  mainHeader: { alignItems: "center", marginTop: 32, marginBottom: 20, paddingHorizontal: 20 },
  subtitle: { textAlign: "center", color: Colors.gray3, marginTop: 6 },

  // progresso
  progressWrap: { width: "90%", marginTop: 12, alignItems: "center" },
  progressBg: {
    width: "100%", height: 10, backgroundColor: Colors.light3, borderRadius: 10, overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: Colors.orange },
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

  // titoli centrati
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

  // ✅ colonna: ogni opzione è full-width e va a capo se lunga
  optionColumn: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 8,
  },
  optionFull: {
    backgroundColor: Colors.light2,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionSelected: { backgroundColor: Colors.orange },
  optionText: { color: Colors.gray1, fontWeight: "600", textAlign: "center" },
  optionTextSelected: { color: "#fff" },

  // VAS
  helperText: {
    color: Colors.gray3,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  input: {
    backgroundColor: Colors.light2,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.gray1,
    textAlign: "center",
  },

  submitButton: {
    backgroundColor: Colors.orange,
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

  toast: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: Colors.orange,
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
});
