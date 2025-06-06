import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import BottomNavigation from "../app/bottomnavigationnew";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import * as Animatable from "react-native-animatable";
import { Activity, AlertCircle, Eye, Mic, Droplet, Wind, TrendingUp, Smile, Moon, Check, X } from "lucide-react-native";
import FontStyles from "../Styles/fontstyles";
import Colors from "../Styles/color";
import { PressableScale } from "react-native-pressable-scale";
import { LinearGradient } from 'expo-linear-gradient';

type FormDataType = {
  debolezzaMuscolare: boolean;
  andamentoSintomi: string;
  affaticamentoMuscolare: number;
  disfagia: boolean;
  disartria: boolean;
  ptosi: boolean;
  diplopia: boolean;
  difficoltaRespiratorie: boolean;
  ansia: boolean;
  umore: string;
  sonno: string;
};

export default function SymptomTracking() {
  const [formData, setFormData] = useState<FormDataType>({
    debolezzaMuscolare: false,
    andamentoSintomi: "",
    affaticamentoMuscolare: 0,
    disfagia: false,
    disartria: false,
    ptosi: false,
    diplopia: false,
    difficoltaRespiratorie: false,
    ansia: false,
    umore: "",
    sonno: "",
  });

  const router = useRouter();

  const handleToggle = (key: keyof FormDataType) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = <K extends keyof FormDataType>(
    field: K,
    value: FormDataType[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveSymptoms = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Utente non loggato");
      return;
    }

    const uid = user.uid;
    const today = new Date().toISOString().split("T")[0];
    const symptomsDocRef = doc(db, "users", uid, "symptoms", today);

    const dataToSave = {
      ...formData,
      dataInserimento: Timestamp.now(),
    };

    try {
      await setDoc(symptomsDocRef, dataToSave);
      Alert.alert("Success", "Symptoms saved successfully!");
    } catch (error) {
      console.error("Errore salvataggio sintomi:", error);
      alert("Errore nel salvataggio.");
    }
  };

const symptomFields: {
    key: keyof FormDataType;
    label: string;
    icon: JSX.Element;
    }[] = [
    { key: "debolezzaMuscolare", label: "Muscle Weakness", icon: <Activity size={18} color={Colors.blue} /> },
    { key: "disfagia", label: "Swallowing Difficulty", icon: <Droplet size={18} color={Colors.blue} /> },
    { key: "disartria", label: "Speech Difficulty", icon: <Mic size={18} color={Colors.blue} /> },
    { key: "ptosi", label: "Ptosis", icon: <Eye size={18} color={Colors.blue} /> },
    { key: "diplopia", label: "Double Vision", icon: <Eye size={18} color={Colors.blue} /> },
    { key: "difficoltaRespiratorie", label: "Breathing Difficulty", icon: <Wind size={18} color={Colors.blue} /> },
    { key: "ansia", label: "Anxiety", icon: <AlertCircle size={18} color={Colors.blue} /> },
  ];

    
    const dropdownFields: {
    key: keyof Pick<FormDataType, "andamentoSintomi" | "umore" | "sonno">;
    label: string;
    icon: JSX.Element;
    options: string[];
    }[] = [
    {
        key: "andamentoSintomi",
        label: "Symptom Progression",
        icon: <TrendingUp size={18} color={Colors.blue} />,
        options: ["Stabile", "Peggiorato", "Migliorato"],
    },
    {
        key: "umore",
        label: "Mood",
        icon: <Smile size={18} color={Colors.blue} />,
        options: ["Happy", "Neutral", "Sad", "Anxious"],
    },
    {
        key: "sonno",
        label: "Sleep Quality",
        icon: <Moon size={18} color={Colors.blue} />,
        options: ["Buono", "Normale", "Scarso", "Insonnia"],
    },
    ];

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInUp" duration={600} style={{ flex: 1 }}>
        <LinearGradient
        colors={["#D1E9FF", "#F2F2F7"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
        />
      <View style={styles.mainHeader}>
        <View style={styles.iconWrapper}>
            <Activity size={48} color={Colors.blue}  />
        </View>
        <Text style={FontStyles.variants.mainTitle}>Symptom Tracking</Text>
        <Text style={FontStyles.variants.sectionTitle}>Today’s Symptoms Overview</Text>
      </View>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {symptomFields.map((item) => (
            <PressableScale
            key={item.key}
            onPress={() => handleToggle(item.key)}
            style={[styles.card, !!formData[item.key] && styles.cardSelected]}
            weight="light"
            activeScale={0.96}
            >
                <View style={styles.cardHeader}>
                {item.icon}
                <Text style={styles.cardLabel}>{item.label}</Text>
                <View style={{ flex: 1 }} />
                {formData[item.key] ? (
                    <Check size={18} color="#007AFF" />
                ) : (
                    <X size={18} color="#C7C7CC" />
                )}
                </View>
            </PressableScale>
            ))}

          {dropdownFields.map((dropdown) => (
            <View key={dropdown.key} style={styles.card}>
              <View style={styles.cardHeader}>
                {dropdown.icon}
                <Text style={styles.cardLabel}>{dropdown.label}</Text>
              </View>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData[dropdown.key]}
                  onValueChange={(value) => handleInputChange(dropdown.key, value)}
                  style={styles.picker}
                >
                  {dropdown.options.map((option) => (
                    <Picker.Item label={option} value={option} key={option} />
                  ))}
                </Picker>
              </View>
            </View>
          ))}

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Activity size={18} color={Colors.blue} />
              <Text style={styles.cardLabel}>Muscle Fatigue</Text>
            </View>
            <Slider
              style={{ width: "100%" }}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={formData.affaticamentoMuscolare}
              onValueChange={(value) =>
                handleInputChange("affaticamentoMuscolare" as keyof FormDataType, value)
              }
            />
            <Text style={styles.cardValue}>{formData.affaticamentoMuscolare} / 10</Text>
          </View>

          <Pressable onPress={saveSymptoms} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </Pressable>
        </ScrollView>
      </Animatable.View>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light1,
  },
  scrollView: {
    padding: 20,
    paddingBottom: 100,
  },
  gradientBackground: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 160,
  zIndex: -1,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    borderColor: Colors.blue,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray1,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    textAlign: "left",
  },
  pickerWrapper: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
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
  mainTitle: {
  fontSize: 24,
  fontWeight: "700",
  color: "#1C1C1E",
  },
  mainSubtitle: {
  fontSize: 14,
  color: "#666",
  marginTop: 4,
  },
  iconSelected: {
  backgroundColor: Colors.green, 
  borderRadius: 20,
  padding: 4,
},
});