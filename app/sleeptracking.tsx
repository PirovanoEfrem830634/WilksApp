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

export default function SleepTracking() {
  const [quality, setQuality] = useState("Normale");
  const [hours, setHours] = useState(6);
  const [frequentWakeups, setFrequentWakeups] = useState(false);
  const [nightmares, setNightmares] = useState(false);
  const [apnea, setApnea] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Utente non autenticato");
      return;
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
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
      alert("Dati salvati con successo!");
    } catch (err) {
      console.error("Errore salvataggio:", err);
      alert("Errore durante il salvataggio.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
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
          <Text style={styles.label}>
            <Ionicons name="time-outline" size={20} color="#333" /> Durata del sonno (ore)
          </Text>
          <Slider
            style={{ width: "100%" }}
            minimumValue={0}
            maximumValue={12}
            step={1}
            value={hours}
            onValueChange={setHours}
          />
          <Text style={styles.sliderValue}>{hours} ore</Text>
        </View>

        {/* Switch vari */}
        {[{
          label: "Svegli frequenti",
          value: frequentWakeups,
          setter: setFrequentWakeups
        }, {
          label: "Incubi",
          value: nightmares,
          setter: setNightmares
        }, {
          label: "Apnea notturna",
          value: apnea,
          setter: setApnea
        }].map((item, index) => (
          <View key={index} style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              <Ionicons name="remove-circle-outline" size={20} color="#333" /> {item.label}
            </Text>
            <Switch
              value={item.value}
              onValueChange={item.setter}
            />
          </View>
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

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
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
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
