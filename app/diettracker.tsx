import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Platform } from "react-native";
import { collection, getDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomNavigation from "../app/BottomNavigation";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const meals = ["breakfast", "lunch", "dinner", "snack"];

export default function DietTracker() {
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date();
    return days[today.getDay() - 1] || "Mon";
  });
  const [diet, setDiet] = useState<Record<string, string>>({});
  const [input, setInput] = useState<string>("");
  const [editingMeal, setEditingMeal] = useState<string | null>(null);

  const fetchDiet = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, "users", user.uid, "diet", selectedDay);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setDiet(snap.data() as Record<string, string>);
    } else {
      setDiet({});
    }
  };

  useEffect(() => {
    fetchDiet();
  }, [selectedDay]);

  const handleSave = async () => {
    if (!editingMeal) return;
    const user = auth.currentUser;
    if (!user) return;

    const updatedDiet = { ...diet, [editingMeal]: input };
    setDiet(updatedDiet);
    await setDoc(doc(db, "users", user.uid, "diet", selectedDay), updatedDiet);
    setEditingMeal(null);
    setInput("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Diet Tracker</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayButton, selectedDay === day && styles.selectedDay]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayText, selectedDay === day && styles.selectedDayText]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.mealContainer}>
        {meals.map((meal) => (
          <View key={meal} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={18} color="#007AFF" />
              <Text style={styles.mealTitle}>{meal.toUpperCase()}</Text>
            </View>
            <Text style={styles.mealText}>{diet[meal] || "Not set"}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setEditingMeal(meal);
                setInput(diet[meal] || "");
              }}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {editingMeal && (
        <View style={styles.editBox}>
          <Text style={styles.editTitle}>Edit {editingMeal}</Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={styles.input}
            placeholder="Enter meal content"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 10,
    color: "#1C1C1E",
  },
  daySelector: {
    flexDirection: "row",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 4,
  },
  selectedDay: {
    backgroundColor: "#007AFF",
  },
  dayText: {
    fontWeight: "500",
    color: "#333",
  },
  selectedDayText: {
    color: "#fff",
  },
  mealContainer: {
    padding: 20,
  },
  mealCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  mealText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 6,
  },
  editButton: {
    alignSelf: "flex-start",
    backgroundColor: "#007AFF20",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  editBox: {
    backgroundColor: "#fff",
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    width: "90%",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1C1C1E",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
