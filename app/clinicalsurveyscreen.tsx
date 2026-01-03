import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import * as Animatable from "react-native-animatable";
import { auth, db } from "../firebaseconfig";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import BottomNavigation from "../components/bottomnavigationnew";
import PressableScaleWithRef from "../components/PressableScaleWithRef";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { useRouter } from "expo-router";
import moment from "moment";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useFocusEffect } from "@react-navigation/native";
import { getPatientDocId } from "../utils/session";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

// ------------------------------------------------------
// TYPES
// ------------------------------------------------------
type SurveyKey = "mg_qol15" | "neuro_qol_fatigue" | "eq5d5l" | "mg_adl_paziente";

interface Survey {
  key: SurveyKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  href: string;
}

interface SurveyStatus {
  status: "completed" | "todo";
  date?: string;
}

// ------------------------------------------------------
// COMPONENT
// ------------------------------------------------------
export default function ClinicalSurveysScreen() {
  const insets = useSafeAreaInsets();

  const [statuses, setStatuses] = useState<Record<SurveyKey, SurveyStatus>>({
    mg_qol15: { status: "todo" },
    neuro_qol_fatigue: { status: "todo" },
    eq5d5l: { status: "todo" },
    mg_adl_paziente: { status: "todo" },
  });

  const [showQuarterBanner, setShowQuarterBanner] = useState(false);
  const [nextDueDate, setNextDueDate] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const router = useRouter();

  const surveys: Survey[] = [
    { key: "mg_qol15", label: "MG-QoL15r", icon: "heart", color: Colors.purple, href: "/mgqol15" },
    {
      key: "mg_adl_paziente",
      label: "MG-ADL",
      icon: "list",
      color: Colors.red,
      href: "/mgadlsurveyscreen",
    },
    {
      key: "neuro_qol_fatigue",
      label: "Neuro-QoL Fatigue",
      icon: "flash",
      color: Colors.blue,
      href: "/neuroqol-fatigue",
    },
    { key: "eq5d5l", label: "EQ-5D-5L", icon: "fitness", color: Colors.orange, href: "/eq5d5l" },
  ];

  // ------------------------------------------------------
  // NOTIFICA (solo mobile, silenziosa su web)
  // ------------------------------------------------------
  const triggerTherapyNotification = async () => {
    if (Platform.OS === "web") return;

    try {
      if (!Device.isDevice) return;
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Promemoria terapia trimestrale",
          body: "È il momento di rivedere la terapia per la MG e aggiornare i tuoi dati.",
          sound: true,
        },
        trigger: {
          seconds: 5, // test
          repeats: false,
        } as Notifications.TimeIntervalTriggerInput,
      });
    } catch (err) {
      console.log("Notification error:", err);
    }
  };

  // ------------------------------------------------------
  // FETCH FIRESTORE & CALCOLO ALERT (FIX: patientDocId)
  // ------------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const firebaseUid = auth.currentUser?.uid;
        if (!firebaseUid) return;

        const patientId = await getPatientDocId();
        if (!patientId) {
          console.log("❌ patientId non trovato (session).");
          return;
        }

        try {
          // --- Status per singolo survey ---
          const result: Record<SurveyKey, SurveyStatus> = {
            mg_qol15: { status: "todo" },
            neuro_qol_fatigue: { status: "todo" },
            eq5d5l: { status: "todo" },
            mg_adl_paziente: { status: "todo" },
          };

          for (const survey of surveys) {
            const ref = doc(db, "users", patientId, "clinical_surveys", survey.key);
            const snap = await getDoc(ref);

            if (snap.exists()) {
              const data = snap.data() as any;
              const lastMs = data.lastCompiledAt?.toDate?.()
                ? data.lastCompiledAt.toDate().getTime()
                : data.lastCompiledAt?.seconds
                  ? data.lastCompiledAt.seconds * 1000
                  : null;

              if (lastMs) {
                const lastDate = moment(lastMs).format("YYYY-MM-DD");
                const todayDate = moment().format("YYYY-MM-DD");
                result[survey.key] =
                  lastDate === todayDate
                    ? { status: "completed", date: moment(lastMs).format("DD/MM/YYYY") }
                    : { status: "todo" };
              }
            }
          }

          setStatuses(result);

          // --- Alert trimestrale globale ---
          const allDocsSnap = await getDocs(collection(db, "users", patientId, "clinical_surveys"));

          let latest: Date | null = null;
          allDocsSnap.forEach((docSnap) => {
            const data = docSnap.data() as any;
            const ts = data.lastCompiledAt?.toDate?.();
            if (ts && (!latest || ts > latest)) latest = ts;
          });

          if (!latest) {
            setShowQuarterBanner(false);
            setNextDueDate(null);
            setDaysRemaining(null);
            return;
          }

          const last = moment(latest);
          const now = moment();
          const diffMonths = now.diff(last, "months", true);
          const nextDue = last.clone().add(3, "months");
          const remaining = nextDue.diff(now, "days");

          setNextDueDate(nextDue.format("DD MMM YYYY"));
          setDaysRemaining(remaining);

          if (diffMonths >= 3 || remaining <= 7) {
            setShowQuarterBanner(true);
            await triggerTherapyNotification();
          } else {
            setShowQuarterBanner(false);
          }
        } catch (e: any) {
          console.log("❌ fetchData surveys error:", e?.message || e);
        }
      };

      fetchData();
    }, [])
  );

  // ------------------------------------------------------
  // COUNTDOWN dinamico (aggiorna ogni giorno)
  // ------------------------------------------------------
  useEffect(() => {
    if (daysRemaining === null) return;
    const timer = setInterval(() => {
      setDaysRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000 * 60 * 60 * 24);
    return () => clearInterval(timer);
  }, [daysRemaining]);

  // ------------------------------------------------------
  // UI
  // ------------------------------------------------------
  const completedCount = Object.values(statuses).filter((s) => s.status === "completed").length;

  // padding dinamico per non farsi coprire dal bottom nav
  const bottomPad = 56 + Math.max(insets.bottom, 10) + 18;

  return (
    <View style={styles.root}>
      {/* HEADER full-bleed (stile homenew) */}
      <View style={styles.headerWrapper}>
        <View style={styles.headerBleed}>
          <LinearGradient
            colors={[
              "rgba(125, 211, 252, 0.28)",
              "rgba(168, 85, 247, 0.18)",
              "rgba(94, 234, 212, 0.16)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFillObject} />

          {/* Fade verso lo sfondo pagina */}
          <LinearGradient
            colors={[
              "rgba(242,242,247,0)",
              "rgba(242,242,247,0.65)",
              "rgba(242,242,247,1)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.headerFade}
            pointerEvents="none"
          />

          <SafeAreaView edges={["top"]} style={styles.headerSafe}>
            <View style={styles.headerInner}>
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={FontStyles.variants.mainTitle}>Valutazioni cliniche</Text>
                  <Text style={[styles.headerSubtitle, FontStyles.variants.bodySemibold]}>Questionari</Text>
                </View>

                {/* Apple-like badge icon (ring + glass) */}
                <View style={styles.headerIconRing}>
                  <LinearGradient
                    colors={[
                      "rgba(125, 211, 252, 0.65)",
                      "rgba(168, 85, 247, 0.55)",
                      "rgba(94, 234, 212, 0.55)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerIconRingGradient}
                  >
                    <View style={styles.headerIconGlass}>
                      <Ionicons name="folder-open-outline" size={18} color={Colors.blue} />
                    </View>
                  </LinearGradient>
                </View>
              </View>

              <Text style={styles.headerDescription}>
                Compila regolarmente i questionari clinici per monitorare la tua condizione e supportare i clinici.
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </View>

      {/* Progress DOCK (fissa, non scrolla) */}
      <View style={styles.progressDock}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(completedCount / surveys.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{surveys.length} completati
          </Text>
        </View>
      </View>

      {/* Scroll SOLO per contenuti */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {showQuarterBanner && (
          <Animatable.View animation="fadeInDown" duration={700} style={styles.bannerContainer}>
            <Ionicons name="time-outline" size={22} color={Colors.orange} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Aggiornamento terapia trimestrale</Text>
              <Text style={styles.bannerText}>È il momento di rivedere la terapia con il tuo clinico.</Text>
              {nextDueDate && (
                <Text style={styles.bannerSub}>
                  {daysRemaining && daysRemaining > 0
                    ? `Prossimo controllo tra ${daysRemaining} giorni (${nextDueDate})`
                    : `Prossimo controllo: ${nextDueDate}`}
                </Text>
              )}
            </View>
          </Animatable.View>
        )}

        {surveys.map((survey, index) => {
          const status = statuses[survey.key]?.status;
          const date = statuses[survey.key]?.date;

          return (
            <Animatable.View animation="fadeInUp" delay={index * 100} key={survey.key}>
              <PressableScaleWithRef
                onPress={() => router.push(survey.href)}
                activeScale={0.96}
                weight="light"
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardRow}>
                    <Ionicons name={survey.icon} size={20} color={survey.color} />
                    <Text style={[FontStyles.variants.sectionTitle, { color: survey.color }]}>{survey.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.light3} />
                </View>

                <View style={styles.statusRow}>
                  <Ionicons
                    name={status === "completed" ? "checkmark-circle" : "reload-circle"}
                    size={18}
                    color={status === "completed" ? Colors.green : Colors.red}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[FontStyles.variants.cardDescription, styles.cardSub]}>
                    {status === "completed" ? `Completato (${date})` : "Da completare"}
                  </Text>
                </View>
              </PressableScaleWithRef>
            </Animatable.View>
          );
        })}
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light1 },

  // HEADER (Apple-like)
  headerWrapper: {
    backgroundColor: Colors.light1,
  },
  headerBleed: {
    overflow: "hidden",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  headerSafe: {
    backgroundColor: "transparent",
  },
  headerInner: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 16,
    color: Colors.gray3,
  },
  headerDescription: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.gray3,
    lineHeight: 18,
  },
  headerFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 44,
  },

  // Icon ring + glass
  headerIconRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },
  headerIconRingGradient: {
    flex: 1,
    borderRadius: 19,
    padding: 2, // ring thickness
  },
  headerIconGlass: {
    flex: 1,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Progress fixed dock
  progressDock: {
    backgroundColor: Colors.light1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBarBackground: {
    width: "100%",
    height: 10,
    backgroundColor: Colors.light3,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.green,
  },
  progressText: {
    fontSize: 12,
    color: Colors.gray3,
  },

  // Scroll
  scroll: { flex: 1, backgroundColor: Colors.light1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  // Banner
  bannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E9",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FFE0A3",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  bannerTitle: { fontSize: 15, fontWeight: "600", color: Colors.orange },
  bannerText: { fontSize: 13, color: Colors.gray3 },
  bannerSub: { fontSize: 12, color: Colors.secondary, marginTop: 2 },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  cardSub: { fontSize: 14, color: "#888" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
});
