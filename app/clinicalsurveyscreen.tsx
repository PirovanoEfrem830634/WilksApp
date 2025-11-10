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

// ------------------------------------------------------
// TYPES
// ------------------------------------------------------
type SurveyKey = "mg_qol15" | "neuro_qol_fatigue" | "eq5d5l";

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
  const [statuses, setStatuses] = useState<Record<SurveyKey, SurveyStatus>>({
    mg_qol15: { status: "todo" },
    neuro_qol_fatigue: { status: "todo" },
    eq5d5l: { status: "todo" },
  });
  const [showQuarterBanner, setShowQuarterBanner] = useState(false);
  const [nextDueDate, setNextDueDate] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const router = useRouter();

  const surveys: Survey[] = [
    { key: "mg_qol15", label: "MG-QoL15r", icon: "heart", color: Colors.purple, href: "/mgqol15" },
    { key: "neuro_qol_fatigue", label: "Neuro-QoL Fatigue", icon: "flash", color: Colors.blue, href: "/neuroqol-fatigue" },
    { key: "eq5d5l", label: "EQ-5D-5L", icon: "fitness", color: Colors.orange, href: "/eq5d5l" },
  ];

  // ------------------------------------------------------
  // FETCH FIRESTORE & CALCOLO ALERT
  // ------------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const result: Record<SurveyKey, SurveyStatus> = { ...statuses };
        for (const survey of surveys) {
          const ref = doc(db, `users/${uid}/clinical_surveys/${survey.key}`);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data() as any;
            const last = data.lastCompiledAt?.seconds
              ? data.lastCompiledAt.seconds * 1000
              : null;
            if (last) {
              const lastDate = moment(last).format("YYYY-MM-DD");
              const todayDate = moment().format("YYYY-MM-DD");
              result[survey.key] =
                lastDate === todayDate
                  ? { status: "completed", date: moment(last).format("DD/MM/YYYY") }
                  : { status: "todo" };
            }
          }
        }
        setStatuses(result);

        // --- Calcola alert trimestrale globale ---
        const allDocs = await getDocs(collection(db, `users/${uid}/clinical_surveys`));
        let latest: Date | null = null;
        allDocs.forEach((docSnap) => {
          const data = docSnap.data() as any;
          const ts = data.lastCompiledAt?.toDate?.();
          if (ts && (!latest || ts > latest)) latest = ts;
        });

        if (!latest) return;

        const last = moment(latest);
        const now = moment();
        const diffMonths = now.diff(last, "months", true);
        const nextDue = last.clone().add(3, "months");
        const remaining = nextDue.diff(now, "days");

        setNextDueDate(nextDue.format("DD MMM YYYY"));
        setDaysRemaining(remaining);

        if (diffMonths >= 3 || remaining <= 7) {
          setShowQuarterBanner(true);
          await triggerTherapyNotification(); // invia notifica solo su mobile
        } else {
          setShowQuarterBanner(false);
        }
      };

      fetchData();
    }, [])
  );

  // ------------------------------------------------------
  // NOTIFICA (solo mobile, silenziosa su web)
  // ------------------------------------------------------
  const triggerTherapyNotification = async () => {
    if (Platform.OS === "web") return; // evita crash su browser

    try {
      if (!Device.isDevice) return;
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Quarterly Therapy Reminder",
          body: "It’s time to review your MG therapy and update your records.",
          sound: true,
        },
        trigger: {
          seconds: 5, // solo per test interno, cambierà in produzione
          repeats: false,
        } as Notifications.TimeIntervalTriggerInput,
      });
    } catch (err) {
      console.log("Notification error:", err);
    }
  };

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
  const completedCount = Object.values(statuses).filter(
    (s) => s.status === "completed"
  ).length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* ===== Banner trimestrale ===== */}
        {showQuarterBanner && (
          <Animatable.View
            animation="fadeInDown"
            duration={700}
            style={styles.bannerContainer}
          >
            <Ionicons
              name="time-outline"
              size={24}
              color={Colors.orange}
              style={{ marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Quarterly Therapy Update</Text>
              <Text style={styles.bannerText}>
                It’s time to review your therapy with your clinician.
              </Text>
              {nextDueDate && (
                <Text style={styles.bannerSub}>
                  {daysRemaining && daysRemaining > 0
                    ? `Next check in ${daysRemaining} days (${nextDueDate})`
                    : `Next check: ${nextDueDate}`}
                </Text>
              )}
            </View>
          </Animatable.View>
        )}

        {/* ===== Header ===== */}
        <View style={styles.headerCentered}>
          <Ionicons
            name="clipboard"
            size={42}
            color={Colors.blue}
            style={{ marginBottom: 10 }}
          />
          <Text style={FontStyles.variants.mainTitle}>Clinical Evaluations</Text>
          <Text style={styles.description}>
            Complete the clinical surveys regularly to track your condition and
            help your medical team.
          </Text>
        </View>

        {/* ===== Progress bar ===== */}
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
            {completedCount}/{surveys.length} Completed
          </Text>
        </View>

        {/* ===== Survey cards ===== */}
        {surveys.map((survey, index) => {
          const status = statuses[survey.key]?.status;
          const date = statuses[survey.key]?.date;
          return (
            <Animatable.View
              animation="fadeInUp"
              delay={index * 100}
              key={survey.key}
            >
              <PressableScaleWithRef
                onPress={() => router.push(survey.href)}
                activeScale={0.96}
                weight="light"
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardRow}>
                    <Ionicons name={survey.icon} size={20} color={survey.color} />
                    <Text
                      style={[
                        FontStyles.variants.sectionTitle,
                        { color: survey.color },
                      ]}
                    >
                      {survey.label}
                    </Text>
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
                  <Text
                    style={[FontStyles.variants.cardDescription, styles.cardSub]}
                  >
                    {status === "completed"
                      ? `Completed (${date})`
                      : "To complete"}
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

// ------------------------------------------------------
// STILI
// ------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light1 },
  bannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E9",
    borderRadius: 20,
    padding: 14,
    marginBottom: 18,
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
  headerCentered: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.gray3,
    marginTop: 6,
    textAlign: "center",
  },
  progressContainer: { marginBottom: 20, alignItems: "center" },
  progressBarBackground: {
    width: "100%",
    height: 10,
    backgroundColor: Colors.light3,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarFill: { height: "100%", backgroundColor: Colors.green },
  progressText: { fontSize: 12, color: Colors.gray3 },
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
