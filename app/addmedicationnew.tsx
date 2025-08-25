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
import BottomNavigation from "../app/bottomnavigationnew";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { PressableScale } from "react-native-pressable-scale";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
    console.log("[DEBUG] Submitting medication…");
    const user = auth.currentUser;
    console.log("[DEBUG] Current user uid/email:", user?.uid, user?.email);

    console.log("[DEBUG] Form state:", {
      name,
      dose,
      days,
      times,
      notes,
      notifications,
      platform: Platform.OS,
    });

    if (!user) {
      console.warn("[WARN] No authenticated user");
      Alert.alert("Error", "User not logged in");
      return;
    }

    if (!name || !dose || days.length === 0 || times.length === 0) {
      console.warn("[WARN] Validation failed", { name, dose, days, times });
      Alert.alert("Missing Information", "Please fill out all required fields.");
      return;
    }

    try {
      const path = `users/${user.uid}/medications`;
      const colRef = collection(db, "users", user.uid, "medications");
      const payload = {
        name: name.trim(),
        dose: dose.trim(),
        days: [...days].sort(),
        times: times.map((t) => t.trim()),
        notes: notes.trim(),
        notifications: !!notifications,
        createdAt: Timestamp.now(),
        createdBy: user.uid,
      };

      console.log("[DEBUG] Writing to:", path);
      console.log("[DEBUG] Payload:", payload);

      const res = await addDoc(colRef, payload);
      console.log("[DEBUG] Saved doc id:", res.id);

      Alert.alert("Success", "Medication saved successfully");
      router.back();
    } catch (error: any) {
      console.error("[ERROR] addDoc failed:", {
        code: error?.code,
        name: error?.name,
        message: error?.message,
        stack: error?.stack?.split("\n")[0],
      });
      Alert.alert(
        "Error",
        error?.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#D2E1FF", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
      />
      <View style={styles.mainHeader}>
        <Ionicons name="add-circle" size={48} color={Colors.turquoise} />
        <Text style={FontStyles.variants.mainTitle}>Add Medication</Text>
        <Text style={FontStyles.variants.sectionTitle}>
          Plan your next intake
        </Text>
      </View>
      <ScrollView style={styles.scrollView}>
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
            <Ionicons name="time" size={20} color={Colors.turquoise} />
            <Text style={FontStyles.variants.body}>{time}</Text>
            <TouchableOpacity
              onPress={() =>
                setTimes((prev) => prev.filter((_, i) => i !== index))
              }
            >
              <Ionicons name="close" size={20} color={Colors.light3} />
            </TouchableOpacity>
          </View>
        ))}

        {Platform.OS === "web" ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="notifications" size={24} color={Colors.turquoise} />
            <Text style={FontStyles.variants.body}>Enable notifications</Text>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>

        <PressableScale
          onPress={saveMedication} // <<< FIX QUI
          weight="light"
          activeScale={0.96}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>+ Add Medication</Text>
        </PressableScale>
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1C1C1E",
    textAlign: "center",
  },
  input: {
    backgroundColor: Colors.white,
    borderColor: Colors.light3,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.gray1,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
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
    justifyContent: "space-between",
    backgroundColor: Colors.white,
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
    marginBottom: 30,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconWrapper: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
