import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { auth, db } from "../firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import BottomNavigation from "../app/bottomnavigationnew";
import { PressableScale } from "react-native-pressable-scale";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { TouchableOpacity } from "react-native";
import { Pressable, Animated } from "react-native"
import { useNavigation } from "@react-navigation/native";
import { Image } from "react-native";
import { Link } from "expo-router";


export default function SummaryScreen() {
  
  const [summary, setSummary] = useState<SummaryData>({
    nextMedication: null,
    sleep: null,
    mood: null,
    fatigue: null,
    dietStatus: null,
  });
  
  const navigation = useNavigation() as any;

  interface SummaryData {
  nextMedication: string | null;
  sleep: string | null;
  mood: string | null;
  fatigue: number | null;
  dietStatus: string | null;
}

  useEffect(() => {
    const fetchSummary = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const uid = user.uid;
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const currentMinutes = today.getHours() * 60 + today.getMinutes();
      const dayName = today.toLocaleString("en-US", { weekday: "short" });

      // 1. Medications
      const medsRef = collection(db, "users", uid, "medications");
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
        nextMed = `${upcomingMeds[0].name} at ${upcomingMeds[0].time}`;
      }

      // 2. Symptoms (last entry)
      const symptomsRef = collection(db, "users", uid, "symptoms");
      const symptomsSnap = await getDocs(symptomsRef);
      let latest = null;

      if (!symptomsSnap.empty) {
        latest = symptomsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (a.id > b.id ? -1 : 1))[0];
      }

      // 3. Diet (check if today exists)
      const dietRef = collection(db, "users", uid, "diet");
      const dietSnap = await getDocs(dietRef);
      const dietToday = dietSnap.docs.find(doc => doc.id === todayStr);
      const dietStatus = dietToday ? "Completed" : "Pending";

      // Final update
      setSummary({
        nextMedication: nextMed,
        sleep: (latest as any)?.sonno || null,
        mood: (latest as any)?.umore || null,
        fatigue: (latest as any)?.affaticamentoMuscolare ?? null,
        dietStatus,
      });
    };

    fetchSummary();
  }, []);

  return (
    <View style={{ flex: 1 }}>
    <ScrollView style={styles.container}>
  <View style={styles.headerRow}>
    <Text style={FontStyles.variants.mainTitle}>Summary</Text>
    <Link href="/profile" asChild>
    <Pressable>
    <Image source={require("../assets/images/avatar-ios.jpg")} style={styles.avatar} />
    </Pressable>
    </Link>
  </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, FontStyles.variants.bodySemibold]}>Today</Text>

        <Animatable.View animation="fadeInUp" delay={100}>
          <PressableScale
            onPress={() => navigation.navigate("mymedicationnew")}
            activeScale={0.96}
            weight="light"
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardRow}>
                <Ionicons name="medkit" size={20} color={Colors.turquoise} />
                <Text style={[FontStyles.variants.sectionTitle, { color: Colors.turquoise }]}>
                  Medication
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light3} />
            </View>
            <Text style={[FontStyles.variants.dataValue, styles.cardValue]}>
              {summary.nextMedication || "No meds today"}
            </Text>
            <Text style={[FontStyles.variants.cardDescription, styles.cardSub]}>
              Next Dose
            </Text>
          </PressableScale>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={200}>
            <PressableScale
              onPress={() => navigation.navigate("sleeptracking")}
              activeScale={0.96}
              weight="light"
              style={styles.card}
            >
            <View style={styles.cardHeader}>
              <View style={styles.cardRow}>
                <Ionicons name="bed" size={20} color={Colors.green} />
                <Text style={[FontStyles.variants.sectionTitle, { color: Colors.green }]}>
                  Sleep
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light3} />
            </View>

            <Text style={[FontStyles.variants.dataValue, styles.cardValue]}>
              7 hr 30 min
            </Text>
            <Text style={[FontStyles.variants.cardDescription, styles.cardSub]}>
              Time Asleep
            </Text>
          </PressableScale>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300}>
          <PressableScale
            onPress={() => navigation.navigate("trackingnew")}
            activeScale={0.96}
            weight="light"
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardRow}>
                <Ionicons name="happy" size={20} color={Colors.blue} />
                <Text style={[FontStyles.variants.sectionTitle, { color: Colors.blue }]}>
                  Mood
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light3} />
            </View>
            <Text style={[FontStyles.variants.dataValue, styles.cardValue]}>
              {summary.mood || "Not set"}
            </Text>
            <Text style={[FontStyles.variants.cardDescription, styles.cardSub]}>
              Last Entry
            </Text>
          </PressableScale>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={400}>
          <PressableScale
            onPress={() => navigation.navigate("trackingnew")}
            activeScale={0.96}
            weight="light"
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardRow}>
                <Ionicons name="barbell" size={20} color={Colors.red} />
                <Text style={[FontStyles.variants.sectionTitle, { color: Colors.red }]}>
                  Fatigue
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light3} />
            </View>
            <Text style={[FontStyles.variants.dataValue, styles.cardValue]}>
              {summary.fatigue !== null ? `${summary.fatigue}/10` : "Not set"}
            </Text>
            <Text style={[FontStyles.variants.cardDescription, styles.cardSub]}>
              Perceived Fatigue
            </Text>
          </PressableScale>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={500}>
          <PressableScale
            onPress={() => navigation.navigate("diettrackernew")}
            activeScale={0.96}
            weight="light"
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardRow}>
                <Ionicons name="nutrition" size={20} color={Colors.orange} />
                <Text style={[FontStyles.variants.sectionTitle, { color: Colors.orange }]}>
                  Diet
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light3} />
            </View>
            <Text style={[FontStyles.variants.dataValue, styles.cardValue]}>
              {summary.dietStatus === "Completed" ? "All meals tracked" : "Pending"}
            </Text>
            <Text style={[FontStyles.variants.cardDescription, styles.cardSub]}>
              Daily Meals
            </Text>
          </PressableScale>
        </Animatable.View>

      </View>
    </ScrollView>
    <BottomNavigation />
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 10,
    color: "#000",
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3A3A3C",
    marginBottom: 12,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#1C1C1E",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3A3A3C",
  },
  headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 50,
  marginBottom: 4,
},
profilePic: {
  width: 36,
  height: 36,
  borderRadius: 18,
},
favorites: {
  fontSize: 16,
  fontWeight: "600",
  color: "#3A3A3C",
  marginBottom: 16,
},
cardRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 4,
},
cardSub: {
  fontSize: 14,
  color: "#888",
},
cardHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
},
avatar: {
  width: 32,
  height: 32,
  borderRadius: 16,
},

});
