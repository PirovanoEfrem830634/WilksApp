import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import { auth, db } from "../firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import BottomNavigation from "../components/bottomnavigationnew";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { router, Link } from "expo-router";
import PressableScaleWithRef from "../components/PressableScaleWithRef";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { getPatientDocId } from "../utils/session";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

export default function homenew() {
  const insets = useSafeAreaInsets();

  const [summary, setSummary] = useState<SummaryData>({
    nextMedication: null,
    sleep: null,
    mood: null,
    fatigue: null,
    dietStatus: null,
    realSleepHours: null,
  });

  const formatSleepDuration = (hoursFloat: number) => {
    const hours = Math.floor(hoursFloat);
    const minutes = Math.round((hoursFloat - hours) * 60);
    return `${hours} h ${minutes} min`;
  };

  interface SummaryData {
    nextMedication: string | null;
    sleep: string | null;
    mood: string | null;
    fatigue: number | null;
    dietStatus: string | null;
    realSleepHours: number | null;
  }

  useFocusEffect(
    useCallback(() => {
      const fetchSummary = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const patientId = await getPatientDocId();
        if (!patientId) return;

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        const currentMinutes = today.getHours() * 60 + today.getMinutes();
        const dayName = today.toLocaleString("en-US", { weekday: "short" });

        // 1. Medications
        const medsRef = collection(db, "users", patientId, "medications");
        const medsSnap = await getDocs(medsRef);
        let nextMed = null;
        const upcomingMeds: { name: string; time: string }[] = [];

        medsSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (data.days?.includes(dayName)) {
            data.times?.forEach((time: string) => {
              const [h, m] = time.split(":").map(Number);
              const total = h * 60 + m;
              if (total >= currentMinutes) {
                upcomingMeds.push({ name: data.name, time });
              }
            });
          }
        });

        if (upcomingMeds.length > 0) {
          upcomingMeds.sort((a, b) => {
            const [h1, m1] = a.time.split(":").map(Number);
            const [h2, m2] = b.time.split(":").map(Number);
            return h1 * 60 + m1 - (h2 * 60 + m2);
          });
          nextMed = `${upcomingMeds[0].name} alle ${upcomingMeds[0].time}`;
        }

        // 2. Symptoms (last entry)
        const symptomsRef = collection(db, "users", patientId, "symptoms");
        const symptomsSnap = await getDocs(symptomsRef);
        let latest = null;

        if (!symptomsSnap.empty) {
          latest = symptomsSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.id > b.id ? -1 : 1))[0];
        }

        // 3. Sleep
        const sleepRef = collection(db, "users", patientId, "sleep");
        const sleepSnap = await getDocs(sleepRef);
        const latestSleep = sleepSnap.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as { createdAt?: any; hours?: number }),
          }))
          .sort((a, b) => {
            const aDate = a.createdAt?.seconds
              ? new Date(a.createdAt.seconds * 1000)
              : new Date(a.id);
            const bDate = b.createdAt?.seconds
              ? new Date(b.createdAt.seconds * 1000)
              : new Date(b.id);
            return bDate.getTime() - aDate.getTime();
          })[0];

        const realSleepHours = latestSleep?.hours ?? null;

        // 4. Diet
        const dietRef = collection(db, "users", patientId, "diet");
        const dietSnap = await getDocs(dietRef);
        const dietToday = dietSnap.docs.find((doc) => doc.id === todayStr);
        const dietStatus = dietToday ? "Completato" : "Da compilare";

        setSummary({
          nextMedication: nextMed,
          sleep: (latest as any)?.sonno || null,
          mood: (latest as any)?.umore || null,
          fatigue: (latest as any)?.affaticamentoMuscolare ?? null,
          dietStatus,
          realSleepHours,
        });
      };

      fetchSummary();
    }, [])
  );

  // Bottom padding dinamico per evitare che BottomNavigation copra l’ultima card
  const bottomPad = 56 + Math.max(insets.bottom, 10) + 18;

  return (
    <View style={styles.root}>
      {/* HEADER full-bleed: gradient fino al bordo alto + blur + fade-to-background */}
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

          {/* Blur overlay (Apple-like) */}
          <BlurView
            intensity={35}
            tint="light"
            style={StyleSheet.absoluteFillObject}
          />

          {/* ✅ Metodo 1: Fade verso lo sfondo pagina (mash) */}
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

          {/* Contenuto dentro safe area, ma lo sfondo resta edge-to-edge */}
          <SafeAreaView edges={["top"]} style={styles.headerSafe}>
            <View style={styles.headerInner}>
              <View style={styles.headerRow}>
                <Text style={FontStyles.variants.mainTitle}>Sommario</Text>

                <Link href="/profilenew" asChild>
                  <Pressable>
                    <Image
                      source={require("../assets/images/avatar-ios.jpg")}
                      style={styles.avatar}
                    />
                  </Pressable>
                </Link>
              </View>

              <Text style={[styles.todayLabel, FontStyles.variants.bodySemibold]}>
                Oggi
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </View>

      {/* Scroll SOLO per le card */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <Animatable.View animation="fadeInUp" delay={100}>
          <PressableScaleWithRef
            onPress={() => router.push("/mymedicationnew")}
            activeScale={0.96}
            weight="light"
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardRow}>
                <Ionicons name="medkit" size={20} color={Colors.turquoise} />
                <Text style={[FontStyles.variants.sectionTitle, { color: Colors.turquoise }]}>
                  Farmaci Prescritti
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light3} />
            </View>
            <Text style={[FontStyles.variants.sectionTitle, styles.cardValue]}>
              {summary.nextMedication || "Nessun farmaco oggi"}
            </Text>
            <Text style={[FontStyles.variants.cardDescription, styles.cardSub]}>
              Prossima dose
            </Text>
          </PressableScaleWithRef>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={200}>
          <PressableScaleWithRef
            onPress={() => router.push("/sleeptrackingnew")}
            activeScale={0.96}
            weight="light"
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardRow}>
                <Ionicons name="bed" size={20} color={Colors.green} />
                <Text style={[FontStyles.variants.sectionTitle, { color: Colors.green }]}>
                  Monitoraggio del sonno
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light3} />
            </View>

            <Text style={[FontStyles.variants.sectionTitle, styles.cardValue]}>
              {summary.realSleepHours !== null
                ? formatSleepDuration(summary.realSleepHours)
                : "Non impostato"}
            </Text>
            <Text style={[FontStyles.variants.cardDescription, styles.cardSub]}>
              Tempo di sonno
            </Text>
          </PressableScaleWithRef>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300}>
          <PressableScaleWithRef
            onPress={() => router.push("/trackingnew")}
            activeScale={0.96}
            weight="light"
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardRow}>
                <Ionicons name="barbell" size={20} color={Colors.blue} />
                <Text style={[FontStyles.variants.sectionTitle, { color: Colors.blue }]}>
                  Monitoraggio sintomi
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light3} />
            </View>
            <Text style={[FontStyles.variants.sectionTitle, styles.cardValue]}>
              {summary.fatigue !== null ? `${summary.fatigue}/10` : "Non impostato"}
            </Text>
            <Text style={[FontStyles.variants.cardDescription, styles.cardSub]}>
              Affaticamento percepito
            </Text>
          </PressableScaleWithRef>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={400}>
          <PressableScaleWithRef
            onPress={() => router.push("/WorkStatusScreen")}
            activeScale={0.96}
            weight="light"
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardRow}>
                <Ionicons name="briefcase" size={20} color={Colors.red} />
                <Text style={[FontStyles.variants.sectionTitle, { color: Colors.red }]}>
                  Lavoro & impatto sociale
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light3} />
            </View>
            <Text style={[FontStyles.variants.sectionTitle, styles.cardValue]}>
              Stato lavorativo
            </Text>
            <Text style={[FontStyles.variants.cardDescription, styles.cardSub]}>
              Situazione occupazionale
            </Text>
          </PressableScaleWithRef>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={500}>
          <PressableScaleWithRef
            onPress={() => router.push("/diettrackernew")}
            activeScale={0.96}
            weight="light"
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardRow}>
                <Ionicons name="nutrition" size={20} color={Colors.orange} />
                <Text style={[FontStyles.variants.sectionTitle, { color: Colors.orange }]}>
                  Alimentazione
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light3} />
            </View>
            <Text style={[FontStyles.variants.sectionTitle, styles.cardValue]}>
              {summary.dietStatus === "Completato" ? "Tutti i pasti tracciati" : "Da compilare"}
            </Text>
            <Text style={[FontStyles.variants.cardDescription, styles.cardSub]}>
              Pasti giornalieri
            </Text>
          </PressableScaleWithRef>
        </Animatable.View>
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light1 },

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
    justifyContent: "space-between",
    alignItems: "center",
  },
  todayLabel: {
    marginTop: 8,
    fontSize: 18,
    color: Colors.gray3,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  // ✅ Fade verso background pagina
  headerFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 44, // 28–52 a gusto
  },

  scroll: { flex: 1, backgroundColor: Colors.light1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3A3A3C",
  },
  cardSub: {
    fontSize: 14,
    color: "#888",
  },
});
