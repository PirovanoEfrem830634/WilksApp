import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Pill } from "lucide-react-native";

// Dummy type (in seguito lo connetteremo a Firebase o AsyncStorage)
type Medication = {
  id: string;
  name: string;
  dose: string;
  days: string[];
  times: string[];
};

export default function MyMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const router = useRouter();

  useEffect(() => {
    // MOCK: dati di esempio temporanei
    setMedications([
      {
        id: "1",
        name: "Pyridostigmine",
        dose: "60mg",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        times: ["08:00", "14:00", "20:00"],
      },
    ]);
  }, []);

  const renderItem = ({ item }: { item: Medication }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Pill color="#007AFF" />
        <Text style={styles.title}>{item.name} ({item.dose})</Text>
      </View>
      <Text style={styles.sub}>Days: {item.days.join(", ")}</Text>
      <Text style={styles.sub}>Times: {item.times.join(", ")}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Medications</Text>

      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/addmedication")}
      >
        <Text style={styles.addButtonText}>+ Add Medication</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 5,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  sub: {
    color: "#555",
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    margin: 20,
  },
  addButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
});
