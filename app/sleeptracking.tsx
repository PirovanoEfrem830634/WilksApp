import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  TextInput,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import {
  Moon,
  Clock,
  BellOff,
  FileText,
  BedDouble,
} from "lucide-react-native";
import BottomNavigation from "../app/BottomNavigation";

export default function SleepTracking() {
  const [sleepQuality, setSleepQuality] = useState("Normale");
  const [sleepDuration, setSleepDuration] = useState(6);
  const [frequentWakeUps, setFrequentWakeUps] = useState(false);
  const [nightmares, setNightmares] = useState(false);
  const [apnea, setApnea] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    alert("Tracking salvato! (Firebase connection to be added)");
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Moon size={24} color="#333" />
            <Text style={styles.label}>Qualità del sonno</Text>
          </View>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={sleepQuality}
              onValueChange={(value) => setSleepQuality(value)}
              style={styles.picker}
            >
              {["Ottimo", "Buono", "Normale", "Scarso", "Insonnia"].map((option) => (
                <Picker.Item label={option} value={option} key={option} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Clock size={24} color="#333" />
            <Text style={styles.label}>Durata del sonno (ore)</Text>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={12}
            step={0.5}
            value={sleepDuration}
            onValueChange={(value) => setSleepDuration(value)}
            style={{ marginTop: 10 }}
          />
          <Text style={styles.sliderValue}>{sleepDuration} ore</Text>
        </View>

        {[{
          label: "Svegli frequenti",
          value: frequentWakeUps,
          setValue: setFrequentWakeUps,
        }, {
          label: "Incubi",
          value: nightmares,
          setValue: setNightmares,
        }, {
          label: "Apnea notturna",
          value: apnea,
          setValue: setApnea,
        }].map((item, index) => (
          <View style={styles.card} key={index}>
            <View style={styles.row}>
              <BellOff size={24} color="#333" />
              <Text style={styles.label}>{item.label}</Text>
              <Switch
                value={item.value}
                onValueChange={item.setValue}
                style={{ marginLeft: "auto" }}
              />
            </View>
          </View>
        ))}

        <View style={styles.card}>
          <View style={styles.row}>
            <FileText size={24} color="#333" />
            <Text style={styles.label}>Note aggiuntive</Text>
          </View>
          <TextInput
            placeholder="Scrivi qui..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.input}
          />
        </View>

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Salva</Text>
        </Pressable>
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  pickerWrapper: {
    marginTop: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
  },
  picker: {
    height: 40,
    padding: 0,
    margin: 0,
  },
  input: {
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    textAlignVertical: "top",
  },
  sliderValue: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 80,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
