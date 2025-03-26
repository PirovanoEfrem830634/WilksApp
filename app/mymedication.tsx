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
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import { Trash2 } from "lucide-react-native";

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
    const fetchMedications = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const medsRef = collection(db, "users", user.uid, "medications");
      const snapshot = await getDocs(medsRef);

      console.log("[DEBUG] Firebase meds snapshot:", snapshot.docs);

      const meds = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("[DEBUG] Single doc:", data);
        return {
          id: doc.id,
          name: data.name || "",
          dose: data.dose || "",
          days: Array.isArray(data.days) ? data.days : [],
          times: Array.isArray(data.times) ? data.times : [],
        };
      });

      console.log("[DEBUG] Parsed medications:", meds);
      setMedications(meds);
    };

    fetchMedications();
  }, []);

  const handleDelete = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    await deleteDoc(doc(db, "users", user.uid, "medications", id));
    setMedications((prev) => prev.filter((med) => med.id !== id));
  };

  const renderItem = ({ item }: { item: Medication }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Pill color="#007AFF" />
        <Text style={styles.title}>{item.name} ({item.dose})</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Trash2 size={20} color="#FF3B30" />
        </TouchableOpacity>
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
