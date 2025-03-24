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
import { Activity, Eye, Wind, ChevronsDown, DivideCircle, Mic, Home, User } from "lucide-react-native";
import { useRouter } from "expo-router";

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
  });
  
  const router = useRouter();

  // Funzione per aggiornare i dati
  const handleInputChange = <K extends keyof FormDataType>(field: K, value: FormDataType[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
        }].map((item) => (
          <View key={item.key} style={styles.card}>
            <View style={styles.cardHeader}>
              {item.icon}
              <Text style={styles.cardText}>{item.label}</Text>
              <Switch
                value={formData[item.key as keyof FormDataType] as boolean}
                onValueChange={(value) => handleInputChange(item.key as keyof FormDataType, value)}
              />
            </View>
          </View>
        ))}

        {/* Input per andamento sintomi */}
        <View style={styles.card}>
          <Text style={styles.cardText}>Symptom Progression</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe progression"
            value={formData.andamentoSintomi}
            onChangeText={(text) => handleInputChange("andamentoSintomi", text)}
          />
        </View>

        {/* Slider per affaticamento muscolare */}
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

        {/* Submit Button */}
        <Pressable onPress={() => alert("Submitted")} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </Pressable>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <Pressable onPress={() => router.push("/")} style={styles.navButton}>
          <Home size={24} color="#007AFF" />
          <Text style={styles.navText}>Home</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/tracking")} style={styles.navButton}>
          <Activity size={24} color="#007AFF" />
          <Text style={styles.navText}>Tracking</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/profile")} style={styles.navButton}>
          <User size={24} color="#007AFF" />
          <Text style={styles.navText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  sliderValue: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFF",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  bottomIcon: {
    padding: 10,
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
});