import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "../app/BottomNavigation";
import { auth, db } from "../firebaseconfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import Toast from 'react-native-toast-message';
import { TouchableOpacity} from "react-native";
import { useFocusEffect } from '@react-navigation/native';

export default function SleepTracking() {
  const [quality, setQuality] = useState("Normale");
  const [hours, setHours] = useState(6);
  const [frequentWakeups, setFrequentWakeups] = useState(false);
  const [nightmares, setNightmares] = useState(false);
  const [apnea, setApnea] = useState(false);
  const [notes, setNotes] = useState("");

useFocusEffect(
  React.useCallback(() => {
    // Reset valori ogni volta che entri nella schermata
    setFrequentWakeups(false);
    setNightmares(false);
    setApnea(false);
    setQuality("Normale");
    setHours(6);
    setNotes("");
  }, [])
);

const handleSave = async () => {
  const user = auth.currentUser;
  if (!user) {
    Toast.show({
      type: "error",
      text1: "❌ Utente non autenticato",
      position: "top",
    });
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const ref = doc(db, "users", user.uid, "sleep", today);

  const sleepData = {
    quality,
    hours,
    frequentWakeups,
    nightmares,
    apnea,
    notes,
    createdAt: Timestamp.now(),
  };

  try {
  await setDoc(ref, sleepData);
  Toast.show({
    type: "success",
    text1: "💤 Dati salvati con successo",
    position: "top",
  });
} catch (err) {
  const error = err as Error;
  console.error("Errore salvataggio:", error);
  Toast.show({
    type: "error",
    text1: "❌ Errore durante il salvataggio",
    text2: error.message,
    position: "top",
  });
}
};

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}>
        <Text style={styles.title}>🛌 Sleep Tracking</Text>
        <Text style={styles.subtitle}>Monitora la qualità del sonno</Text>
        {/* Qualità del sonno */}
        <View style={styles.card}>
          <Text style={styles.label}>
            <Ionicons name="moon-outline" size={20} color="#333" /> Qualità del sonno
          </Text>
          <Picker
            selectedValue={quality}
            onValueChange={setQuality}
            style={styles.picker}
          >
            <Picker.Item label="Buono" value="Buono" />
            <Picker.Item label="Normale" value="Normale" />
            <Picker.Item label="Scarso" value="Scarso" />
            <Picker.Item label="Insonnia" value="Insonnia" />
          </Picker>
        </View>

        {/* Durata del sonno */}
        <View style={styles.card}>
  <Text style={styles.label}>🕓 Durata del sonno (ore)</Text>
  <View style={styles.pillContainer}>
      {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((val) => (
        <Pressable
          key={val}
          onPress={() => setHours(val)}
          style={[
            styles.pill,
            hours === val && styles.pillSelected
          ]}
        >
          <Text style={[
            styles.pillText,
            hours === val && styles.pillTextSelected
          ]}>
            {val}h
          </Text>
        </Pressable>
      ))}
    </View>
  </View>


        {/* Switch vari */}
        {[
        {
          label: "😵‍💫 Sveglie frequenti",
          value: frequentWakeups,
          setter: setFrequentWakeups,
        },
        {
          label: "😨 Incubi",
          value: nightmares,
          setter: setNightmares,
        },
        {
          label: "😮‍💨 Apnea notturna",
          value: apnea,
          setter: setApnea,
        },
      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => item.setter(!item.value)}
          style={[
            styles.toggleCard,
            item.value && styles.toggleCardActive,
          ]}
        >
          <Text style={[
            styles.toggleCardText,
            item.value && styles.toggleCardTextActive
          ]}>
          {item.label}
</Text>

        </TouchableOpacity>
      ))}

        {/* Note aggiuntive */}
        <View style={styles.card}>
          <Text style={styles.label}>
            <Ionicons name="document-text-outline" size={20} color="#333" /> Note aggiuntive
          </Text>
          <TextInput
            multiline
            placeholder="Scrivi qui..."
            style={styles.textArea}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Pulsante Salva */}
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>Salva</Text>
        </Pressable>
      </ScrollView>
      <Toast />
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", color: "#1f2937" },
  subtitle: { fontSize: 16, textAlign: "center", color: "#6b7280", marginBottom: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1C1C1E",
  },
  picker: {
    backgroundColor: "#F4F4F6",
    borderRadius: 12,
    padding: 10,
  },
  sliderValue: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
  },
  switchRow: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    minHeight: 80,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
  },
  saveButton: {
  backgroundColor: "#007AFF",
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: 20,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
  },
  saveText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 24,
  paddingVertical: 16,
  paddingHorizontal: 20,
  marginBottom: 16,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
  },
  toggleCardActive: {
    shadowColor: "#007AFF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    textShadowColor: "#007AFF"
  },
  toggleCardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  toggleCardTextActive: {
  color: "#007AFF",
  },
  slider: {
  width: "100%",
  height: 40,
  },
  pillContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
},

pill: {
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 20,
  backgroundColor: "#F2F2F7",
  borderWidth: 1,
  borderColor: "#E0E0E0",
  },

  pillSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },

  pillText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C1C1E",
  },

  pillTextSelected: {
    color: "#FFFFFF",
  },

});
