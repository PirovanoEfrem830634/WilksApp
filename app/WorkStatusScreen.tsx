import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { PressableScale } from "react-native-pressable-scale";

import { auth, db } from "../firebaseconfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import BottomNavigation from "../components/bottomnavigationnew";
import { LinearGradient } from "expo-linear-gradient";
import PressableScaleWithRef from "../components/PressableScaleWithRef";
import Toast from "react-native-toast-message";

type BaselineWorkStatus = {
  currentlyWorking: boolean | null;
  notWorkingDueToMG: boolean | null;
  compiledAt?: any;
  compiledBy?: "patient" | "doctor";
};

export default function WorkStatusScreen() {
  const [baseline, setBaseline] = useState<BaselineWorkStatus>({
    currentlyWorking: null,
    notWorkingDueToMG: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    const loadBaseline = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid, "work_status", "baseline");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as BaselineWorkStatus;
          setBaseline({
            currentlyWorking:
              typeof data.currentlyWorking === "boolean"
                ? data.currentlyWorking
                : null,
            notWorkingDueToMG:
              typeof data.notWorkingDueToMG === "boolean"
                ? data.notWorkingDueToMG
                : null,
            compiledAt: data.compiledAt,
            compiledBy: data.compiledBy,
          });
        }
      } catch (err) {
        console.error("Errore caricando work_status baseline:", err);
        Alert.alert(
          "Errore",
          "Non è stato possibile caricare le informazioni sul lavoro."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBaseline();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert(
        "Accesso richiesto",
        "Per salvare questi dati devi effettuare il login."
      );
      return;
    }

    if (baseline.currentlyWorking === null) {
      Alert.alert(
        "Dato mancante",
        "Per favore indica se attualmente lavori."
      );
      return;
    }

    if (baseline.currentlyWorking === false && baseline.notWorkingDueToMG === null) {
      Alert.alert(
        "Dato mancante",
        "Per favore indica se non lavori a causa della miastenia."
      );
      return;
    }

    try {
    setSaving(true);
    const ref = doc(db, "users", user.uid, "work_status", "baseline");

    await setDoc(
        ref,
        {
        currentlyWorking: baseline.currentlyWorking,
        notWorkingDueToMG:
            baseline.currentlyWorking === false
            ? baseline.notWorkingDueToMG
            : null,
        compiledAt: new Date(),
        compiledBy: "patient",
        },
        { merge: true }
    );

    Toast.show({
        type: "success",
        text1: "Stato lavorativo aggiornato",
        text2: "Le informazioni sono state salvate correttamente.",
        position: "top",
        visibilityTime: 2200,
    });

    } catch (err) {
    console.error("Errore salvando work_status baseline:", err);

    Toast.show({
        type: "error",
        text1: "Errore nel salvataggio",
        text2: "Riprova più tardi.",
        position: "top",
        visibilityTime: 2200,
    });

    } finally {
    setSaving(false);
    }

  };

  const renderBurdenTag = () => {
    if (baseline.currentlyWorking === null) return null;

    let label = "Dato non completo";
    let bg = "#E5E5EA";
    let text = "#1C1C1E";

    if (baseline.currentlyWorking === true) {
      label = "Lavora attualmente";
      bg = "#E0F7E7";
      text = "#1B5E20";
    } else {
      if (baseline.notWorkingDueToMG === true) {
        label = "Non lavora a causa della MG";
        bg = "#FDECEC";
        text = "#B00020";
      } else if (baseline.notWorkingDueToMG === false) {
        label = "Non lavora (non per MG)";
        bg = "#FFF4E5";
        text = "#BF360C";
      }
    }

    return (
      <View style={[styles.burdenTag, { backgroundColor: bg }]}>
        <Ionicons
          name="briefcase-outline"
          size={16}
          color={text}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.burdenTagText, { color: text }]}>{label}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.blue} />
        <Text style={styles.loadingText}>
          Carico le informazioni sul lavoro…
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient stile bloodmonitoring (rosso / rosa) */}
      <LinearGradient
        colors={["#F98C9D", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
      />

      {/* Header centrale Apple-style, come bloodmonitoring */}
      <Animatable.View
        animation="fadeInDown"
        duration={500}
        style={styles.mainHeader}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="briefcase" size={48} color={Colors.red} />
        </View>
        <Text style={FontStyles.variants.mainTitle}>
          Work & Social Impact
        </Text>
        <Text style={FontStyles.variants.sectionTitle}>
          Indica la tua situazione lavorativa
        </Text>
        <Text style={[FontStyles.variants.cardDescription, { marginTop: 8 }]}>
          Questi dati aiutano il team clinico a capire meglio l’impatto della
          miastenia sul tuo ruolo sociale e sulla vita quotidiana.
        </Text>
      </Animatable.View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card: Situazione attuale – stile card bloodmonitoring */}
        <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="person-outline" size={20} color={Colors.red} />
            <Text style={styles.cardLabel}>Situazione attuale</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Indica se al momento stai lavorando. Puoi aggiornare questo dato
            quando la tua situazione cambia.
          </Text>

          <Text style={styles.fieldLabel}>Attualmente lavori?</Text>
          <View style={styles.segmentRow}>
            <SegmentButton
              label="Sì"
              active={baseline.currentlyWorking === true}
              onPress={() =>
                setBaseline((prev) => ({
                  ...prev,
                  currentlyWorking: true,
                  notWorkingDueToMG: null,
                }))
              }
            />
            <SegmentButton
              label="No"
              active={baseline.currentlyWorking === false}
              onPress={() =>
                setBaseline((prev) => ({
                  ...prev,
                  currentlyWorking: false,
                }))
              }
            />
          </View>

          {baseline.currentlyWorking === false && (
            <Animatable.View animation="fadeInUp" duration={400}>
              <Text style={styles.fieldLabel}>
                Non lavori a causa della miastenia?
              </Text>
              <View style={styles.segmentRow}>
                <SegmentButton
                  label="Sì"
                  active={baseline.notWorkingDueToMG === true}
                  onPress={() =>
                    setBaseline((prev) => ({
                      ...prev,
                      notWorkingDueToMG: true,
                    }))
                  }
                />
                <SegmentButton
                  label="No"
                  active={baseline.notWorkingDueToMG === false}
                  onPress={() =>
                    setBaseline((prev) => ({
                      ...prev,
                      notWorkingDueToMG: false,
                    }))
                  }
                />
              </View>
            </Animatable.View>
          )}

          {renderBurdenTag()}
        </Animatable.View>

        {/* Card: Perché ti chiediamo questo */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={Colors.red}
            />
            <Text style={styles.cardLabel}>Perché ti chiediamo questo</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Il lavoro è una parte importante del ruolo sociale di una persona.
            Sapere se la miastenia influenza la tua attività lavorativa ci
            aiuta a valutare il burden complessivo della malattia.
          </Text>
          <Text style={styles.cardHighlight}>
            Il medico vedrà questi dati nella tua scheda paziente, insieme a
            sintomi, scale e terapia.
          </Text>
        </Animatable.View>

        {/* Placeholder: Aggiornamenti trimestrali – come se fosse una sezione futura */}
        <Animatable.View
          animation="fadeInUp"
          delay={250}
          style={styles.cardMuted}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={Colors.gray1}
            />
            <Text style={styles.cardLabelMuted}>Aggiornamenti trimestrali</Text>
          </View>
          <Text style={styles.cardSubtitleMuted}>
            In futuro qui potrai indicare se hai perso giorni di lavoro a causa
            della miastenia nei vari trimestri dell’anno. Questi dati
            contribuiranno a un indicatore più completo di impatto sociale.
          </Text>
          <Text style={styles.cardSubtitleMuted}>
            La funzionalità verrà attivata quando imposteremo gli alert
            periodici nella tua app.
          </Text>
        </Animatable.View>

        {/* Pulsante Salva – stile reloadButton bloodmonitoring */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.saveWrapper}>
          <PressableScaleWithRef
            onPress={handleSave}
            style={styles.saveButton}
            activeScale={0.96}
            weight="normal"
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#fff"
                />
              )}
              <Text style={styles.saveButtonText}>
                Salva stato lavorativo
              </Text>
            </View>
          </PressableScaleWithRef>
          <Text style={styles.saveHint}>
            Puoi modificare queste informazioni in qualsiasi momento.
          </Text>
        </Animatable.View>
      </ScrollView>

      <BottomNavigation />
      <Toast />
    </View>
  );
}

type SegmentButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function SegmentButton({ label, active, onPress }: SegmentButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      activeScale={0.96}
      weight="medium"
      style={[styles.segmentButton, active && styles.segmentButtonActive]}
    >
      <Text
        style={[
          styles.segmentButtonText,
          active && styles.segmentButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light1,
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

  // Cards stile bloodmonitoring
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  cardMuted: {
    backgroundColor: "#F5F5F7",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  cardLabelMuted: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3A3A3C",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6E6E73",
    marginTop: 8,
    marginBottom: 8,
  },
  cardSubtitleMuted: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
    marginBottom: 4,
  },
  cardHighlight: {
    fontSize: 14,
    color: "#1C1C1E",
    marginTop: 10,
  },

  fieldLabel: {
    marginTop: 4,
    marginBottom: 4,
    color: "#1C1C1E",
    fontSize: 15,
    fontWeight: "600",
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: Colors.blue,
  },
  segmentButtonText: {
    color: "#3A3A3C",
    fontSize: 14,
  },
  segmentButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  burdenTag: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  burdenTagText: {
    fontSize: 13,
  },

  saveWrapper: {
    marginTop: 8,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: Colors.blue,
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
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveHint: {
    marginTop: 6,
    textAlign: "center",
    color: "#6E6E73",
    fontSize: 13,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.light1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#6E6E73",
  },

  gray1: {
    color: Colors.gray1,
  },
});
