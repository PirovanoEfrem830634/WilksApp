import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Agenda, Calendar } from "react-native-calendars";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import BottomNavigation from "../app/BottomNavigation";

export default function SymptomCalendar() {
  const [items, setItems] = useState<Record<string, { name: string; description: string }[]>>({});
  const [markedDates, setMarkedDates] = useState({});

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

      // Filtra solo i campi significativi
      const sintomiAttivi = Object.entries(data)
        .filter(([key, value]) => {
          if (typeof value === "boolean") return value === true;
          if (typeof value === "string") return value.trim() !== "";
          if (typeof value === "number") return value > 0;
          return false;
        })
        .map(([key, value]) => `${key}: ${value}`)
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
    console.log("Loaded items:", loadedItems);
    setMarkedDates(marks);
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  if (Platform.OS === "web") {
    const [selectedSymptom, setSelectedSymptom] = useState<{ date: string; item: { name: string; description: string } } | null>(null);
  
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Symptom Calendar (Web)</Text>
        <Calendar
          markedDates={markedDates}
          onDayPress={(day: { dateString: string }) => {
            const selected = day.dateString;
            const item = items[selected]?.[0];
            if (item) {
              setSelectedSymptom({ date: selected, item });
            } else {
              setSelectedSymptom({ date: selected, item: { name: "Nessun dato registrato", description: "" } });
            }
          }}
        />
  
        {selectedSymptom && (
          <View style={styles.webDetailBox}>
            <Text style={styles.dateTitle}>{selectedSymptom.date}</Text>
            <Text style={styles.title}>{selectedSymptom.item.name}</Text>
            <Text>{selectedSymptom.item.description}</Text>
          </View>
        )}
      </View>
    );
  }  

  return (
    <Agenda
      items={items}
      selected={new Date().toISOString().split("T")[0]}
      renderItem={(item: { name: string; description: string }, firstItemInDay: boolean) => (
        <View style={styles.item}>
          <Text style={styles.title}>{item.name}</Text>
          <Text>{item.description}</Text>
        </View>
      )}
      renderEmptyDate={() => (
        <View style={styles.emptyDate}>
          <Text style={styles.emptyText}>Nessun dato per questo giorno</Text>
        </View>
      )}
    />
  )
  
}

const styles = StyleSheet.create({
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
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },  
});
