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
import BottomNavigation from "../app/bottomnavigationnew";
import { LinearGradient } from 'expo-linear-gradient'
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { Activity, AlertCircle, Eye, Mic, Droplet, Wind, TrendingUp, Smile, Moon, Info, X } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";


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
      <LinearGradient
        colors={["#FFD6BE", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
        />

        <View style={styles.mainHeader}>
            <View style={styles.iconWrapper}>
                <Ionicons name="nutrition" size={48} color={Colors.orange} />
            </View>
            <Text style={FontStyles.variants.mainTitle}>Diet Tracker</Text>
            <Text style={FontStyles.variants.sectionTitle}>Quickly log what you've eaten today</Text>
        </View>

    <ScrollView contentContainerStyle={styles.mealContainer}>
        {meals.map((meal) => {
        const icons: Record<string, JSX.Element> = {
            breakfast: <Ionicons name="cafe" size={20} color="#EC6330" />,
            lunch: <Ionicons name="restaurant" size={20} color="#EC6330" />,
            dinner: <Ionicons name="pizza" size={20} color="#EC6330" />,
            snack: <Ionicons name="fast-food" size={20} color="#EC6330" />,
        };

        const isEditing = editingMeal === meal;

        return (
            <View key={meal} style={[styles.card, isEditing && styles.cardSelected]}>
            <View style={styles.cardHeader}>
                {icons[meal]}
                <Text style={styles.cardLabel}>
                {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </Text>
            </View>

            {isEditing ? (
                <>
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Describe your meal..."
                    placeholderTextColor="#999"
                    style={styles.inputField}
                />
                <View style={styles.inlineActions}>
                    <TouchableOpacity
                    style={[styles.inlineButton, styles.cancelButton]}
                    onPress={() => {
                        setEditingMeal(null);
                        setInput("");
                    }}
                    >
                    <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    style={[styles.inlineButton, styles.saveButton]}
                    onPress={() => {
                        const updatedDiet = { ...diet, [meal]: input };
                        setDiet(updatedDiet);
                        setEditingMeal(null);
                        setInput("");
                    }}
                    >
                    <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                </View>
                </>
            ) : (
                <>
                <TouchableOpacity
                onPress={() => {
                    setEditingMeal(meal);
                    setInput(diet[meal] || "");
                }}
                >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.cardContent}>
                    {diet[meal] || "Not yet entered"}
                    </Text>
                    <Ionicons name="chevron-forward-outline" size={18} color = {Colors.light3} />
                </View>
                </TouchableOpacity>
                </>
            )}
            </View>
        );
      })}
    </ScrollView>


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
    backgroundColor: Colors.light1,
  },
  title: {
  fontSize: 24,
  fontWeight: "700",
  textAlign: "center",
  color: "#1C1C1E",
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: "center", 
    color: "#6b7280", 
    marginBottom: 20 
  },
  mealContainer: {
    padding: 20,
    paddingBottom: 100,
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
    paddingVertical: 4,
    borderRadius: 10,
    marginVertical: 5
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
  globalSaveButton: {
    backgroundColor: Colors.blue,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  globalSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
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
  emojiIcon: {
  fontSize: 18,
  marginRight: 6,
  },
  summaryBadge: {
  marginHorizontal: 20,
  marginBottom: 10,
  backgroundColor: "#D4EDDA",
  borderRadius: 12,
  paddingVertical: 10,
  alignItems: "center",
  },
  summaryText: {
    color: "#1E8449",
    fontWeight: "600",
  },
  inlineInput: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 10,
  padding: 10,
  marginTop: 6,
  marginBottom: 8,
  },
  inlineSave: {
  alignSelf: "flex-end",
  backgroundColor: "#007AFF",
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 8,
  },
  inlineSaveText: {
    color: "#fff",
    fontWeight: "600",
  },
  mealCard: {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 1,
  borderWidth: 0.5,
  borderColor: "#ECECEC",
  },
inlineActions: {
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 12,
},
inlineButton: {
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 100,
  minWidth: 90,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
  },
  cancelButton: {
    backgroundColor: Colors.light1,
  },
  cancelText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: Colors.blue,
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  gradientBackground: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 160,
  zIndex: -1,
  },
  mainHeader: {
  alignItems: "center",
  marginTop: 32,
  marginBottom: 20,
  paddingHorizontal: 20,
  },
  iconWrapper: {
  borderRadius: 60,
  padding: 5,
  marginBottom: 10,
  },
  card: {
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  padding: 16,
  marginBottom: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
  borderWidth: 1,
  borderColor: Colors.light2,
},
cardSelected: {
  borderColor: Colors.orange,
  borderWidth: 2,
},
cardHeader: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  marginBottom: 8,
},
cardLabel: {
  fontSize: 16,
  fontWeight: "600",
  color: "#1C1C1E",
},
cardContent: {
  fontSize: 15,
  color: "#444",
  lineHeight: 20,
},
inputField: {
  backgroundColor: Colors.light1,
  borderRadius: 12,
  padding: 12,
  fontSize: 15,
  color: "#000",
  marginTop: 8,
},
});
