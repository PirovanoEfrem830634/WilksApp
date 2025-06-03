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
import BottomNavigation from "../app/BottomNavigation";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import * as Animatable from "react-native-animatable";

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
    emoji: string;
  }[] = [
    { key: "debolezzaMuscolare", label: "Muscle Weakness", emoji: "💪" },
    { key: "disfagia", label: "Swallowing Difficulty", emoji: "🥄" },
    { key: "disartria", label: "Speech Difficulty", emoji: "🗣️" },
    { key: "ptosi", label: "Ptosis (Drooping Eyelids)", emoji: "👁️" },
    { key: "diplopia", label: "Double Vision", emoji: "👓" },
    { key: "difficoltaRespiratorie", label: "Breathing Difficulties", emoji: "🌬️" },
    { key: "ansia", label: "Anxiety", emoji: "⚠️" },
  ];

  const dropdownStringFields: {
    key: keyof Pick<FormDataType, "andamentoSintomi" | "umore" | "sonno">;
    label: string;
    emoji: string;
    options: string[];
  }[] = [
    {
      key: "andamentoSintomi",
      label: "Symptom Progression",
      emoji: "📈",
      options: ["Stabile", "Peggiorato", "Migliorato"],
    },
    {
      key: "umore",
      label: "Mood",
      emoji: "🙂",
      options: ["Happy", "Neutral", "Sad", "Anxious"],
    },
    {
      key: "sonno",
      label: "Sleep Quality",
      emoji: "🛏️",
      options: ["Buono", "Normale", "Scarso", "Insonnia"],
    },
  ];

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInUp" duration={600} style={{ flex: 1 }}>
          <View style={styles.header}>
          <Text style={styles.pageTitle}>📝 Symptom Tracking</Text>
          <Text style={styles.pageSubtitle}>
            Select the symptoms you're experiencing today
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {symptomFields.map((item, index) => (
            <Pressable
              key={item.key}
              onPress={() => handleToggle(item.key)}
              style={[
                styles.symptomCard,
                formData[item.key] ? styles.selectedCard : null,
              ]}
            >
              <View style={styles.symptomRow}>
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.symptomLabel}>{item.label}</Text>
              </View>
            </Pressable>
          ))}

          {dropdownStringFields.map((dropdown) => (
            <View key={dropdown.key} style={styles.card}>
              <Text style={styles.cardText}>
                {dropdown.emoji} {dropdown.label}
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData[dropdown.key]}
                  onValueChange={(value) =>
                    handleInputChange(dropdown.key, value)
                  }
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
            <Text style={styles.cardText}>⚡ Muscle Fatigue Level</Text>
            <Slider
              style={{ width: "100%" }}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={formData.affaticamentoMuscolare}
              onValueChange={(value) =>
                handleInputChange("affaticamentoMuscolare", value)
              }
            />
            <Text style={styles.sliderValue}>
              {formData.affaticamentoMuscolare}
            </Text>
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
    backgroundColor: "#F2F2F7",
  },
  header: {
  paddingHorizontal: 20,
  paddingTop: 20,
  marginBottom: 10,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
  scrollView: {
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
  },
  sliderValue: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginTop: 10,
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
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  symptomCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  borderWidth: 2,
  borderColor: "#E0E0E0",
  paddingVertical: 16,
  paddingHorizontal: 20,
  marginBottom: 15,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
},

symptomRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

emoji: {
  fontSize: 24,
},

symptomLabel: {
  fontSize: 16,
  fontWeight: "600",
  color: "#1C1C1E",
},
  selectedCard: {
    borderColor: "#007AFF",
    backgroundColor: "#EAF4FC",
    shadowColor: "#007AFF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
