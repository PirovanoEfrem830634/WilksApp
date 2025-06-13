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

  const symptomIcons: Record<string, { label: string; icon: string; color: string }> = {
  debolezzaMuscolare: { label: "Muscle weakness", icon: 'fitness', color: Colors.pink },
  affaticamentoMuscolare: { label: "Muscle fatigue", icon: 'barbell', color: Colors.pink },
  ptosi: { label: "Ptosi", icon: 'eye', color: Colors.pink },
  diplopia: { label: "Diplopia", icon: 'eye-off', color: Colors.pink },
  difficoltaRespiratorie: { label: "Respiratory difficulty", icon: 'cloudy-night', color: Colors.pink },
  ansia: { label: "Anxiety", icon: 'alert-circle', color: Colors.pink },
  umore: { label: "Mood", icon: 'happy', color: Colors.pink },
  disfagia: { label: "Dysphagia", icon: 'restaurant', color: Colors.pink },
  disartria: { label: "Dysarthria", icon: 'mic', color: Colors.pink },
  sonno: { label: "Sleep", icon: 'bed', color: Colors.pink },
  andamentoSintomi: { label: "Symptoms Trend", icon: 'pulse', color: Colors.pink },
};

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
        const category = symptomIcons[key];
        if (!category) return null;
        return `${key}: ${value}`;
        })
        .join("\n");

      loadedItems[date] = [
        {
          name: "Sintomi registrati",
          description: sintomiAttivi || "Nessun sintomo significativo registrato.",
        }
      ];

      marks[date] = { marked: true, dotColor: Colors.pink }; 
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
                dotColor: Colors.pink,
                selectedColor: "#FFA3C5"
              }
            }}
            onDayPress={(day: DateData) => {
              const selected = day.dateString;
              const item = items[selected]?.[0];
              if (item) {
                setSelectedSymptom({ date: selected, item });
              } else {
                setSelectedSymptom({ date: selected, item: { name: "No Data Available", description: "" } });
              }
            }}
            theme={{
              selectedDayBackgroundColor: Colors.pink,     
              selectedDayTextColor: '#FFFFFF',               
              todayTextColor: Colors.pink,                   
              arrowColor: Colors.pink,                       
              textSectionTitleColor: '#C86A8C',              
              textDayFontWeight: '600',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDisabledColor: '#D1D1D6',                  
              dotColor: Colors.pink,                         
              selectedDotColor: Colors.pink,                    
            }}
            style={styles.calendarContainer}
          />

          {/* Box dettagli giorno selezionato */}
          {selectedSymptom && (
          <Animatable.View animation="fadeInUp" duration={500} style={styles.detailCard}>
            <Text style={styles.detailDate}>{selectedSymptom.date}</Text>
            {selectedSymptom.item.description
            .split("\n")
            .filter(line => line.includes(":"))
            .map((line, idx) => {
              const [key, value] = line.split(": ");
              const meta = symptomIcons[key?.trim()];
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
                    {meta.label}: {value === "true" ? "Yes" : value === "false" ? "No" : value}
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

  // MOBILE
  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <Calendar
        markedDates={{
          ...markedDates,
          [selectedSymptom?.date || ""]: {
            selected: true,
            marked: true,
            dotColor: Colors.pink,
            selectedColor: "#FFA3C5"
          }
        }}
        onDayPress={(day: DateData) => {
          const selected = day.dateString;
          const item = items[selected]?.[0];
          if (item) {
            setSelectedSymptom({ date: selected, item });
          } else {
            setSelectedSymptom({ date: selected, item: { name: "No Data Available", description: "" } });
          }
        }}
        theme={{
          selectedDayBackgroundColor: Colors.pink,       
          selectedDayTextColor: '#FFFFFF',               
          todayTextColor: Colors.pink,                  
          arrowColor: Colors.pink,                       
          textSectionTitleColor: '#C86A8C',              
          textDayFontWeight: '600',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDisabledColor: '#D1D1D6',                  
          dotColor: Colors.pink,                         
          selectedDotColor: Colors.pink,                   
        }}
        style={{ borderRadius: 16, margin: 16, elevation: 2 }}
      />

      {selectedSymptom && (
        <View style={styles.webDetailBox}>
          <Text style={styles.dateTitle}>{selectedSymptom.date}</Text>
          <Text style={styles.title}>{selectedSymptom.item.name}</Text>
          {selectedSymptom.item.description
          .split("\n")
          .map((line, idx) => {
            const [key, value] = line.split(": ");
            const meta = symptomIcons[key.trim()];
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
                  {meta.label}: {value}
                </Text>
              </View>
            );
          })}
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
    backgroundColor: "#FFFFFF", 
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: Colors.pink,

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
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 4,
  borderWidth: 1,
  borderColor: Colors.light1,
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

  symptomRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
  },
  symptomIcon: {
  marginRight: 10,
  },
  symptomText: {
  fontSize: 15,
  color: '#3A3A3C',
  },


});
