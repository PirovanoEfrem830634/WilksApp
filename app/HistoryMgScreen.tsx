import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";

import BottomNavigation from "../components/bottomnavigationnew";
import PressableScaleWithRef from "../components/PressableScaleWithRef";

import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";

import { auth, db } from "../firebaseconfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { Check, X } from "lucide-react-native";

export default function HistoryMgScreen() {
  const [onsetAge, setOnsetAge] = useState("");
  const [onsetType, setOnsetType] = useState("");
  const [antibodies, setAntibodies] = useState<string[]>([]);
  const [thymectomy, setThymectomy] = useState<"" | "yes" | "no">("");
  const [thymusHistology, setThymusHistology] = useState("");
  const [neurophysiology, setNeurophysiology] = useState<string[]>([]);
  const [hospitalizationsYears, setHospitalizationsYears] = useState("");
  const [comorbidities, setComorbidities] = useState("");
  const [notes, setNotes] = useState("");

  const [activeModal, setActiveModal] = useState<
    null | "onsetAge" | "onsetType" | "thymusHistology" | "neurophysiology"
  >(null);

  useFocusEffect(
    React.useCallback(() => {
      // opzionale: reset ad ogni refocus
      return () => {};
    }, [])
  );

  const toggleInArray = (value: string, list: string[], setter: (v: string[]) => void) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  };

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

  const ref = doc(db, "users", user.uid, "history", "mg");

  // 1) Mappo onsetCategory come fa il web (EOMG / LOMG / VLOMG / Childhood)
  let onsetCategory = "";
  if (onsetAge.startsWith("<18")) {
    onsetCategory = "Childhood";
  } else if (onsetAge.includes("18–49")) {
    onsetCategory = "EOMG";
  } else if (onsetAge.includes("50–64")) {
    onsetCategory = "LOMG";
  } else if (onsetAge.includes("65+")) {
    onsetCategory = "VLOMG";
  }

  // 2) Converto anni di ospedalizzazione in ARRAY (come nel web)
  const hospitalizationYearsArray =
    hospitalizationsYears
      .split(",")
      .map((y) => y.trim())
      .filter((y) => y.length > 0);

  // 3) Anticorpi -> stessi valori del medico
  const mappedAntibodies: string[] = [];
  if (antibodies.includes("AChR")) mappedAntibodies.push("anti-AChR");
  if (antibodies.includes("MuSK")) mappedAntibodies.push("anti-MuSK");
  if (antibodies.includes("LRP4")) mappedAntibodies.push("anti-LRP4");
  if (antibodies.includes("Double seronegative")) mappedAntibodies.push("double-seronegative");
  if (antibodies.includes("Not sure")) mappedAntibodies.push("unknown");

  // 4) Neurofisiologia -> stesso schema del web:
  //    - neuroTests: ["RNS", "SF-EMG"]
  //    - neuroSFEmgResult / neuroSrEmgResult: "alterata" | "nella norma" | ""
  let neuroTests: string[] = [];
  let neuroSFEmgResult = "";
  let neuroSrEmgResult = "";

  neurophysiology.forEach((opt) => {
    switch (opt) {
      case "RNS altered":
        if (!neuroTests.includes("RNS")) neuroTests.push("RNS");
        neuroSrEmgResult = "alterata";
        break;
      case "RNS normal":
        if (!neuroTests.includes("RNS")) neuroTests.push("RNS");
        neuroSrEmgResult = "nella norma";
        break;
      case "SF-EMG altered":
        if (!neuroTests.includes("SF-EMG")) neuroTests.push("SF-EMG");
        neuroSFEmgResult = "alterata";
        break;
      case "SF-EMG normal":
        if (!neuroTests.includes("SF-EMG")) neuroTests.push("SF-EMG");
        neuroSFEmgResult = "nella norma";
        break;
      case "Not done / I don't remember":
        // lascio tutto vuoto (nessun test / nessun risultato)
        neuroTests = [];
        neuroSFEmgResult = "";
        neuroSrEmgResult = "";
        break;
    }
  });

  // 5) Payload allineato ai CAMPI DEL MEDICO
  //    NB: non tocco ageAtOnset qui, così se il medico ha messo 21
  //    non lo sovrascriviamo con una stringa. Lo userà solo il medico.
  const payload: any = {
    onsetType,                             // stesso nome del web
    onsetCategory: onsetCategory || null,  // stesso nome
    antibodies: mappedAntibodies,          // stesso campo
    thymectomy,                            // stesso
    thymusHistology,                       // stesso
    neuroTests,                            // array come nel web
    neuroSFEmgResult,
    neuroSrEmgResult,
    hospitalizationYears: hospitalizationYearsArray,
    comorbidities,
    notes,
    lastUpdatedAt: Timestamp.now(),
    source: "patient_app",
  };

  try {
    await setDoc(ref, payload, { merge: true });
    Toast.show({
      type: "success",
      text1: "Storico MG salvato",
      position: "top",
    });
  } catch (err) {
    const error = err as Error;
    console.error("Errore salvataggio storico MG:", error);
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
      {/* GRADIENT HEADER */}
      <LinearGradient
        colors={[Colors.turquoise, Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
      />

      <View style={styles.mainHeader}>
        <View style={styles.iconWrapper}>
            <Ionicons name="pulse" size={48} color={Colors.turquoise} />
        </View>
        <Text style={FontStyles.variants.mainTitle}>Myasthenia History</Text>
        <Text style={FontStyles.variants.sectionTitle}>
          Tell us about your diagnosis journey
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Onset age */}
        <PressableScaleWithRef
          onPress={() => setActiveModal("onsetAge")}
          style={[styles.card, onsetAge ? styles.cardSelected : null]}
          weight="light"
          activeScale={0.96}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={20} color={Colors.turquoise} />
            <Text style={styles.cardLabel}>Age at onset</Text>
            <View style={{ flex: 1 }} />
            <Text
              style={[
                styles.cardRightValue,
                onsetAge ? { color: Colors.turquoise } : null,
              ]}
            >
              {onsetAge || "Select"}
            </Text>
            <Ionicons
              name="chevron-forward-outline"
              size={16}
              color={Colors.light3}
              style={{ marginLeft: 6 }}
            />
          </View>
        </PressableScaleWithRef>

        {/* Onset type */}
        <PressableScaleWithRef
          onPress={() => setActiveModal("onsetType")}
          style={[styles.card, onsetType ? styles.cardSelected : null]}
          weight="light"
          activeScale={0.96}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="eye-outline" size={20} color={Colors.turquoise} />
            <Text style={styles.cardLabel}>Type of onset</Text>
            <View style={{ flex: 1 }} />
            <Text
              style={[
                styles.cardRightValue,
                onsetType ? { color: Colors.turquoise } : null,
              ]}
            >
              {onsetType || "Select"}
            </Text>
            <Ionicons
              name="chevron-forward-outline"
              size={16}
              color={Colors.light3}
              style={{ marginLeft: 6 }}
            />
          </View>
        </PressableScaleWithRef>

        {/* Antibodies */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flask-outline" size={20} color={Colors.turquoise} />
            <Text style={styles.cardLabel}>Antibodies (if known)</Text>
          </View>
          <View style={styles.pillContainer}>
            {["AChR", "MuSK", "LRP4", "Double seronegative", "Not sure"].map(
              (ab) => {
                const isSelected = antibodies.includes(ab);
                return (
                  <PressableScaleWithRef
                    key={ab}
                    onPress={() => toggleInArray(ab, antibodies, setAntibodies)}
                    style={[
                      styles.pill,
                      isSelected && styles.pillSelected,
                    ]}
                    weight="light"
                    activeScale={0.96}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        isSelected && styles.pillTextSelected,
                      ]}
                    >
                      {ab}
                    </Text>
                  </PressableScaleWithRef>
                );
              }
            )}
          </View>
        </View>

        {/* Thymectomy yes/no */}
        <PressableScaleWithRef
          onPress={() =>
            setThymectomy((prev) =>
              prev === "yes" ? "no" : prev === "no" ? "" : "yes"
            )
          }
          style={[
            styles.card,
            thymectomy && styles.cardSelected,
          ]}
          weight="light"
          activeScale={0.96}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="body-outline" size={20} color={Colors.turquoise} />
            <Text style={styles.cardLabel}>Thymectomy</Text>
            <View style={{ flex: 1 }} />
            {thymectomy === "yes" && <Check size={18} color={Colors.turquoise} />}
            {thymectomy === "no" && <X size={18} color={Colors.light3} />}
            {!thymectomy && (
              <Text style={styles.cardRightValue}>Yes / No</Text>
            )}
          </View>
          {thymectomy === "yes" && (
            <Text style={styles.helperText}>
              If you know it, you can specify the histology below.
            </Text>
          )}
        </PressableScaleWithRef>

        {/* Thymus histology (only if thymectomy yes) */}
        {thymectomy === "yes" && (
          <PressableScaleWithRef
            onPress={() => setActiveModal("thymusHistology")}
            style={[styles.card, thymusHistology ? styles.cardSelected : null]}
            weight="light"
            activeScale={0.96}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="file-tray-outline" size={20} color={Colors.turquoise} />
              <Text style={styles.cardLabel}>Thymus histology</Text>
              <View style={{ flex: 1 }} />
              <Text
                style={[
                  styles.cardRightValue,
                  thymusHistology ? { color: Colors.turquoise } : null,
                ]}
              >
                {thymusHistology || "Select"}
              </Text>
              <Ionicons
                name="chevron-forward-outline"
                size={16}
                color={Colors.light3}
                style={{ marginLeft: 6 }}
              />
            </View>
          </PressableScaleWithRef>
        )}

        {/* Neurophysiology */}
        <PressableScaleWithRef
          onPress={() => setActiveModal("neurophysiology")}
          style={[
            styles.card,
            neurophysiology.length > 0 && styles.cardSelected,
          ]}
          weight="light"
          activeScale={0.96}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="pulse-outline" size={20} color={Colors.turquoise} />
            <Text style={styles.cardLabel}>Neurophysiology tests</Text>
          </View>
          <Text style={styles.helperText}>
            Select the tests you had and, if you remember, the result.
          </Text>
          {neurophysiology.length > 0 && (
            <Text style={styles.selectedSummary} numberOfLines={1}>
              {neurophysiology.join(" · ")}
            </Text>
          )}
        </PressableScaleWithRef>

        {/* Hospitalizations years */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medkit" size={20} color={Colors.turquoise} />
            <Text style={styles.cardLabel}>Years with hospitalizations</Text>
          </View>
          <Text style={styles.helperText}>
            If you remember approximately how many years you have been hospitalized
            for MG-related problems, you can indicate it here.
          </Text>
          <TextInput
            value={hospitalizationsYears}
            onChangeText={setHospitalizationsYears}
            placeholder="e.g. 0, 1, 2..."
            keyboardType="numeric"
            style={styles.textInput}
          />
        </View>

        {/* Comorbidities */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list-outline" size={20} color={Colors.turquoise} />
            <Text style={styles.cardLabel}>Other health conditions</Text>
          </View>
          <TextInput
            value={comorbidities}
            onChangeText={setComorbidities}
            placeholder="e.g. thyroid disease, diabetes..."
            multiline
            style={styles.textArea}
          />
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={20} color={Colors.turquoise} />
            <Text style={styles.cardLabel}>Notes for your clinician</Text>
          </View>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything else you want your doctor to know about your story."
            multiline
            style={styles.textArea}
          />
        </View>

        {/* SAVE BUTTON */}
        <PressableScaleWithRef
          onPress={handleSave}
          weight="light"
          activeScale={0.96}
          style={styles.saveButton}
        >
          <Text style={styles.saveText}>Submit history</Text>
        </PressableScaleWithRef>
      </ScrollView>

      {/* MODAL: Onset age */}
      <Modal
        visible={activeModal === "onsetAge"}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {[
              "<18 years (childhood)",
              "18–49 years (EOMG)",
              "50–64 years",
              "65+ years (late-onset)",
            ].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.optionItem}
                onPress={() => {
                  setOnsetAge(opt);
                  setActiveModal(null);
                }}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelItem}
              onPress={() => setActiveModal(null)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Onset type */}
      <Modal
        visible={activeModal === "onsetType"}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
            {["oculare", "generalizzata", "oculare poi generalizzata"].map(
                (opt) => (
                <TouchableOpacity
                    key={opt}
                    style={styles.optionItem}
                    onPress={() => {
                    setOnsetType(opt);   // viene salvato tale e quale nel campo onsetType
                    setActiveModal(null);
                    }}
                >
                    <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
                )
            )}
            <TouchableOpacity
                style={styles.cancelItem}
                onPress={() => setActiveModal(null)}
            >
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>

      {/* MODAL: Thymus histology */}
      <Modal
        visible={activeModal === "thymusHistology"}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {["Thymoma", "Hyperplasia", "Atrophy", "Not sure"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.optionItem}
                onPress={() => {
                  setThymusHistology(opt);
                  setActiveModal(null);
                }}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelItem}
              onPress={() => setActiveModal(null)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Neurophysiology */}
      <Modal
        visible={activeModal === "neurophysiology"}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {[
              "RNS altered",
              "RNS normal",
              "SF-EMG altered",
              "SF-EMG normal",
              "Not done / I don't remember",
            ].map((opt) => {
              const selected = neurophysiology.includes(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.optionItem,
                    selected && { backgroundColor: "#F2F2F7" },
                  ]}
                  onPress={() =>
                    toggleInArray(opt, neurophysiology, setNeurophysiology)
                  }
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.cancelItem}
              onPress={() => setActiveModal(null)}
            >
              <Text style={styles.cancelText}>Done</Text>
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
  scrollView: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  cardSelected: {
    borderColor: Colors.turquoise,
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
    color: Colors.gray1,
  },
  cardRightValue: {
    fontSize: 14,
    color: Colors.light3,
    fontWeight: "500",
  },
  helperText: {
    fontSize: 13,
    color: Colors.light3,
    marginTop: 4,
  },
  selectedSummary: {
    marginTop: 8,
    fontSize: 13,
    color: "#1C1C1E",
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
    backgroundColor: Colors.turquoise,
    borderColor: Colors.turquoise,
  },
  pillText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  pillTextSelected: {
    color: "#FFFFFF",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
    marginTop: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    minHeight: 80,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: Colors.turquoise,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 40,
  },
  saveText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
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
});
