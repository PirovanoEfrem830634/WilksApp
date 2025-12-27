// src/screens/TherapyPlanCurrentScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";

import { auth, db } from "../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";

import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import BottomNavigation from "../components/bottomnavigationnew";
import Toast from "react-native-toast-message";
import { getPatientDocId } from "../utils/session";

type TherapyPlanCurrent = {
  regimen?: string;
  notes?: string;
  startDate?: any; // Timestamp | Date
  lastUpdatedAt?: any; // Timestamp | Date
  last_modified_by_name?: string;
  last_modified_by?: string;
};

function formatDateIT(input: any): string {
  if (!input) return "—";

  // Firestore Timestamp
  const d: Date =
    typeof input?.toDate === "function"
      ? input.toDate()
      : input instanceof Date
      ? input
      : new Date(input);

  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function TherapyPlanCurrentScreen() {
  const [plan, setPlan] = useState<TherapyPlanCurrent | null>(null);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    const loadPlan = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const patientId = await getPatientDocId();
        if (!patientId) {
          setLoading(false);
          return;
        }

        const ref = doc(db, "users", patientId, "therapy_plan", "current");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as TherapyPlanCurrent;
          setPlan({
            regimen: typeof data.regimen === "string" ? data.regimen : "",
            notes: typeof data.notes === "string" ? data.notes : "",
            startDate: data.startDate,
            lastUpdatedAt: data.lastUpdatedAt,
            last_modified_by_name:
              typeof data.last_modified_by_name === "string"
                ? data.last_modified_by_name
                : "",
            last_modified_by:
              typeof data.last_modified_by === "string"
                ? data.last_modified_by
                : "",
          });
        } else {
          setPlan(null);
        }
      } catch (err) {
        console.error("Errore caricando therapy_plan/current:", err);
        Alert.alert(
          "Errore",
          "Non è stato possibile caricare il piano terapeutico."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [user]);

  const statusTag = useMemo(() => {
    if (!plan) return null;

    const hasRegimen = (plan.regimen || "").trim().length > 0;
    const hasStart = !!plan.startDate;

    let label = "Piano non completo";
    let bg = "#E5E5EA";
    let text = "#1C1C1E";
    let icon: any = "alert-circle-outline";

    if (hasRegimen && hasStart) {
      label = "Piano terapeutico attivo";
      bg = "#EAF3FF";
      text = "#0B3A8A";
      icon = "checkmark-circle-outline";
    } else if (hasRegimen || hasStart) {
      label = "Piano parziale";
      bg = "#FFF4E5";
      text = "#BF360C";
      icon = "information-circle-outline";
    }

    return { label, bg, text, icon };
  }, [plan]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.yellow} />
        <Text style={styles.loadingText}>Carico il piano terapeutico…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient stile identico a WorkStatus (solo tonalità blu) */}
      <LinearGradient
        colors={["#ffe79dff", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
      />

      {/* Header centrale Apple-style */}
      <Animatable.View
        animation="fadeInDown"
        duration={500}
        style={styles.mainHeader}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="newspaper" size={48} color={Colors.yellow} />
        </View>

        <Text style={FontStyles.variants.mainTitle}>Piano terapeutico</Text>
        <Text style={FontStyles.variants.sectionTitle}>
          Terapia corrente prescritta dal medico
        </Text>

        <Text
          style={[
            FontStyles.variants.cardDescription,
            { marginTop: 8, textAlign: "center" },
          ]}
        >
          Qui trovi le informazioni aggiornate sulla tua terapia. Se noti
          incongruenze o cambiamenti non comunicati, contatta il team clinico.
        </Text>
      </Animatable.View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Empty state */}
        {!plan ? (
          <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={Colors.yellow}
              />
              <Text style={styles.cardLabel}>Nessun piano disponibile</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              Al momento non risulta un piano terapeutico corrente associato al
              tuo profilo.
            </Text>
            <Text style={styles.cardHighlight}>
              Se il medico ha già definito la terapia, riprova più tardi oppure
              contatta l’ambulatorio.
            </Text>
          </Animatable.View>
        ) : (
          <>
            {/* Card: Piano corrente */}
            <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="document-text-outline" size={20} color={Colors.yellow} />
                <Text style={styles.cardLabel}>Terapia corrente</Text>
              </View>

              <Text style={styles.cardSubtitle}>
                Informazioni principali del piano terapeutico attivo.
              </Text>

              {/* Tag stato */}
              {statusTag && (
                <View style={[styles.statusTag, { backgroundColor: statusTag.bg }]}>
                  <Ionicons
                    name={statusTag.icon}
                    size={16}
                    color={statusTag.text}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.statusTagText, { color: statusTag.text }]}>
                    {statusTag.label}
                  </Text>
                </View>
              )}

              {/* Start date */}
              <View style={styles.rowItem}>
                <Ionicons name="calendar-outline" size={18} color="#6E6E73" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.metaLabel}>Data di inizio</Text>
                  <Text style={styles.metaValue}>{formatDateIT(plan.startDate)}</Text>
                </View>
              </View>

              {/* Regimen */}
              <View style={styles.block}>
                <Text style={styles.fieldLabel}>Regime / Terapia</Text>
                <Text style={styles.fieldValue}>
                  {(plan.regimen || "").trim() ? plan.regimen : "—"}
                </Text>
              </View>

              {/* Notes */}
              <View style={styles.block}>
                <Text style={styles.fieldLabel}>Note</Text>
                <Text style={styles.fieldValue}>
                  {(plan.notes || "").trim() ? plan.notes : "—"}
                </Text>
              </View>
            </Animatable.View>

            {/* Card: Aggiornamenti e fonte */}
            <Animatable.View animation="fadeInUp" delay={200} style={styles.card}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={Colors.yellow}
                />
                <Text style={styles.cardLabel}>Aggiornamenti</Text>
              </View>

              <Text style={styles.cardSubtitle}>
                Questo piano viene aggiornato dal medico. I dati sono mostrati in
                sola lettura.
              </Text>

              <View style={styles.rowItem}>
                <Ionicons name="time-outline" size={18} color="#6E6E73" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.metaLabel}>Ultimo aggiornamento</Text>
                  <Text style={styles.metaValue}>
                    {formatDateIT(plan.lastUpdatedAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.rowItem}>
                <Ionicons name="person-outline" size={18} color="#6E6E73" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.metaLabel}>Aggiornato da</Text>
                  <Text style={styles.metaValue}>
                    {(plan.last_modified_by_name || "").trim()
                      ? plan.last_modified_by_name
                      : "—"}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardHighlight}>
                Se hai dubbi sulla terapia o compaiono sintomi nuovi, non
                modificare autonomamente il trattamento: contatta il tuo medico.
              </Text>
            </Animatable.View>
          </>
        )}
      </ScrollView>

      <BottomNavigation />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light1,
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    zIndex: -1,
  },
  mainHeader: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  iconWrapper: {
    borderRadius: 60,
    padding: 5,
    marginBottom: 10,
  },

  // Cards stile identico a WorkStatus (bloodmonitoring-like)
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6E6E73",
    marginTop: 8,
    marginBottom: 8,
  },
  cardHighlight: {
    fontSize: 14,
    color: "#1C1C1E",
    marginTop: 10,
    lineHeight: 20,
  },

  statusTag: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusTagText: {
    fontSize: 13,
  },

  rowItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  metaLabel: {
    fontSize: 13,
    color: "#6E6E73",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 15,
    color: "#1C1C1E",
    fontWeight: "600",
  },

  block: {
    marginTop: 12,
  },
  fieldLabel: {
    marginBottom: 6,
    color: "#1C1C1E",
    fontSize: 15,
    fontWeight: "600",
  },
  fieldValue: {
    color: "#3A3A3C",
    fontSize: 14,
    lineHeight: 20,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.light1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#6E6E73",
  },
});
