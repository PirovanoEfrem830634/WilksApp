import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Clock3, Bell, CalendarPlus } from "lucide-react-native";
import { auth, db } from "../firebaseconfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "expo-router";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AddMedication() {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [notes, setNotes] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const router = useRouter();

  const [manualTime, setManualTime] = useState("");

  const toggleDay = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addTime = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      const time = selectedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setTimes([...times, time]);
    }
  };

  const saveMedication = async () => {
    console.log("[DEBUG] Submitting medication...");
    const user = auth.currentUser;
    console.log("[DEBUG] Current user:", user);

    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    if (!name || !dose || days.length === 0 || times.length === 0) {
      console.log("[DEBUG] Validation failed:", { name, dose, days, times });
      Alert.alert("Missing Information", "Please fill out all required fields.");
      return;
    }

    try {
      const docRef = collection(db, "users", user.uid, "medications");
      const payload = {
        name,
        dose,
        days,
        times,
        notes,
        notifications,
        createdAt: Timestamp.now(),
      };
      console.log("[DEBUG] Payload to save:", payload);

      await addDoc(docRef, payload);

      Alert.alert("Success", "Medication saved successfully");
      router.back();
    } catch (error) {
      console.error("[ERROR] Error saving medication:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Add Medication</Text>

        <TextInput
          placeholder="Medication name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Dose (e.g. 20mg)"
          value={dose}
          onChangeText={setDose}
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>Days of the week</Text>
        <View style={styles.giorniContainer}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => toggleDay(day)}
              style={[
                styles.giornoButton,
                days.includes(day) && styles.giornoButtonSelected,
              ]}
            >
              <Text
                style={
                  days.includes(day)
                    ? styles.giornoTextSelected
                    : styles.giornoText
                }
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Time(s) of intake</Text>
        {times.map((time, index) => (
          <View key={index} style={styles.orarioCard}>
            <Clock3 size={20} color="#333" />
            <Text style={styles.orarioText}>{time}</Text>
          </View>
        ))}

        {Platform.OS === "web" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <TextInput
              placeholder="Enter time (e.g. 08:00)"
              style={[styles.input, { flex: 1 }]}
              value={manualTime}
              onChangeText={setManualTime}
            />
            <TouchableOpacity
              onPress={() => {
                const trimmed = manualTime.trim();
                if (trimmed && !times.includes(trimmed)) {
                  setTimes((prev) => [...prev, trimmed]);
                  setManualTime("");
                }
              }}
              style={styles.addTimeButton}
            >
              <Text style={styles.addTimeText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.addTimeButton}
              onPress={() => setShowPicker(true)}
            >
              <CalendarPlus size={20} color="#007AFF" />
              <Text style={styles.addTimeText}>Add Time</Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={addTime}
              />
            )}
          </>
        )}

        <TextInput
          placeholder="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          style={styles.input}
          multiline
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Enable notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={saveMedication}>
          <Text style={styles.submitButtonText}>Save Medication</Text>
        </TouchableOpacity>
      </ScrollView>
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1C1C1E",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FAFAFA",
    borderColor: "#D1D1D6",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 8,
    color: "#1C1C1E",
  },
  giorniContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  giornoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D1D6",
    backgroundColor: "#FFFFFF",
  },
  giornoButtonSelected: {
    backgroundColor: "#007AFF",
  },
  giornoText: {
    color: "#1C1C1E",
  },
  giornoTextSelected: {
    color: "#FFFFFF",
  },
  orarioCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  orarioText: {
    fontSize: 16,
    color: "#1C1C1E",
  },
  addTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#E5F0FF",
    borderRadius: 12,
    marginBottom: 16,
  },
  addTimeText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
