import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseconfig";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { generateMonthlyPDF } from "../utils/generateMonthlyPDF";
import Toast from "react-native-toast-message";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import BottomNavigation from "../app/bottomnavigationnew";

const MonthlyReport = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const getMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const uid = getAuth().currentUser?.uid;
      if (!uid) throw new Error("Utente non autenticato");

      const { start, end } = getMonthRange();
      const startTimestamp = Timestamp.fromDate(start);
      const endTimestamp = Timestamp.fromDate(end);

      const collections = ["blood_tests", "diet", "sleep", "symptoms", "medications"];
      const results: any = {};

      for (const col of collections) {
        const ref = collection(db, `users/${uid}/${col}`);
        const q = query(ref, where("createdAt", ">=", startTimestamp), where("createdAt", "<=", endTimestamp));
        const snapshot = await getDocs(q);
        results[col] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }

      setData(results);
      Toast.show({ type: "success", text1: "Dati caricati", position: "top" });
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Errore", text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!data) return;
    await generateMonthlyPDF(data);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={48} color={Colors.blue} />
        <Text style={FontStyles.variants.mainTitle}>Monthly Report</Text>
        <Text style={FontStyles.variants.sectionTitle}>Download your health summary</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.blue} />
        ) : (
          <Pressable style={styles.button} onPress={handleGeneratePDF}>
            <Text style={styles.buttonText}>Scarica PDF Mensile</Text>
          </Pressable>
        )}
      </ScrollView>
      <BottomNavigation />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light1 },
  header: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: Colors.blue,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MonthlyReport;
