import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Animated,
} from "react-native";
import Slider from "@react-native-community/slider";
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
import { useCallback } from "react";

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

  const router = useRouter();

  const [showPicker, setShowPicker] = useState<null | string>(null);
  const [showFatiguePicker, setShowFatiguePicker] = useState(false);

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
    console.log("🔍 USER:", user?.uid);

    if (!user) {
      showToast("❌ User not logged in");
      return;
    }

    const uid = user.uid;
    const today = new Date().toISOString().split("T")[0];
    const symptomsDocRef = doc(db, "users", uid, "symptoms", today);

    const dataToSave = {
      ...formData,
      dataInserimento: Timestamp.now(),
    };

    console.log("📝 Tentativo salvataggio dati:", dataToSave);
    console.log(
      "📄 Path Firestore:",
      `users/${uid}/symptoms/${today}`
    );

    try {
      await setDoc(symptomsDocRef, dataToSave);
      showToast("✅ Symptoms saved successfully!");

      // 🔄 Autoscroll verso l'alto dopo il salvataggio
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    } catch (error: any) {
      console.error("❌ Error saving symptoms:", error);
      showToast("❌ Error: " + (error.message || "Error saving."));
    }
  };

  const symptomFields: {
    key: keyof FormDataType;
    label: string;
    icon: JSX.Element;
  }[] = [
    {
      key: "debolezzaMuscolare",
      label: "Muscle Weakness",
      icon: <Activity size={18} color={Colors.blue} />,
    },
    {
      key: "disfagia",
      label: "Swallowing Difficulty",
      icon: <Droplet size={18} color={Colors.blue} />,
    },
    {
      key: "disartria",
      label: "Speech Difficulty",
      icon: <Mic size={18} color={Colors.blue} />,
    },
    {
      key: "ptosi",
      label: "Ptosis",
      icon: <Eye size={18} color={Colors.blue} />,
    },
    {
      key: "diplopia",
      label: "Double Vision",
      icon: <Eye size={18} color={Colors.blue} />,
    },
    {
      key: "difficoltaRespiratorie",
      label: "Breathing Difficulty",
      icon: <Wind size={18} color={Colors.blue} />,
    },
    {
      key: "ansia",
      label: "Anxiety",
      icon: <AlertCircle size={18} color={Colors.blue} />,
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#D1E9FF", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
      />
      <View style={styles.mainHeader}>
        <View style={styles.iconWrapper}>
          <Activity size={48} color={Colors.blue} />
        </View>
        <Text style={FontStyles.variants.mainTitle}>Symptom Tracking</Text>
        <Text style={FontStyles.variants.sectionTitle}>
          Track your symptoms
        </Text>
      </View>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollView}
      >
        {/* Modal Umore */}
        <Modal
          visible={showPicker === "umore"}
          animationType="slide"
          transparent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {["Happy", "Neutral", "Sad", "Anxious"].map((option) => (
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
                <Text style={styles.cancelText}>Cancel</Text>
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
              {["Stable", "Worsened", "Improved"].map((option) => (
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
                <Text style={styles.cancelText}>Cancel</Text>
              </PressableScaleWithRef>
            </View>
          </View>
        </Modal>

        {/* Cards sintomi booleani */}
        {symptomFields.map((item) => (
          <PressableScaleWithRef
            key={item.key}
            onPress={() => handleToggle(item.key)}
            style={[
              styles.card,
              !!formData[item.key] && styles.cardSelected,
            ]}
            weight="light"
            activeScale={0.96}
          >
            <View style={styles.cardHeader}>
              {item.icon}
              <Text style={styles.cardLabel}>{item.label}</Text>
              <View style={{ flex: 1 }} />
              {formData[item.key] ? (
                <Check size={18} color="#007AFF" />
              ) : (
                <X size={18} color="#C7C7CC" />
              )}
            </View>
          </PressableScaleWithRef>
        ))}

        {/* Mood */}
        <PressableScaleWithRef
          onPress={() => setShowPicker("umore")}
          style={[
            styles.card,
            formData.umore ? styles.cardSelected : null,
          ]}
          weight="light"
          activeScale={0.96}
        >
          <View style={styles.cardHeader}>
            <Smile size={18} color={Colors.blue} />
            <Text style={styles.cardLabel}>Mood</Text>
            <View style={{ flex: 1 }} />
            <Text
              style={[
                styles.cardRightValue,
                formData.umore ? { color: "#007AFF" } : null,
              ]}
            >
              {formData.umore ? formData.umore : "Select"}
            </Text>
          </View>
        </PressableScaleWithRef>

        {/* Symptom progression */}
        <PressableScaleWithRef
          onPress={() => setShowPicker("andamentoSintomi")}
          style={[
            styles.card,
            formData.andamentoSintomi ? styles.cardSelected : null,
          ]}
          weight="light"
          activeScale={0.96}
        >
          <View style={styles.cardHeader}>
            <TrendingUp size={18} color={Colors.blue} />
            <Text style={styles.cardLabel}>Symptom Progression</Text>
            <View style={{ flex: 1 }} />
            <Text
              style={[
                styles.cardRightValue,
                formData.andamentoSintomi ? { color: "#007AFF" } : null,
              ]}
            >
              {formData.andamentoSintomi
                ? formData.andamentoSintomi
                : "Select"}
            </Text>
          </View>
        </PressableScaleWithRef>

        {/* Muscle Fatigue */}
        <PressableScaleWithRef
          onPress={() => setShowPicker("fatigue")}
          style={[
            styles.card,
            formData.affaticamentoMuscolare > 0 &&
              styles.cardSelected,
          ]}
        >
          <View style={styles.cardHeader}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
              }}
            >
              <Activity
                size={18}
                color={Colors.blue}
                style={{ marginRight: 9 }}
              />
              <Text style={styles.cardLabel}>Muscle Fatigue</Text>
            </View>
            <Text style={styles.cardRightValue}>
              {formData.affaticamentoMuscolare !== undefined
                ? `${formData.affaticamentoMuscolare} / 10`
                : "Select"}
            </Text>
          </View>
        </PressableScaleWithRef>

        {/* Modal Fatigue */}
        <Modal
          visible={showPicker === "fatigue"}
          animationType="slide"
          transparent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text
                style={[
                  styles.label,
                  { textAlign: "center", marginBottom: 10 },
                ]}
              >
                Select Muscle Fatigue
              </Text>

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.affaticamentoMuscolare}
                  onValueChange={(value) =>
                    handleInputChange(
                      "affaticamentoMuscolare" as keyof FormDataType,
                      value
                    )
                  }
                  style={styles.picker}
                >
                  {[...Array(11).keys()].map((val) => (
                    <Picker.Item
                      key={val}
                      label={`${val}`}
                      value={val}
                    />
                  ))}
                </Picker>
              </View>

              <PressableScaleWithRef
                onPress={() => setShowPicker(null)}
                style={styles.saveButton}
              >
                <Text style={styles.saveText}>Save</Text>
              </PressableScaleWithRef>
            </View>
          </View>
        </Modal>

        {/* Submit */}
        <PressableScaleWithRef
          onPress={saveSymptoms}
          weight="light"
          activeScale={0.96}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </PressableScaleWithRef>
      </ScrollView>

      {toastMessage && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 60,
              left: 20,
              right: 20,
              backgroundColor: Colors.blue,
              padding: 14,
              borderRadius: 16,
              alignItems: "center",
              zIndex: 10,
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 0],
                  }),
                },
              ],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            },
          ]}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            {toastMessage}
          </Text>
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
  scrollView: {
    padding: 20,
    paddingBottom: 100,
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    zIndex: -1,
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
  },
  cardSelected: {
    borderColor: Colors.blue,
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
  cardValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    textAlign: "left",
  },
  pickerWrapper: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  picker: {
    backgroundColor: "#F4F4F6",
    borderRadius: 12,
    padding: 10,
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
  mainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  mainSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  iconSelected: {
    backgroundColor: Colors.green,
    borderRadius: 20,
    padding: 4,
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
  cardRightValue: {
    fontSize: 14,
    color: "#C7C7CC",
    fontWeight: "500",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 12,
    padding: 16,
    elevation: 2,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.gray3,
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: Colors.blue,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray3,
  },
});
