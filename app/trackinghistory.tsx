import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Agenda } from "react-native-calendars";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";

export default function SymptomCalendar() {
  const [items, setItems] = useState({});

  const fetchSymptoms = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ref = collection(db, "users", uid, "symptoms");
    const snapshot = await getDocs(ref);

    const loadedItems: any = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = doc.id; // es. '2025-03-24'

      loadedItems[date] = [
        {
          name: `Fatigue: ${data.affaticamentoMuscolare}/10`,
          description: data.andamentoSintomi || "No description",
          fullData: data,
        }
      ];
    });

    setItems(loadedItems);
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

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
          <Text style={styles.emptyText}>No data for this day</Text>
        </View>
      )}
    />
  );
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
});