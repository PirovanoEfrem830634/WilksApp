import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity } from "react-native";
import { Agenda, Calendar } from "react-native-calendars";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import BottomNavigation from "../app/bottomnavigationnew";
import { DateData } from 'react-native-calendars';
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { PressableScale } from "react-native-pressable-scale";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

export default function SymptomCalendar() {
  const [items, setItems] = useState<Record<string, { name: string; description: string }[]>>({});
  const [markedDates, setMarkedDates] = useState({});
  const [selectedSymptom, setSelectedSymptom] = useState<{ date: string; item: { name: string; description: string } } | null>(null);

  const symptomCategories: Record<string, { label: string; color: string }> = {
  debolezzaMuscolare: { label: "Muscolare", color: "#007AFF" },
  affaticamentoMuscolare: { label: "Muscolare", color: "#007AFF" },
  ptosi: { label: "Visivo", color: "#AF52DE" },
  diplopia: { label: "Visivo", color: "#AF52DE" },
  difficoltaRespiratorie: { label: "Respiratorio", color: "#FF3B30" },
  ansia: { label: "Psicologico", color: "#FF9500" },
  umore: { label: "Psicologico", color: "#FF9500" },
  disfagia: { label: "Neuromuscolare", color: "#5AC8FA" },
  disartria: { label: "Neuromuscolare", color: "#5AC8FA" },
  andamentoSintomi: { label: "Generale", color: "#34C759" },
  sonno: { label: "Generale", color: "#34C759" },
} ;

  const fetchSymptoms = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ref = collection(db, "users", uid, "symptoms");
    const snapshot = await getDocs(ref);

    const loadedItems: any = {};
    const marks: any = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = doc.id;

      // Estrae i sintomi attivi dal documento
      const sintomiAttivi = Object.entries(data)
        .filter(([key, value]) => {
          if (typeof value === "boolean") return value === true;
          if (typeof value === "string") return value.trim() !== "";
          if (typeof value === "number") return value > 0;
          return false;
        })
        .map(([key, value]) => {
        const category = symptomCategories[key];
        if (!category) return null;
        return `${category.label}: ${value}`;
        })
        .join("\n");

      loadedItems[date] = [
        {
          name: "Sintomi registrati",
          description: sintomiAttivi || "Nessun sintomo significativo registrato.",
        }
      ];

      marks[date] = { marked: true, dotColor: "#007AFF" }; 
    });

    setItems(loadedItems);
    setMarkedDates(marks);
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.light1 }}>
        <LinearGradient
        colors={["#FFA3C5", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
        />

        <View style={styles.mainHeader}>
        <View style={styles.iconWrapper}>
            <Ionicons name="calendar" size={48} color={Colors.pink} />
        </View>
        <Text style={FontStyles.variants.mainTitle}>Symptoms Calendar</Text>
        <Text style={FontStyles.variants.sectionTitle}>
            Track your daily symptom history
        </Text>
        </View>

        
        <ScrollView contentContainerStyle={{ padding: 20 }}>

          {/* Calendario con stile Apple-like */}
          
          <Calendar 
            markedDates={{
              ...markedDates,
              [selectedSymptom?.date || ""]: {
                selected: true,
                marked: true,
                dotColor: "#007AFF",
                selectedColor: "#EAF1FF"
              }
            }}
            onDayPress={(day: DateData) => {
              const selected = day.dateString;
              const item = items[selected]?.[0];
              if (item) {
                setSelectedSymptom({ date: selected, item });
              } else {
                setSelectedSymptom({ date: selected, item: { name: "Nessun dato registrato", description: "" } });
              }
            }}
            theme={{
              selectedDayBackgroundColor: '#EAF1FF',
              selectedDayTextColor: '#007AFF',
              todayTextColor: '#FF9500',
              arrowColor: '#007AFF',
              textSectionTitleColor: '#8E8E93',
              textDayFontWeight: '600',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600'
            }}
            style={styles.calendarContainer}
          />

          {/* Box dettagli giorno selezionato */}
          {selectedSymptom && (
            <Animatable.View animation="fadeInUp" duration={500} style={styles.detailCard}>
            <Text style={styles.detailDate}>{selectedSymptom.date}</Text>
            <Text style={styles.detailTitle}>{selectedSymptom.item.name}</Text>
            <Text style={styles.detailDescription}>{selectedSymptom.item.description}</Text>
            </Animatable.View>
          )}
        </ScrollView>
        <BottomNavigation />
      </View>
    );
  }

  // MOBILE
  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <Calendar
        markedDates={{
          ...markedDates,
          [selectedSymptom?.date || ""]: {
            selected: true,
            marked: true,
            dotColor: "#007AFF",
            selectedColor: "#EAF1FF"
          }
        }}
        onDayPress={(day: DateData) => {
          const selected = day.dateString;
          const item = items[selected]?.[0];
          if (item) {
            setSelectedSymptom({ date: selected, item });
          } else {
            setSelectedSymptom({ date: selected, item: { name: "Nessun dato registrato", description: "" } });
          }
        }}
        theme={{
          selectedDayBackgroundColor: '#EAF1FF',
          selectedDayTextColor: '#007AFF',
          todayTextColor: '#FF9500',
          arrowColor: '#007AFF',
          textSectionTitleColor: '#8E8E93',
          textDayFontWeight: '600',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600'
        }}
        style={{ borderRadius: 16, margin: 16, elevation: 2 }}
      />

      {selectedSymptom && (
        <View style={styles.webDetailBox}>
          <Text style={styles.dateTitle}>{selectedSymptom.date}</Text>
          <Text style={styles.title}>{selectedSymptom.item.name}</Text>
          <Text>{selectedSymptom.item.description}</Text>
        </View>
      )}

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 4,
  },
  item: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontWeight: "600",
    marginBottom: 5,
    fontSize: 16,
  },
  emptyDate: {
    padding: 15,
    marginTop: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
  },
  webDetailBox: {
    marginTop: 20,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: "#FFFFFF", // Sfondo bianco
    borderRadius: 16,

    borderLeftWidth: 5,
    borderLeftColor: "#007AFF", // Bordo azzurro Apple

    // Effetto rialzato
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4, // Android
  },
  dateTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  calendarContainer: {
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  marginTop: 12,
  marginBottom: 20,
  marginHorizontal: 8,
  padding: 8,

  // iOS shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 8,

  // Android elevation
  elevation: 4,

  // Bordo tenue (tipo Apple card)
  borderWidth: 1,
  borderColor: '#E5E5EA',
  },
  subtitle: { fontSize: 16, textAlign: "center", color: "#6b7280", marginBottom: 20 },

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

  detailCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  padding: 16,
  marginHorizontal: 16,
  marginTop: 20,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
  borderLeftWidth: 4,
  borderLeftColor: Colors.pink,
  },

  detailDate: {
  fontSize: 14,
  fontWeight: "500",
  color: "#6E6E73",
  marginBottom: 6,
  },

  detailTitle: {
  fontSize: 17,
  fontWeight: "700",
  color: "#1C1C1E",
  marginBottom: 8,
  },

  detailDescription: {
  fontSize: 15,
  color: "#3A3A3C",
  lineHeight: 22,
  },

});
