import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
} from "react-native";
import {
  getDoc,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomNavigation from "../app/BottomNavigation";

const meals = ["breakfast", "lunch", "dinner", "snack"];

export default function DietTracker() {
  const [diet, setDiet] = useState<Record<string, string>>({});
  const [input, setInput] = useState<string>("");
  const [editingMeal, setEditingMeal] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const getDateKey = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const fetchDiet = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const todayKey = getDateKey();
    const ref = doc(db, "users", user.uid, "diet", todayKey);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setDiet(snap.data() as Record<string, string>);
    } else {
      setDiet({});
    }
  };

  useEffect(() => {
    fetchDiet();
  }, []);

  const showToast = () => {
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const todayKey = getDateKey();
    await setDoc(doc(db, "users", user.uid, "diet", todayKey), {
      ...diet,
      createdAt: Timestamp.now(),
    });

    showToast();
    setEditingMeal(null);
    setInput("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Diet Tracker</Text>

      <ScrollView contentContainerStyle={styles.mealContainer}>
        {meals.map((meal) => (
          <View key={meal} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={18}
                color="#007AFF"
              />
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
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              const updatedDiet = { ...diet, [editingMeal]: input };
              setDiet(updatedDiet);
              setEditingMeal(null);
              setInput("");
            }}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.globalSaveButton} onPress={handleSave}>
        <Text style={styles.globalSaveText}>Save All</Text>
      </TouchableOpacity>

      {/* Toast visivo animato */}
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: toastAnim,
            transform: [
              {
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [60, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.toastText}>✅ Diet saved successfully!</Text>
      </Animated.View>

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
  mealContainer: {
    padding: 20,
    paddingBottom: 100,
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
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  globalSaveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 80,
  },
  globalSaveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  toast: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  toastText: {
    color: "#fff",
    fontWeight: "600",
  },
});
