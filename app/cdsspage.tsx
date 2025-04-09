import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseconfig";
import BottomNavigation from "../app/BottomNavigation";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react-native";
import { getAuth } from "firebase/auth";
import { MotiView } from "moti";
import Toast from "react-native-toast-message";
import { evaluateCDSS, getPersonalizedAdvice } from "../utils/cdssLogic";
import { useFocusEffect } from "@react-navigation/native";


// Abilita LayoutAnimation su Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FirestoreData = {
  diet: any[];
  medications: any[];
  sleep: any[];
  symptoms: any[];
};

type SectionState = {
  [key: string]: boolean;
};

const fetchAllData = async (): Promise<FirestoreData> => {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  if (!uid) throw new Error("Utente non autenticato");

  const collections = ["diet", "medications", "sleep", "symptoms"];
  const data: FirestoreData = { diet: [], medications: [], sleep: [], symptoms: [] };

  for (const name of collections) {
    const snapshot = await getDocs(collection(db, `users/${uid}/${name}`));
    const docs = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const getDate = (entry: any) => {
          if (entry.createdAt?.seconds) return new Date(entry.createdAt.seconds * 1000);
          if (entry.createdAt) return new Date(entry.createdAt);
          return new Date(entry.id);
        };
        return getDate(b).getTime() - getDate(a).getTime();
      });

    data[name as keyof FirestoreData] = docs;
  }

  return data;
};

