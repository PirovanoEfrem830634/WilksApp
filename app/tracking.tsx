import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  StyleSheet,
} from "react-native";
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import {
  Activity,
  Eye,
  Wind,
  ChevronsDown,
  DivideCircle,
  Mic,
  AlertTriangle,
  TrendingUp,
  Smile,
  BedDouble,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import BottomNavigation from "../app/BottomNavigation";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import * as Animatable from 'react-native-animatable';

// Type per i dati del form
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

  const handleInputChange = <K extends keyof FormDataType>(field: K, value: FormDataType[K]) => {
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
      alert("Sintomi salvati con successo!");
    } catch (error) {
      console.error("Errore salvataggio sintomi:", error);
      alert("Errore nel salvataggio.");
    }
  };

  const dropdownStringFields: {
    key: keyof Pick<FormDataType, 'andamentoSintomi' | 'umore' | 'sonno'>,
    label: string,
    icon: JSX.Element,
    options: string[]
  }[] = [
    {
      key: "andamentoSintomi",
      label: "Symptom Progression",
      icon: <TrendingUp size={20} color="#3b3b3b" />,
      options: ["Stabile", "Peggiorato", "Migliorato"],
    },
    {
      key: "umore",
      label: "Mood",
      icon: <Smile size={20} color="#3b3b3b" />,
      options: ["Happy", "Neutral", "Sad", "Anxious"],
    },
    {
      key: "sonno",
      label: "Sleep Quality",
      icon: <BedDouble size={20} color="#3b3b3b" />,
      options: ["Buono", "Normale", "Scarso", "Insonnia"],
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {[{
          label: "Muscle Weakness",
          key: "debolezzaMuscolare",
          icon: <Activity size={24} color="#333" />
        }, {
          label: "Swallowing Difficulty",
          key: "disfagia",
          icon: <ChevronsDown size={24} color="#333" />
        }, {
          label: "Speech Difficulty",
          key: "disartria",
          icon: <Mic size={24} color="#333" />
        }, {
          label: "Ptosis (Drooping Eyelids)",
          key: "ptosi",
          icon: <Eye size={24} color="#333" />
        }, {
          label: "Double Vision",
          key: "diplopia",
          icon: <DivideCircle size={24} color="#333" />
        }, {
          label: "Breathing Difficulties",
          key: "difficoltaRespiratorie",
          icon: <Wind size={24} color="#333" />
        }, {
          label: "Anxiety",
          key: "ansia",
          icon: <AlertTriangle size={24} color="#333" />
        }].map((item, index) => (
          <Animatable.View
            key={item.key}
            animation="fadeInUp"
            delay={index * 100}
            duration={600}
            useNativeDriver
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconText}>
                  {item.icon}
                  <Text style={styles.cardText}>{item.label}</Text>
                </View>
                <Switch
                  value={formData[item.key as keyof FormDataType] as boolean}
                  onValueChange={(value) => handleInputChange(item.key as keyof FormDataType, value)}
                />
              </View>
            </View>
          </Animatable.View>
        ))}

        {dropdownStringFields.map((dropdown) => (
          <View key={dropdown.key} style={styles.cardPicker}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconText}>
                {dropdown.icon}
                <Text style={styles.cardText}>{dropdown.label}</Text>
              </View>
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
          <Text style={styles.cardText}>Muscle Fatigue Level</Text>
          <Slider
            style={{ width: "100%" }}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={formData.affaticamentoMuscolare}
            onValueChange={(value) => handleInputChange("affaticamentoMuscolare", value)}
          />
          <Text style={styles.sliderValue}>{formData.affaticamentoMuscolare}</Text>
        </View>

        <Pressable onPress={saveSymptoms} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </Pressable>
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  scrollView: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardIconText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    marginLeft: 10,
  },
  input: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D1D6",
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
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
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 5,
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 10,
  },
  navText: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 4,
  },
  cardPicker: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  pickerWrapper: {
    marginTop: 10,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
  },
  grid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  },
  symptomCard: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  selectedCard: {
    borderColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  symptomEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  symptomLabel: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#1C1C1E",
  },
});
