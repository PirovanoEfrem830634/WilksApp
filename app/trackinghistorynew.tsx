import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import BottomNavigation from "../components/bottomnavigationnew";
import { DateData } from "react-native-calendars";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { getPatientDocId } from "../utils/session";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SymptomCalendar() {
  const [items, setItems] = useState<
    Record<string, { name: string; description: string }[]>
  >({});
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedSymptom, setSelectedSymptom] = useState<{
    date: string;
    item: { name: string; description: string };
  } | null>(null);

  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);
  const tabbarHeight = 56 + bottomPad;
  const scrollBottomPadding = tabbarHeight + 28;

  const symptomIcons: Record<
    string,
    { label: string; icon: string; color: string }
  > = {
    debolezzaMuscolare: {
      label: "Debolezza muscolare",
      icon: "fitness",
      color: Colors.pink,
    },
    affaticamentoMuscolare: {
      label: "Affaticamento muscolare",
      icon: "barbell",
      color: Colors.pink,
    },
    ptosi: { label: "Ptosi", icon: "eye", color: Colors.pink },
    diplopia: { label: "Diplopia", icon: "eye-off", color: Colors.pink },
    difficoltaRespiratorie: {
      label: "Difficoltà respiratorie",
      icon: "cloudy-night",
      color: Colors.pink,
    },
    ansia: { label: "Ansia", icon: "alert-circle", color: Colors.pink },
    umore: { label: "Umore", icon: "happy", color: Colors.pink },
    disfagia: { label: "Disfagia", icon: "restaurant", color: Colors.pink },
    disartria: { label: "Disartria", icon: "mic", color: Colors.pink },
    sonno: { label: "Sonno", icon: "bed", color: Colors.pink },
    andamentoSintomi: {
      label: "Andamento dei sintomi",
      icon: "pulse",
      color: Colors.pink,
    },
  };

  const fetchSymptoms = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const patientId = await getPatientDocId();
    if (!patientId) return;

    const ref = collection(db, "users", patientId, "symptoms");
    const snapshot = await getDocs(ref);

    const loadedItems: any = {};
    const marks: any = {};

    snapshot.docs.forEach((docSnap) => {
      const data: any = docSnap.data();
      const date = docSnap.id;

      const sintomiAttivi = Object.entries(data)
        .filter(([key, value]) => {
          if (key === "dataInserimento" || key === "createdAt") return false;
          if (typeof value === "boolean") return value === true;
          if (typeof value === "string") return value.trim() !== "";
          if (typeof value === "number") return value > 0;
          return false;
        })
        .map(([key, value]) => {
          const category = symptomIcons[key];
          if (!category) return null;
          return `${key}: ${value}`;
        })
        .filter(Boolean)
        .join("\n");

      loadedItems[date] = [
        {
          name: "Sintomi registrati",
          description: sintomiAttivi || "Nessun sintomo significativo registrato.",
        },
      ];

      marks[date] = { marked: true, dotColor: Colors.pink };
    });

    setItems(loadedItems);
    setMarkedDates(marks);
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  // marked + selected
  const calendarMarked = useMemo(() => {
    const sel = selectedSymptom?.date || "";
    if (!sel) return markedDates;

    return {
      ...markedDates,
      [sel]: {
        selected: true,
        marked: true,
        dotColor: Colors.pink,
        selectedColor: "#FFA3C5",
      },
    };
  }, [markedDates, selectedSymptom?.date]);

  const onDayPress = (day: DateData) => {
    const selected = day.dateString;
    const item = items[selected]?.[0];
    if (item) setSelectedSymptom({ date: selected, item });
    else
      setSelectedSymptom({
        date: selected,
        item: { name: "Nessun dato disponibile", description: "" },
      });
  };

  // ✅ Unica UI (web e mobile): header fisso + scroll contenuti
  return (
    <View style={styles.container}>
      {/* ✅ gradient senza zIndex */}
      <LinearGradient
        pointerEvents="none"
        colors={["#FFA3C5", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { height: 180 }]}
      />

      {/* ✅ header fisso */}
      <View style={styles.mainHeader}>
        <View style={styles.iconWrapper}>
          <Ionicons name="calendar" size={48} color={Colors.pink} />
        </View>
        <Text style={FontStyles.variants.mainTitle}>Calendario dei sintomi</Text>
        <Text
          style={[
            FontStyles.variants.sectionTitle,
            { textAlign: "center", alignSelf: "center" },
          ]}
        >
          Consulta lo storico giornaliero dei sintomi
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Calendar
          markedDates={calendarMarked}
          onDayPress={onDayPress}
          theme={{
            selectedDayBackgroundColor: Colors.pink,
            selectedDayTextColor: "#FFFFFF",
            todayTextColor: Colors.pink,
            arrowColor: Colors.pink,
            textSectionTitleColor: "#C86A8C",
            textDayFontWeight: "600",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "600",
            textDisabledColor: "#D1D1D6",
            dotColor: Colors.pink,
            selectedDotColor: Colors.pink,
          }}
          style={styles.calendarContainer}
        />

        {selectedSymptom && (
          <Animatable.View
            animation="fadeInUp"
            duration={450}
            style={styles.detailCard}
          >
            <Text style={styles.detailDate}>{selectedSymptom.date}</Text>

            {selectedSymptom.item.description
              .split("\n")
              .filter((line) => line.includes(":"))
              .map((line, idx) => {
                const [keyRaw, valueRaw] = line.split(": ");
                const key = (keyRaw || "").trim();
                const value = (valueRaw || "").trim();
                const meta = symptomIcons[key];
                if (!meta) return null;

                return (
                  <View key={idx} style={styles.symptomRow}>
                    <Ionicons
                      name={meta.icon as any}
                      size={18}
                      color={meta.color}
                      style={styles.symptomIcon}
                    />
                    <Text style={styles.symptomText}>
                      {meta.label}:{" "}
                      {value === "true" ? "Sì" : value === "false" ? "No" : value}
                    </Text>
                  </View>
                );
              })}
          </Animatable.View>
        )}
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light1 },

  mainHeader: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  iconWrapper: { borderRadius: 60, padding: 5, marginBottom: 10 },

  scrollContent: {
    padding: 20,
  },

  // ✅ calendario in card Apple-like
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.light2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },

  // ✅ detail card coerente
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderLeftWidth: 4, // fisso
    borderLeftColor: Colors.pink,
  },
  detailDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6E6E73",
    marginBottom: 10,
  },

  symptomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  symptomIcon: { marginRight: 10 },
  symptomText: { fontSize: 15, color: "#3A3A3C" },
});
