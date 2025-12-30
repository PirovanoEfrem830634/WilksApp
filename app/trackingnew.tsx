import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Animated,
  StyleSheet as RNStyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import BottomNavigation from "../components/bottomnavigationnew";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import {
  Activity,
  AlertCircle,
  Eye,
  Mic,
  Droplet,
  Wind,
  TrendingUp,
  Smile,
  Check,
  X,
} from "lucide-react-native";
import FontStyles from "../Styles/fontstyles";
import Colors from "../Styles/color";
import PressableScaleWithRef from "../components/PressableScaleWithRef";
import { LinearGradient } from "expo-linear-gradient";
import { Modal } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getPatientDocId } from "../utils/session";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type FormDataType = {
  debolezzaMuscolare: boolean;
  andamentoSintomi: string;
  affaticamentoMuscolare: number;
  disfagia: boolean;
  disartria: boolean;
  ptosi: boolean;
  diplopia: boolean;
  difficoltaRespiratorie: boolean;
  ansia: boolean;
  umore: string;
};

export default function TrackingNew() {
  const insets = useSafeAreaInsets();

  // stessa logica della BottomNavigation (come SleepTracking)
  const bottomPad = Math.max(insets.bottom, 10);
  const tabbarHeight = 56 + bottomPad;
  const scrollBottomPadding = tabbarHeight + 28;

  const [formData, setFormData] = useState<FormDataType>({
    debolezzaMuscolare: false,
    andamentoSintomi: "",
    affaticamentoMuscolare: 0,
    disfagia: false,
    disartria: false,
    ptosi: false,
    diplopia: false,
    difficoltaRespiratorie: false,
    ansia: false,
    umore: "",
  });

  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView | null>(null);
  const router = useRouter();

  const [showPicker, setShowPicker] = useState<null | string>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
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
    ]).start(() => setToastMessage(null));
  };

  useFocusEffect(
    useCallback(() => {
      setFormData({
        debolezzaMuscolare: false,
        andamentoSintomi: "",
        affaticamentoMuscolare: 0,
        disfagia: false,
        disartria: false,
        ptosi: false,
        diplopia: false,
        difficoltaRespiratorie: false,
        ansia: false,
        umore: "",
      });
    }, [])
  );

  const handleToggle = (key: keyof FormDataType) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = <K extends keyof FormDataType>(
    field: K,
    value: FormDataType[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveSymptoms = async () => {
    const user = auth.currentUser;
    if (!user) {
      showToast("❌ Utente non autenticato");
      return;
    }

    const patientId = await getPatientDocId();
    if (!patientId) {
      showToast("❌ Sessione paziente non trovata (rifai login)");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const symptomsDocRef = doc(db, "users", patientId, "symptoms", today);

    const dataToSave = {
      ...formData,
      dataInserimento: Timestamp.now(),
    };

    try {
      await setDoc(symptomsDocRef, dataToSave, { merge: true });
      showToast("✅ Sintomi salvati correttamente!");
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } catch (error: any) {
      console.error("❌ Error saving symptoms:", error);
      showToast("❌ Errore: " + (error.message || "Errore durante il salvataggio."));
    }
  };

  // ✅ niente JSX.Element: React.ReactNode è più robusto
  const symptomFields: {
    key: keyof FormDataType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { key: "debolezzaMuscolare", label: "Debolezza muscolare", icon: <Activity size={18} color={Colors.blue} /> },
    { key: "disfagia", label: "Difficoltà di deglutizione", icon: <Droplet size={18} color={Colors.blue} /> },
    { key: "disartria", label: "Difficoltà nel parlare", icon: <Mic size={18} color={Colors.blue} /> },
    { key: "ptosi", label: "Ptosi", icon: <Eye size={18} color={Colors.blue} /> },
    { key: "diplopia", label: "Visione doppia", icon: <Eye size={18} color={Colors.blue} /> },
    { key: "difficoltaRespiratorie", label: "Difficoltà respiratorie", icon: <Wind size={18} color={Colors.blue} /> },
    { key: "ansia", label: "Ansia", icon: <AlertCircle size={18} color={Colors.blue} /> },
  ];

  return (
    <View style={styles.container}>
      {/* ✅ gradient come SleepTracking, no zIndex */}
      <LinearGradient
        pointerEvents="none"
        colors={["#D1E9FF", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { height: 180 }]}
      />

      <View style={styles.mainHeader}>
        <View style={styles.iconWrapper}>
          <Ionicons name="analytics" size={48} color={Colors.blue} />
        </View>
        <Text style={FontStyles.variants.mainTitle}>Monitoraggio dei sintomi</Text>
        <Text style={FontStyles.variants.sectionTitle}>
          Tieni traccia dei tuoi sintomi
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollView,
          { paddingBottom: scrollBottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Modal Umore */}
        <Modal visible={showPicker === "umore"} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {["Felice", "Neutro", "Triste", "Ansioso"].map((option) => (
                <PressableScaleWithRef
                  key={option}
                  style={styles.optionItem}
                  onPress={() => {
                    handleInputChange("umore", option);
                    setShowPicker(null);
                  }}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </PressableScaleWithRef>
              ))}
              <PressableScaleWithRef
                style={styles.cancelItem}
                onPress={() => {
                  handleInputChange("umore", "");
                  setShowPicker(null);
                }}
              >
                <Text style={styles.cancelText}>Annulla</Text>
              </PressableScaleWithRef>
            </View>
          </View>
        </Modal>

        {/* Modal andamento sintomi */}
        <Modal
          visible={showPicker === "andamentoSintomi"}
          animationType="slide"
          transparent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {["Stabile", "Peggiorato", "Migliorato"].map((option) => (
                <PressableScaleWithRef
                  key={option}
                  style={styles.optionItem}
                  onPress={() => {
                    handleInputChange("andamentoSintomi", option);
                    setShowPicker(null);
                  }}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </PressableScaleWithRef>
              ))}
              <PressableScaleWithRef
                style={styles.cancelItem}
                onPress={() => {
                  handleInputChange("andamentoSintomi", "");
                  setShowPicker(null);
                }}
              >
                <Text style={styles.cancelText}>Annulla</Text>
              </PressableScaleWithRef>
            </View>
          </View>
        </Modal>

        {/* Cards sintomi booleani */}
        {symptomFields.map((item) => (
          <PressableScaleWithRef
            key={item.key}
            onPress={() => handleToggle(item.key)}
            style={[styles.card, !!formData[item.key] && styles.cardSelected]}
            weight="light"
            activeScale={0.96}
          >
            <View style={styles.cardHeader}>
              {item.icon}
              <Text style={styles.cardLabel}>{item.label}</Text>
              <View style={{ flex: 1 }} />
              {formData[item.key] ? (
                <Check size={18} color={Colors.blue} />
              ) : (
                <X size={18} color={Colors.light3} />
              )}
            </View>
          </PressableScaleWithRef>
        ))}

        {/* Umore */}
        <PressableScaleWithRef
          onPress={() => setShowPicker("umore")}
          style={[styles.card, formData.umore ? styles.cardSelected : null]}
          weight="light"
          activeScale={0.96}
        >
          <View style={styles.cardHeader}>
            <Smile size={18} color={Colors.blue} />
            <Text style={styles.cardLabel}>Umore</Text>
            <View style={{ flex: 1 }} />
            <Text
              style={[
                styles.cardRightValue,
                formData.umore ? { color: Colors.blue } : null,
              ]}
            >
              {formData.umore || "Seleziona"}
            </Text>
          </View>
        </PressableScaleWithRef>

        {/* Andamento sintomi */}
        <PressableScaleWithRef
          onPress={() => setShowPicker("andamentoSintomi")}
          style={[styles.card, formData.andamentoSintomi ? styles.cardSelected : null]}
          weight="light"
          activeScale={0.96}
        >
          <View style={styles.cardHeader}>
            <TrendingUp size={18} color={Colors.blue} />
            <Text style={styles.cardLabel}>Andamento dei sintomi</Text>
            <View style={{ flex: 1 }} />
            <Text
              style={[
                styles.cardRightValue,
                formData.andamentoSintomi ? { color: Colors.blue } : null,
              ]}
            >
              {formData.andamentoSintomi || "Seleziona"}
            </Text>
          </View>
        </PressableScaleWithRef>

        {/* Affaticamento muscolare */}
        <PressableScaleWithRef
          onPress={() => setShowPicker("fatigue")}
          style={[styles.card, formData.affaticamentoMuscolare > 0 && styles.cardSelected]}
          weight="light"
          activeScale={0.96}
        >
          <View style={styles.cardHeader}>
            <Activity size={18} color={Colors.blue} />
            <Text style={styles.cardLabel}>Affaticamento muscolare</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.cardRightValue}>
              {`${formData.affaticamentoMuscolare} / 10`}
            </Text>
          </View>
        </PressableScaleWithRef>

        {/* Modal Fatigue */}
        <Modal visible={showPicker === "fatigue"} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={[styles.label, { textAlign: "center", marginBottom: 10 }]}>
                Seleziona l’affaticamento muscolare
              </Text>

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.affaticamentoMuscolare}
                  onValueChange={(value) =>
                    handleInputChange("affaticamentoMuscolare", value)
                  }
                  style={styles.picker}
                >
                  {[...Array(11).keys()].map((val) => (
                    <Picker.Item key={val} label={`${val}`} value={val} />
                  ))}
                </Picker>
              </View>

              <PressableScaleWithRef
                onPress={() => setShowPicker(null)}
                style={styles.saveButton}
                weight="light"
                activeScale={0.96}
              >
                <Text style={styles.saveText}>Salva</Text>
              </PressableScaleWithRef>
            </View>
          </View>
        </Modal>

        {/* Invia */}
        <PressableScaleWithRef
          onPress={saveSymptoms}
          weight="light"
          activeScale={0.96}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>Invia</Text>
        </PressableScaleWithRef>
      </ScrollView>

      {/* ✅ Toast senza zIndex (usa elevation su Android) */}
      {toastMessage && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light1,
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

  // ✅ niente paddingBottom fisso
  scrollView: {
    padding: 20,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.light2,
  },
  cardSelected: {
    borderColor: Colors.blue,
    borderWidth: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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

  submitButton: {
    backgroundColor: Colors.blue,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  optionItem: {
    paddingVertical: 14,
    borderBottomColor: Colors.light2,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.gray1,
    textAlign: "center",
  },
  cancelItem: {
    marginTop: 10,
    paddingVertical: 14,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.red,
    textAlign: "center",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray3,
  },
  pickerWrapper: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  picker: {
    backgroundColor: "#F4F4F6",
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: Colors.blue,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  toast: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: Colors.blue,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6, // Android stacking senza zIndex
  },
  toastText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
