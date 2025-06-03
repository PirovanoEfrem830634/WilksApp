import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  TextInput,
} from "react-native";
import { getDocs, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { getAuth } from "firebase/auth";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react-native";
import { MotiView } from "moti";
import Toast from "react-native-toast-message";
import BottomNavigation from "../app/BottomNavigation";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type BloodTest = {
  id: string;
  createdAt: any;
  antiAChR: string;
  antiMuSK: string;
  antiLRP4: string;
  notes?: string;
};

const MonitoraggioClinicoSangue = () => {
  const [bloodTests, setBloodTests] = useState<BloodTest[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [antiAChR, setAntiAChR] = useState("");
  const [antiMuSK, setAntiMuSK] = useState("");
  const [antiLRP4, setAntiLRP4] = useState("");
  const [notes, setNotes] = useState("");

  const fetchBloodTests = async () => {
    try {
      setLoading(true);
      const uid = getAuth().currentUser?.uid;
      if (!uid) throw new Error("Utente non autenticato");

      const snapshot = await getDocs(collection(db, `users/${uid}/blood_tests`));
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as BloodTest))
        .sort((a, b) => new Date(b.createdAt.seconds * 1000).getTime() - new Date(a.createdAt.seconds * 1000).getTime());

      setBloodTests(docs);

      Toast.show({
        type: "success",
        text1: "✅ Esami del sangue aggiornati",
        position: "top",
        visibilityTime: 2000,
      });
    } catch (err: any) {
      console.error("Errore fetch esami sangue:", err);
      Toast.show({
        type: "error",
        text1: "❌ Errore nel caricamento",
        text2: err.message,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodTests();
  }, []);

  const toggleSection = () => {
    LayoutAnimation.easeInEaseOut();
    setOpen(prev => !prev);
  };

  const handleSubmit = async () => {
    try {
      const uid = getAuth().currentUser?.uid;
      if (!uid) throw new Error("Utente non autenticato");

      await addDoc(collection(db, `users/${uid}/blood_tests`), {
        antiAChR,
        antiMuSK,
        antiLRP4,
        notes,
        createdAt: serverTimestamp(),
      });

      setAntiAChR("");
      setAntiMuSK("");
      setAntiLRP4("");
      setNotes("");

      Toast.show({
        type: "success",
        text1: "🧬 Esame inserito",
        position: "top",
      });

      fetchBloodTests();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "❌ Errore salvataggio",
        text2: err.message,
      });
    }
  };

  const last = bloodTests[0];

  return (
  <View style={styles.container}>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <Text style={styles.title}>🧬 Blood Test Monitoring</Text>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>➕ New Exam</Text>

        <Text>anti-AChR</Text>
        <TextInput value={antiAChR} onChangeText={setAntiAChR} style={styles.input} />

        <Text>anti-MuSK</Text>
        <TextInput value={antiMuSK} onChangeText={setAntiMuSK} style={styles.input} />

        <Text>anti-LRP4</Text>
        <TextInput value={antiLRP4} onChangeText={setAntiLRP4} style={styles.input} />

        <Text>Notes (optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          style={[styles.input, { height: 60 }]}
          multiline
        />

        <Pressable onPress={handleSubmit} style={styles.reloadButton}>
          <Text style={styles.reloadText}>Save Exam</Text>
        </Pressable>
      </View>

      <Pressable onPress={toggleSection} style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Last exam recorded</Text>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Pressable>

      {open && last ? (
        <View style={styles.cardBody}>
          <Text>🗓️ Data: {new Date(last.createdAt.seconds * 1000).toLocaleDateString()}</Text>
          <Text>🧪 anti-AChR: {last.antiAChR}</Text>
          <Text>🧪 anti-MuSK: {last.antiMuSK}</Text>
          <Text>🧪 anti-LRP4: {last.antiLRP4}</Text>
          <Text>📝 Notes: {last.notes || "—"}</Text>
        </View>
      ) : (
        <Text style={{ marginTop: 12 }}>No data available.</Text>
      )}

      <Pressable onPress={fetchBloodTests} style={styles.reloadButton} disabled={loading}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <MotiView
            animate={{ rotate: loading ? "360deg" : "0deg" }}
            transition={{ loop: loading, type: "timing", duration: 1000 }}
            style={{ width: 20, height: 20 }}
          >
            <RefreshCw size={20} color="#fff" />
          </MotiView>
          <Text style={styles.reloadText}>Reload</Text>
        </View>
      </Pressable>

      <Toast />
    </ScrollView>

    <BottomNavigation />
  </View>
);
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f5ff" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", color: "#1f2937", marginBottom: 20 },
  cardHeader: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#1e40af", marginBottom: 8 },
  cardBody: {
    backgroundColor: "#fff",
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  reloadButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 16,
  },
  reloadText: { color: "#fff", fontWeight: "600" },
});

export default MonitoraggioClinicoSangue;