const CDSSPage = () => {
  const [advice, setAdvice] = useState<string[]>([]);
  const [showAdvice, setShowAdvice] = useState(false);
  const [data, setData] = useState<FirestoreData>({ diet: [], medications: [], sleep: [], symptoms: [] });
  const [open, setOpen] = useState<SectionState>({
    sleep: false,
    diet: false,
    medications: false,
    symptoms: false,
  });
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  const reloadData = async () => {
    try {
      setLoading(true);
      const allData = await fetchAllData();
      setData(allData);

      const last = {
        sleep: allData.sleep[0],
        medications: allData.medications[0],
        symptoms: allData.symptoms[0],
      };

      const evaluatedAlerts = evaluateCDSS({
        sleep: last.sleep,
        medications: last.medications,
        symptoms: last.symptoms,
      });
      setAlerts(evaluatedAlerts);

      Toast.show({
        type: 'success',
        text1: '✅ Dati aggiornati',
        position: 'top',
        visibilityTime: 2000,
      });
    } catch (err: any) {
      console.error("Errore durante il fetch:", err);
      Toast.show({
        type: 'error',
        text1: '❌ Errore nel caricamento',
        text2: err.message,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setShowAdvice(false);
      setAdvice([]);
    }, [])
  );

  const toggleSection = (section: keyof SectionState) => {
    LayoutAnimation.easeInEaseOut();
    setOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderSection = (title: string, section: keyof FirestoreData, content: JSX.Element) => (
    <View style={styles.card}>
      <Pressable onPress={() => toggleSection(section)} style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {open[section] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Pressable>
      {open[section] && <View style={styles.cardBody}>{content}</View>}
    </View>
  );

  const last = {
    sleep: data.sleep[0],
    diet: data.diet[0],
    medications: data.medications[0],
    symptoms: data.symptoms[0],
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🩺 CDSS – Analisi dei tuoi dati</Text>
        <Text style={styles.subtitle}>Dati recenti riassunti per supportare il CDSS</Text>

        <Pressable
          onPress={() => {
            const tips = getPersonalizedAdvice({
              sleep: last.sleep,
              symptoms: last.symptoms,
              medications: last.medications,
            });
            setAdvice(tips);
            setShowAdvice(true);
          }}
          style={styles.adviceButton}
        >
          <Text style={styles.adviceButtonText}>💡 Dammi dei consigli personalizzati</Text>
        </Pressable>

        {showAdvice && (
          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>🧠 Consigli per te</Text>
            {advice.map((tip, index) => (
              <View key={index} style={styles.adviceCard}>
                <Text style={styles.adviceText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}


        {alerts.length > 0 && (
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>⚠️ Alert CDSS</Text>
            {alerts.map((alert, index) => (
              <View key={index} style={styles.alertCard}>
                <Text style={styles.alertText}>{alert}</Text>
              </View>
            ))}
          </View>
        )}

        <Pressable onPress={reloadData} style={styles.reloadButton} disabled={loading}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MotiView
              animate={{ rotate: loading ? "360deg" : "0deg" }}
              transition={{ loop: loading, type: "timing", duration: 1000 }}
              style={{ width: 20, height: 20 }}
            >
              <RefreshCw size={20} color="#fff" />
            </MotiView>
            <Text style={styles.reloadText}>Ricarica dati</Text>
          </View>
        </Pressable>

        {/* Sezioni collapsible (invariate) */}
        {renderSection("😴 Sonno", "sleep", last.sleep ? (
          <>
            <Text>🗓️ {new Date(last.sleep.createdAt.seconds * 1000).toLocaleDateString()}</Text>
            <Text>⏰ Ore dormite: {last.sleep.hours}</Text>
            <Text>💤 Qualità: {last.sleep.quality}</Text>
            <Text>😵 Apnea: {last.sleep.apnea ? "Sì" : "No"}</Text>
            <Text>🔁 Risvegli frequenti: {last.sleep.frequentWakeups ? "Sì" : "No"}</Text>
            <Text>🌙 Incubi: {last.sleep.nightmares ? "Sì" : "No"}</Text>
            <Text>📝 Note: {last.sleep.notes || "—"}</Text>
          </>
        ) : <Text>Nessun dato disponibile.</Text>)}

        {renderSection("🥗 Dieta", "diet", last.diet ? (
          <>
            <Text>🗓️ {last.diet.id}</Text>
            <Text>🥐 Colazione: {last.diet.breakfast}</Text>
            <Text>🍝 Pranzo: {last.diet.lunch}</Text>
            <Text>🍽️ Cena: {last.diet.dinner}</Text>
            <Text>🍪 Snack: {last.diet.snack}</Text>
          </>
        ) : <Text>Nessun dato disponibile.</Text>)}

        {renderSection("💊 Farmaci", "medications", last.medications ? (
          <>
            <Text>🗓️ {new Date(last.medications.createdAt.seconds * 1000).toLocaleDateString()}</Text>
            <Text>💊 Nome: {last.medications.name}</Text>
            <Text>💉 Dose: {last.medications.dose}</Text>
            <Text>📆 Giorni: {last.medications.days?.join(", ")}</Text>
            <Text>🕐 Orari: {last.medications.times?.join(", ")}</Text>
            <Text>🔔 Notifiche: {last.medications.notifications ? "Attive" : "Disattivate"}</Text>
            <Text>📝 Note: {last.medications.notes || "—"}</Text>
          </>
        ) : <Text>Nessun dato disponibile.</Text>)}

        {renderSection("🧪 Sintomi", "symptoms", last.symptoms ? (
          <>
            <Text>🗓️ {last.symptoms.id}</Text>
            <Text>💪 Debolezza muscolare: {last.symptoms.debolezzaMuscolare ? "Sì" : "No"}</Text>
            <Text>🥱 Affaticamento: {last.symptoms.affaticamentoMuscolare}</Text>
            <Text>🫁 Difficoltà respiratorie: {last.symptoms.difficoltaRespiratorie ? "Sì" : "No"}</Text>
            <Text>😵 Ansia: {last.symptoms.ansia ? "Sì" : "No"}</Text>
            <Text>🧠 Umore: {last.symptoms.umore || "—"}</Text>
            <Text>🗣️ Disartria: {last.symptoms.disartria ? "Sì" : "No"}</Text>
            <Text>🍽️ Disfagia: {last.symptoms.disfagia ? "Sì" : "No"}</Text>
            <Text>👁️ Diplopia: {last.symptoms.diplopia ? "Sì" : "No"}</Text>
            <Text>👁️ Ptosi: {last.symptoms.ptosi ? "Sì" : "No"}</Text>
            <Text>📈 Andamento: {last.symptoms.andamentoSintomi || "—"}</Text>
            <Text>🛌 Sonno: {last.symptoms.sonno || "—"}</Text>
          </>
        ) : <Text>Nessun dato disponibile.</Text>)}
      </ScrollView>

      <BottomNavigation />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f5ff" },
  scroll: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", color: "#1f2937" },
  subtitle: { fontSize: 16, textAlign: "center", color: "#6b7280", marginBottom: 20 },
  reloadButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 24,
  },
  reloadText: { color: "#fff", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#1e40af" },
  cardBody: { paddingTop: 4 },
  alertBox: {
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 8,
  },
  alertCard: {
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  alertText: {
    color: "#78350f",
    fontSize: 16,
  },
  adviceButton: {
    backgroundColor: "#10b981",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 20,
  },
  adviceButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  adviceBox: {
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#34d399",
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 8,
    textAlign: "center",
  },
  adviceCard: {
    backgroundColor: "#d1fae5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  adviceText: {
    color: "#064e3b",
    fontSize: 16,
  },  
});

export default CDSSPage;
