import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { auth, db } from "../firebaseconfig";
import { getDoc, doc } from "firebase/firestore";
import BottomNavigation from "../app/bottomnavigationnew";
import { PressableScale } from "react-native-pressable-scale";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { useRouter } from "expo-router";
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function ClinicalSurveysScreen() {
  const [statuses, setStatuses] = useState<{ [key: string]: { status: string; date?: string } }>({});
  const router = useRouter();

  const surveys = [
    // === ✅ Allegati & lato paziente (TENERE) ===
    {
      key: "mg_qol15",
      label: "MG-QoL15r",
      icon: "heart",
      color: Colors.purple,
      href: "/mgqol15", // tua screen già prevista
    },
    {
      key: "neuro_qol_fatigue",
      label: "Neuro-QoL Fatigue",
      icon: "flash",          // suggerito; cambia se preferisci
      color: Colors.blue,     // coerente Apple-like
      href: "/neuroqol-fatigue", // crea la screen dedicata
    },
    {
      key: "eq5d5l",
      label: "EQ-5D-5L",
      icon: "fitness",
      color: Colors.orange,
      href: "/eq5d5l", // tua screen già prevista
    },

    // === ❌ Non usare lato paziente ora (commentati) ===
    // {
    //   key: "mg_adl",
    //   label: "MG-ADL",
    //   icon: "pulse",
    //   color: Colors.blue,
    //   href: "/mgadlsurveyscreen", // strumento clinico → rimosso lato paziente
    // },
    // {
    //   key: "mgfa",
    //   label: "MGFA Classification",
    //   icon: "medkit",
    //   color: Colors.turquoise,
    //   href: "/mgfaclassification", // classificazione clinica
    // },
    // {
    //   key: "hads",
    //   label: "HADS",
    //   icon: "sad",
    //   color: Colors.red,
    //   href: "/hads", // non allegato → per ora no
    // },
    // {
    //   key: "hui3",
    //   label: "HUI3",
    //   icon: "analytics",
    //   color: Colors.green,
    //   href: "/hui3", // non allegato → per ora no
    // },
  ];

useFocusEffect(
  useCallback(() => {
    const fetchStatuses = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const result: any = {};
      for (const survey of surveys) {
        const ref = doc(db, `users/${uid}/clinical_surveys/${survey.key}`);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const last = data.lastCompiledAt?.seconds * 1000;
          const lastDate = moment(last).format("YYYY-MM-DD");
          const todayDate = moment().format("YYYY-MM-DD");

          if (lastDate === todayDate) {
            result[survey.key] = { status: "completed", date: moment(last).format("DD/MM/YYYY") };
          } else {
            result[survey.key] = { status: "todo" };
          }
        } else {
          result[survey.key] = { status: "todo" };
        }
      }
      setStatuses(result);
    };

    fetchStatuses();
  }, [])
);

  const completedCount = Object.values(statuses).filter(s => s.status === "completed").length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View style={styles.headerCentered}>
          <Ionicons name="clipboard" size={42} color={Colors.blue} style={{ marginBottom: 10 }} />
          <Text style={FontStyles.variants.mainTitle}>Clinical Evaluations</Text>
          <Text style={styles.description}>Complete the clinical surveys regularly to track your condition and help your medical team.</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${(completedCount / surveys.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{completedCount}/{surveys.length} Completed</Text>
        </View>

        {surveys.map((survey, index) => {
          const status = statuses[survey.key]?.status;
          const date = statuses[survey.key]?.date;
          return (
            <Animatable.View
              animation="fadeInUp"
              delay={index * 100}
              key={survey.key}
            >
              <PressableScale
                onPress={() => router.push(survey.href)}
                activeScale={0.96}
                weight="light"
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardRow}>
                    <Ionicons
                      name={survey.icon as any}
                      size={20}
                      color={survey.color}
                    />
                    <Text
                      style={[FontStyles.variants.sectionTitle, { color: survey.color }]}
                    >
                      {survey.label}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={Colors.light3}
                  />
                </View>
                <View style={styles.statusRow}>
                  <Ionicons
                    name={status === "completed" ? "checkmark-circle" : "reload-circle"}
                    size={18}
                    color={status === "completed" ? Colors.green : Colors.red}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[FontStyles.variants.cardDescription, styles.cardSub]}>
                    {status === "completed" ? `Completed (${date})` : "To complete"}
                  </Text>
                </View>
              </PressableScale>
            </Animatable.View>
          );
        })}
      </ScrollView>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light1,
  },
  headerCentered: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.gray3,
    marginTop: 6,
    textAlign: "center",
  },
  progressContainer: {
    marginBottom: 20,
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
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
});
