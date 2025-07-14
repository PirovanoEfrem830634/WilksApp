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
import BottomNavigation from "../app/bottomnavigationnew";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react-native";
import { getAuth } from "firebase/auth";
import { MotiView } from "moti";
import Toast from "react-native-toast-message";
import { evaluateCDSS, getPersonalizedAdvice } from "../utils/cdssLogic";
import { useFocusEffect } from "@react-navigation/native";
import { TouchableOpacity } from 'react-native';
import * as Animatable from "react-native-animatable";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { PressableScale } from "react-native-pressable-scale";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, BatteryLow, AlertCircle, Smile, TrendingUp, Bed} from "lucide-react-native";


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

const sectionMeta: Record<keyof FirestoreData, { label: string; icon: string; color: string }> = {
  sleep: {
    label: "Sleep Quality",
    icon: "bed",
    color: Colors.green,
  },
  diet: {
    label: "Diet",
    icon: "nutrition",
    color: Colors.orange,
  },
  medications: {
    label: "Medication",
    icon: "medkit",
    color: Colors.blue,
  },
  symptoms: {
    label: "Symptoms",
    icon: "pulse",
    color: Colors.red,
  },
};

const fetchAllData = async (): Promise<FirestoreData> => {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  if (!uid) throw new Error("User not authenticated");

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
  const [showAlerts, setShowAlerts] = useState(true);


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
        text1: '✅ Updated data',
        position: 'top',
        visibilityTime: 2000,
      });
    } catch (err: any) {
      console.error("Error while fetching:", err);
      Toast.show({
        type: 'error',
        text1: '❌ Error loading',
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

  const renderSection = (section: keyof FirestoreData, content: JSX.Element) => {
  const meta = sectionMeta[section];

  return (
    <View style={styles.card}>
      <PressableScale
        onPress={() => toggleSection(section)}
        activeScale={0.96}
        weight="light"
        style={styles.cardHeader}
      >
        <View style={styles.cardTitleRow}>
        <Ionicons name={meta.icon as keyof typeof Ionicons.glyphMap} size={20} color={meta.color} />
          <Text style={[styles.cardTitle, { color: meta.color }]}>{meta.label}</Text>
        </View>
        {open[section] ? (
          <Ionicons name="chevron-up" size={18} color={Colors.gray2} />
        ) : (
          <Ionicons name="chevron-down" size={18} color={Colors.gray2} />
        )}
      </PressableScale>
      {open[section] && <View style={styles.cardBody}>{content}</View>}
    </View>
  );
};
  const last = {
    sleep: data.sleep[0],
    diet: data.diet[0],
    medications: data.medications[0],
    symptoms: data.symptoms[0],
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerCentered}>
          <Ionicons name="git-branch-outline" size={42} color={Colors.blue} style={{ marginBottom: 10 }} />
          <Text style={FontStyles.variants.mainTitle}>Clinical Decision Support</Text>
          <Text style={styles.description}>Personalized analysis based on your data</Text>
        </View>

        <PressableScale
          onPress={() => {
            if (showAdvice) {
              setShowAdvice(false);
              setAdvice([]);
            } else {
              const tips = getPersonalizedAdvice({
                sleep: last.sleep,
                symptoms: last.symptoms,
                medications: last.medications,
              });
              setAdvice(tips);
              setShowAdvice(true);
            }
          }}          
            activeScale={0.96}
            weight="light"
            style={styles.adviceButton}
        >
            <Text style={styles.adviceButtonText}>Get Personalized Tips</Text>
        </PressableScale>

        {showAdvice && (
          <View style={styles.adviceBox}>
            <Text style={[FontStyles.variants.mainTitle, styles.adviceTitle]}>Tips for You</Text>
            {advice.map((tip, index) => (
              <View key={index} style={styles.adviceCard}>
                <Text style={styles.adviceText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}


        {alerts.length > 0 && showAlerts && (
          <View style={styles.alertBox}>
            <View style={styles.alertHeader}>
            <Text style={[FontStyles.variants.mainTitle, styles.alertTitle]}>CDSS Alerts</Text>
              <TouchableOpacity onPress={() => setShowAlerts(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            {alerts.map((alert, index) => (
              <View key={index} style={styles.alertCard}>
                <Text style={styles.alertText}>{alert}</Text>
              </View>
            ))}
          </View>
        )}

        <PressableScale
        onPress={reloadData}
        activeScale={0.96}
        weight="light"
        style={styles.reloadButton}
        >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MotiView
            animate={{ rotate: loading ? "360deg" : "0deg" }}
            transition={{ loop: loading, type: "timing", duration: 1000 }}
            style={{ width: 20, height: 20 }}
            >
            <RefreshCw size={20} color="#fff" />
            </MotiView>
            <Text style={styles.reloadText}>Refresh Data</Text>
        </View>
        </PressableScale>

        {/* Sezioni collapsible (invariate) */}
        {renderSection("sleep", last.sleep ? (
        <>
            <View style={styles.dataRow}>
            <Ionicons name="calendar" size={18} style={styles.iconLeft} color = {Colors.green} />
            <Text>{new Date(last.sleep.createdAt.seconds * 1000).toLocaleDateString()}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="time" size={18} style={styles.iconLeft} color = {Colors.green}/>
            <Text>Hours sleep: {last.sleep.hours}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="stats-chart" size={18} style={styles.iconLeft} color = {Colors.green}/>
            <Text>Quality: {last.sleep.quality}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="cloud" size={18} style={styles.iconLeft} color = {Colors.green}/>
            <Text>Apnea: {last.sleep.apnea ? "Sì" : "No"}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="repeat" size={18} style={styles.iconLeft} color = {Colors.green}/>
            <Text>Frequent awakenings: {last.sleep.frequentWakeups ? "Sì" : "No"}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="moon" size={18} style={styles.iconLeft} color = {Colors.green}/>
            <Text>Nightmares: {last.sleep.nightmares ? "Sì" : "No"}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="document-text" size={18} style={styles.iconLeft} color = {Colors.green}/>
            <Text>Notes: {last.sleep.notes || "—"}</Text>
            </View>
        </>
        ) : <Text>No data available.</Text>)}

        {renderSection("diet", last.diet ? (
        <>
            <View style={styles.dataRow}>
            <Ionicons name="calendar" size={18} style={styles.iconLeft} color = {Colors.orange}/>
            <Text>{last.diet.id}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="cafe" size={18} style={styles.iconLeft} color = {Colors.orange}/>
            <Text>Breakfast: {last.diet.breakfast}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="restaurant" size={18} style={styles.iconLeft} color = {Colors.orange}/>
            <Text>Lunch: {last.diet.lunch}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="pizza" size={18} style={styles.iconLeft} color = {Colors.orange}/>
            <Text>Dinner: {last.diet.dinner}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="ice-cream" size={18} style={styles.iconLeft} color = {Colors.orange}/>
            <Text>Snack: {last.diet.snack}</Text>
            </View>
        </>
        ) : <Text>No data available.</Text>)}

        {renderSection("medications", last.medications ? (
        <>
            <View style={styles.dataRow}>
            <Ionicons name="calendar" size={18} style={styles.iconLeft} color = {Colors.blue}/>
            <Text>{new Date(last.medications.createdAt.seconds * 1000).toLocaleDateString()}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="medkit" size={18} style={styles.iconLeft} color = {Colors.blue}/>
            <Text>Name: {last.medications.name}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="flask" size={18} style={styles.iconLeft} color = {Colors.blue}/>
            <Text>Dose: {last.medications.dose}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="calendar-clear" size={18} style={styles.iconLeft} color = {Colors.blue}/>
            <Text>Days: {last.medications.days?.join(", ")}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="alarm" size={18} style={styles.iconLeft} color = {Colors.blue}/>
            <Text>Hours: {last.medications.times?.join(", ")}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="notifications" size={18} style={styles.iconLeft} color = {Colors.blue}/>
            <Text>Notifications: {last.medications.notifications ? "Attive" : "Disattivate"}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="document-text" size={18} style={styles.iconLeft} color = {Colors.blue}/>
            <Text>Notes: {last.medications.notes || "—"}</Text>
            </View>
        </>
        ) : <Text>No data available.</Text>)}


        {renderSection("symptoms", last.symptoms ? (
        <>
            <View style={styles.dataRow}>
            <Ionicons name="calendar" size={18} style={styles.iconLeft} color = {Colors.red}/>
            <Text>{last.symptoms.id}</Text>
            </View>
            <View style={styles.dataRow}>
            <Activity size={18} style={styles.iconLeft} color = {Colors.red}/>
            <Text>Muscle weakness: {last.symptoms.debolezzaMuscolare ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.dataRow}>
            <BatteryLow size={18} style={styles.iconLeft} color = {Colors.red}/>
            <Text>Fatigue: {last.symptoms.affaticamentoMuscolare}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="cloud" size={18} style={styles.iconLeft} color = {Colors.red}/>
            <Text>Respiratory difficulties: {last.symptoms.difficoltaRespiratorie ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.dataRow}>
            <AlertCircle size={18} style={styles.iconLeft} color = {Colors.red}/>
            <Text>Anxiety: {last.symptoms.ansia ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.dataRow}>
            <Smile size={18} style={styles.iconLeft} color = {Colors.red}/>
            <Text>Humor: {last.symptoms.umore || "—"}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="mic" size={18} style={styles.iconLeft} color = {Colors.red}/>
            <Text>Dysarthria: {last.symptoms.disartria ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="restaurant" size={18} style={styles.iconLeft} color = {Colors.red}/>
            <Text>Dysphagia: {last.symptoms.disfagia ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="eye" size={18} style={styles.iconLeft} color = {Colors.red}/>
            <Text>Diplopia: {last.symptoms.diplopia ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.dataRow}>
            <Ionicons name="eye-off" size={18} style={styles.iconLeft} color = {Colors.red}/>
            <Text>Ptosis: {last.symptoms.ptosi ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.dataRow}>
            <TrendingUp size={18} style={styles.iconLeft} color = {Colors.red}/>
            <Text>Trend: {last.symptoms.andamentoSintomi || "—"}</Text>
            </View>
            <View style={styles.dataRow}>
            <Bed size={18} style={styles.iconLeft} color = {Colors.red}/>
            <Text>Sleep: {last.symptoms.sonno || "—"}</Text>
            </View>
        </>
        ) : <Text>No data available.</Text>)}

      </ScrollView>

      <BottomNavigation />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light1 },
  scroll: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", color: "#1f2937" },
  subtitle: { fontSize: 16, textAlign: "center", color: "#6b7280", marginBottom: 20 },
  reloadButton: {
    backgroundColor: Colors.blue,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  reloadText: { color: "#fff", fontWeight: "600", fontSize: 16 },
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
    textAlign: "center",
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
  backgroundColor: Colors.green,
  paddingVertical: 14,
  paddingHorizontal: 24,
  marginTop: 15,
  marginBottom: 15,
  borderRadius: 20,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
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
  alertHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
  },
  closeButton: {
  fontSize: 18,
  fontWeight: '600',
  color: '#8E8E93', // grigio stile iOS
  paddingHorizontal: 8,
  paddingVertical: 2,
  },
  gradientBackground: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 180,
  zIndex: -1,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  },
  mainHeader: {
  marginTop: 32,
  marginBottom: 20,
  alignItems: "center",
  paddingHorizontal: 20,
  },
  iconWrapper: {
  backgroundColor: Colors.white,
  padding: 16,
  borderRadius: 20,
  marginBottom: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
  },
  dataRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 6,
  },
  iconLeft: {
  width: 22,
  },
  cardTitleRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  },
  headerCentered: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.gray3,
    marginTop: 6,
    textAlign: "center",
  },
});

export default CDSSPage;