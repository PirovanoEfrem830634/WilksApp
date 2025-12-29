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
import BottomNavigation from "../components/bottomnavigationnew";
import { auth, db } from "../firebaseconfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import PressableScaleWithRef from "../components/PressableScaleWithRef";
import { Modal, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Activity,
  AlertCircle,
  Eye,
  Mic,
  Droplet,
  Wind,
  TrendingUp,
  Smile,
  Moon,
  Check,
  X,
} from "lucide-react-native";
import { getPatientDocId } from "../utils/session";

export default function SleepTracking() {
  const insets = useSafeAreaInsets();

  // stessa logica della tua BottomNavigation
  const bottomPad = Math.max(insets.bottom, 10);
  const tabbarHeight = 56 + bottomPad;

  // padding sotto lo scroll per non finire sotto la tabbar
  const scrollBottomPadding = tabbarHeight + 28;

  const [quality, setQuality] = useState("");
  const [frequentWakeups, setFrequentWakeups] = useState(false);
  const [nightmares, setNightmares] = useState(false);
  const [apnea, setApnea] = useState(false);
  const [notes, setNotes] = useState("");
  const [showPicker, setShowPicker] = useState<null | string>(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [hours, setHours] = useState<string>("");

  useFocusEffect(
    React.useCallback(() => {
      console.log("🎯 SleepTracking montato o riattivato");
      setFrequentWakeups(false);
      setNightmares(false);
      setApnea(false);
      setQuality("");
      setHours("");
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

    const patientId = await getPatientDocId();
    if (!patientId) {
      Toast.show({
        type: "error",
        text1: "Sessione paziente non trovata",
        text2: "Rifai login.",
        position: "top",
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const ref = doc(db, "users", patientId, "sleep", today);

    const sleepData = {
      quality,
      hours: parseInt(hours) || 0,
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
        text1: "Dati salvati correttamente",
        position: "top",
      });
    } catch (err) {
      const error = err as Error;
      console.error("Errore salvataggio:", error);
      Toast.show({
        type: "error",
        text1: "Errore durante il salvataggio",
        text2: error.message,
        position: "top",
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      {/* HEADER FISSO */}
      <LinearGradient
        pointerEvents="none"
        colors={["#B2EAB2", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { height: 180 }]}
      />

      <View style={styles.mainHeader}>
        <View style={styles.iconWrapper}>
          <Ionicons name="bed" size={48} color={Colors.green} />
        </View>
        <Text style={FontStyles.variants.mainTitle}>Monitoraggio del sonno</Text>
        <Text style={FontStyles.variants.sectionTitle}>
          Tieni traccia della qualità del tuo sonno
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollView, { paddingBottom: scrollBottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <PressableScaleWithRef
          onPress={() => setShowPicker("quality")}
          style={[styles.card, quality ? styles.cardSelected : null]}
          weight="light"
          activeScale={0.96}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="moon" size={20} color={Colors.green} />
            <Text style={styles.cardLabel}>Qualità del sonno</Text>
            <View style={{ flex: 1 }} />
            <Text
              style={[
                styles.cardRightValue,
                quality ? { color: Colors.green } : null,
              ]}
            >
              {quality || "Seleziona"}
            </Text>
          </View>
        </PressableScaleWithRef>

        <PressableScaleWithRef
          onPress={() => setShowPicker("duration")}
          style={[styles.card, hours ? styles.cardSelected : null]}
          weight="light"
          activeScale={0.96}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={20} color={Colors.green} />
            <Text style={styles.cardLabel}>Durata del sonno</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.cardRightValue}>
              {hours ? `${hours} h` : "Seleziona"}
            </Text>
            <Ionicons
              name="chevron-forward-outline"
              size={16}
              color={Colors.light3}
              style={{ marginLeft: 6 }}
            />
          </View>
        </PressableScaleWithRef>

        {[
          {
            key: "frequentWakeups",
            label: "Risvegli frequenti",
            value: frequentWakeups,
            setter: setFrequentWakeups,
            icon: <Ionicons name="alert" size={20} color={Colors.green} />,
          },
          {
            key: "nightmares",
            label: "Incubi",
            value: nightmares,
            setter: setNightmares,
            icon: (
              <Ionicons name="cloudy-night" size={20} color={Colors.green} />
            ),
          },
          {
            key: "apnea",
            label: "Apnea notturna",
            value: apnea,
            setter: setApnea,
            icon: (
              <Ionicons name="trending-down" size={20} color={Colors.green} />
            ),
          },
        ].map((item) => (
          <PressableScaleWithRef
            key={item.key}
            onPress={() => item.setter(!item.value)}
            style={[styles.card, item.value && styles.cardSelected]}
            weight="light"
            activeScale={0.96}
          >
            <View style={styles.cardHeader}>
              {item.icon}
              <Text style={styles.cardLabel}>{item.label}</Text>
              <View style={{ flex: 1 }} />
              {item.value ? (
                <Check size={18} color={Colors.green} />
              ) : (
                <X size={18} color={Colors.light3} />
              )}
            </View>
          </PressableScaleWithRef>
        ))}

        <PressableScaleWithRef
          onPress={() => setNoteModalVisible(true)}
          style={[styles.card, notes ? styles.cardSelected : null]}
          activeScale={0.96}
          weight="light"
        >
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={20} color={Colors.green} />
            <Text style={styles.cardLabel}>Note</Text>
            <View style={{ flex: 1 }} />
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color={Colors.light3}
            />
          </View>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 14,
              color: notes ? "#1C1C1E" : Colors.light3,
              marginTop: 6,
            }}
          >
            {notes || "Aggiungi una nota"}
          </Text>
        </PressableScaleWithRef>

        <PressableScaleWithRef
          onPress={handleSave}
          weight="light"
          activeScale={0.96}
          style={styles.saveButton}
        >
          <Text style={styles.saveText}>Invia</Text>
        </PressableScaleWithRef>

        <Modal visible={noteModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text
                style={[
                  styles.label,
                  { textAlign: "center", marginBottom: 10 },
                ]}
              >
                Scrivi la tua nota
              </Text>
              <TextInput
                multiline
                placeholder="Scrivi qui..."
                style={styles.textArea}
                value={notes}
                onChangeText={setNotes}
              />
              <TouchableOpacity
                onPress={() => setNoteModalVisible(false)}
                style={styles.saveButton}
              >
                <Text style={styles.saveText}>Salva</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showPicker === "duration"} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text
                style={[
                  styles.label,
                  { textAlign: "center", marginBottom: 10 },
                ]}
              >
                Seleziona la durata del sonno
              </Text>

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={hours}
                  onValueChange={(value) => setHours(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleziona durata" value="" />
                  {[...Array(10)].map((_, i) => {
                    const val = (i + 3).toString(); // "3" ... "12"
                    return (
                      <Picker.Item
                        key={val}
                        label={`${val} ore`}
                        value={val}
                      />
                    );
                  })}
                </Picker>
              </View>

              <TouchableOpacity
                onPress={() => setShowPicker(null)}
                style={styles.saveButton}
              >
                <Text style={styles.saveText}>Salva</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      <Modal visible={showPicker === "quality"} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {["Buona", "Normale", "Scarsa", "Insonnia"].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionItem}
                onPress={() => {
                  setQuality(option);
                  setShowPicker(null);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelItem}
              onPress={() => {
                setQuality("");
                setShowPicker(null);
              }}
            >
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast />
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.light2,
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
    marginBottom: 20,
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
    textShadowColor: "#007AFF",
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
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },

  pillText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C1C1E",
  },

  pillTextSelected: {
    color: "#FFFFFF",
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
  scrollView: {
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  optionItem: {
    paddingVertical: 14,
    borderBottomColor: "#E5E5EA",
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
    textAlign: "center",
  },
  cancelItem: {
    marginTop: 10,
    paddingVertical: 14,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EB4B62",
    textAlign: "center",
  },
  cardRightValue: {
    fontSize: 14,
    color: Colors.light3,
    fontWeight: "500",
  },
  cardSelected: {
    borderColor: Colors.green,
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
    color: Colors.gray1,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  pickerWrapper: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
});
