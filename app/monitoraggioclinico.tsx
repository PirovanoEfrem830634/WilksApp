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
} from "react-native";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { getAuth } from "firebase/auth";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react-native";
import { MotiView } from "moti";
import Toast from "react-native-toast-message";

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

  const last = bloodTests[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>🧬 Monitoraggio Esami del Sangue</Text>

      <Pressable onPress={toggleSection} style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Ultimo esame registrato</Text>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Pressable>

      {open && last ? (
        <View style={styles.cardBody}>
          <Text>🗓️ Data: {new Date(last.createdAt.seconds * 1000).toLocaleDateString()}</Text>
          <Text>🧪 anti-AChR: {last.antiAChR}</Text>
          <Text>🧪 anti-MuSK: {last.antiMuSK}</Text>
          <Text>🧪 anti-LRP4: {last.antiLRP4}</Text>
          <Text>📝 Note: {last.notes || "—"}</Text>
        </View>
      ) : (
        <Text style={{ marginTop: 12 }}>Nessun dato disponibile.</Text>
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
          <Text style={styles.reloadText}>Ricarica</Text>
        </View>
      </Pressable>

      <Toast />
    </ScrollView>
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
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#1e40af" },
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
  },
  reloadButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 30,
  },
  reloadText: { color: "#fff", fontWeight: "600" },
});

export default MonitoraggioClinicoSangue;
