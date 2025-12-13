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
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import { Check, X, Lock } from "lucide-react-native";

// helper per testo leggibile dell’onset category
const getOnsetCategoryLabel = (ageAtOnset: string): string => {
  const trimmed = ageAtOnset.trim();
  if (!trimmed) return "-";
  const n = Number(trimmed.replace(",", "."));
  if (isNaN(n)) return "-";
  if (n < 18) return "Esordio in età infantile (<18 anni)";
  if (n <= 49) return "Early-onset (EOMG, 18–49 anni)";
  if (n <= 64) return "Late-onset (LOMG, 50–64 anni)";
  return "Very late-onset (VLOMG, ≥65 anni)";
};

export default function HistoryMgScreen() {
  // 🔹 Stati collegati 1:1 ai campi Firestore
  const [ageAtOnset, setAgeAtOnset] = useState("");
  const [onsetType, setOnsetType] = useState("");
  const [antibodies, setAntibodies] = useState<string[]>([]);
  const [thymectomy, setThymectomy] = useState<"" | "yes" | "no">("");
  const [thymusHistology, setThymusHistology] = useState("");
  const [neurophysiology, setNeurophysiology] = useState<string[]>([]);
  const [hospitalizationsYears, setHospitalizationsYears] = useState("");
  const [comorbidities, setComorbidities] = useState("");
  const [notes, setNotes] = useState("");
  const [previousTherapies, setPreviousTherapies] = useState("");
  const [thymectomyDateText, setThymectomyDateText] = useState("");

  const [activeModal, setActiveModal] = useState<
    null | "onsetType" | "thymusHistology" | "neurophysiology"
  >(null);

  // 🔐 blocco prima modifica
  const [isLocked, setIsLocked] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 🔹 Opzioni per istologia: label IT, value EN (uguale al DB)
  const histologyOptions = [
    { value: "Thymoma", label: "Timoma" },
    { value: "Hyperplasia", label: "Iperplasia" },
    { value: "Atrophy", label: "Atrofia" },
    { value: "Not sure", label: "Non lo so" },
  ];

  // 🔹 Opzioni neurofisiologia: label IT, value EN
  const neuroOptions = [
    { value: "RNS altered", label: "RNS alterata" },
    { value: "RNS normal", label: "RNS nella norma" },
    { value: "SF-EMG altered", label: "SF-EMG alterata" },
    { value: "SF-EMG normal", label: "SF-EMG nella norma" },
    {
      value: "Not done / I don't remember",
      label: "Esami non eseguiti / non ricordo",
    },
  ];

  useFocusEffect(
    React.useCallback(() => {
      const loadHistory = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
          const ref = doc(db, "users", user.uid, "history", "mg");
          const snap = await getDoc(ref);
          if (!snap.exists()) return;

          const data: any = snap.data();

          // 🔐 blocco se il campo è presente
          if (data.patientHistoryLocked === true) {
            setIsLocked(true);
          } else {
            setIsLocked(false);
          }

          // ageAtOnset (number -> string)
          if (data.ageAtOnset !== undefined && data.ageAtOnset !== null) {
            setAgeAtOnset(String(data.ageAtOnset));
          } else {
            setAgeAtOnset("");
          }

          if (data.onsetType) setOnsetType(data.onsetType);
          else setOnsetType("");

          // anticorpi DB -> pill
          if (Array.isArray(data.antibodies)) {
            const pills: string[] = [];
            if (data.antibodies.includes("anti-AChR")) pills.push("AChR");
            if (data.antibodies.includes("anti-MuSK")) pills.push("MuSK");
            if (data.antibodies.includes("anti-LRP4")) pills.push("LRP4");
            if (data.antibodies.includes("double-seronegative"))
              pills.push("Double seronegative");
            if (data.antibodies.includes("unknown")) pills.push("Not sure");
            setAntibodies(pills);
          } else {
            setAntibodies([]);
          }

          if (data.thymectomy === "yes" || data.thymectomy === "no") {
            setThymectomy(data.thymectomy);
          } else {
            setThymectomy("");
          }

          if (data.thymusHistology) setThymusHistology(data.thymusHistology);
          else setThymusHistology("");

          const neuroSelected: string[] = [];
          const neuroTests: string[] = Array.isArray(data.neuroTests)
            ? data.neuroTests
            : [];
          const neuroSfEmgResult = data.neuroSfEmgResult || "";
          const neuroSrEmgResult = data.neuroSrEmgResult || "";

          if (neuroTests.includes("RNS")) {
            if (neuroSrEmgResult === "alterata")
              neuroSelected.push("RNS altered");
            else if (neuroSrEmgResult === "nella norma")
              neuroSelected.push("RNS normal");
          }
          if (neuroTests.includes("SF-EMG")) {
            if (neuroSfEmgResult === "alterata")
              neuroSelected.push("SF-EMG altered");
            else if (neuroSfEmgResult === "nella norma")
              neuroSelected.push("SF-EMG normal");
          }
          setNeurophysiology(neuroSelected);

          if (Array.isArray(data.hospitalizationYears)) {
            setHospitalizationsYears(data.hospitalizationYears.join(", "));
          } else {
            setHospitalizationsYears("");
          }

          if (data.comorbidities) setComorbidities(data.comorbidities);
          else setComorbidities("");

          if (data.notes) setNotes(data.notes);
          else setNotes("");

          if (data.previousTherapies)
            setPreviousTherapies(data.previousTherapies);
          else setPreviousTherapies("");

          if (data.thymectomyDate instanceof Timestamp) {
            const d = data.thymectomyDate.toDate();
            setThymectomyDateText(d.toLocaleDateString("it-IT"));
          } else {
            setThymectomyDateText("");
          }
        } catch (err) {
          console.error("Errore nel caricamento dello storico MG:", err);
        }
      };

      loadHistory();
      return () => {};
    }, [])
  );

  const toggleInArray = (
    value: string,
    list: string[],
    setter: (v: string[]) => void
  ) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  // parser per data timectomia
  const parseThymectomyDate = (raw: string): Date | null => {
    const value = raw.trim();
    if (!value) return null;

    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const [_, y, m, d] = isoMatch;
      const dt = new Date(
        Number(y),
        Number(m) - 1,
        Number(d),
        0,
        0,
        0,
        0
      );
      return isNaN(dt.getTime()) ? null : dt;
    }

    const itMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (itMatch) {
      const [_, d, m, y] = itMatch;
      const dt = new Date(
        Number(y),
        Number(m) - 1,
        Number(d),
        0,
        0,
        0,
        0
      );
      return isNaN(dt.getTime()) ? null : dt;
    }

    return null;
  };

  // 🔘 click sul bottone: solo apre il riepilogo
  const handleSavePress = () => {
    if (isLocked) {
      Toast.show({
        type: "info",
        text1: "Storico già inviato",
        text2: "Per modifiche rivolgiti al tuo neurologo.",
        position: "top",
      });
      return;
    }
    setShowConfirmModal(true);
  };

  // 💾 salvataggio effettivo dopo conferma
  const performSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Toast.show({
        type: "error",
        text1: "❌ Utente non autenticato",
        position: "top",
      });
      return;
    }

    // ageAtOnset → number
    let ageNumber: number | null = null;
    if (ageAtOnset.trim().length > 0) {
      const n = Number(ageAtOnset.replace(",", "."));
      if (!isNaN(n) && n > 0 && n < 120) {
        ageNumber = Math.round(n);
      } else {
        Toast.show({
          type: "error",
          text1: "Età all’esordio non valida",
          text2: "Inserisci un numero realistico (ad es. 31).",
          position: "top",
        });
        return;
      }
    }

    // onsetCategory dal numero (stessa logica web)
    let onsetCategory = "";
    if (ageNumber !== null) {
      if (ageNumber < 18) onsetCategory = "Childhood";
      else if (ageNumber <= 49) onsetCategory = "EOMG";
      else if (ageNumber <= 64) onsetCategory = "LOMG";
      else onsetCategory = "VLOMG";
    }

    // anni di ricovero
    const hospitalizationYearsArray =
      hospitalizationsYears
        .split(",")
        .map((y) => y.trim())
        .filter((y) => y.length > 0);

    // anticorpi
    const mappedAntibodies: string[] = [];
    if (antibodies.includes("AChR")) mappedAntibodies.push("anti-AChR");
    if (antibodies.includes("MuSK")) mappedAntibodies.push("anti-MuSK");
    if (antibodies.includes("LRP4")) mappedAntibodies.push("anti-LRP4");
    if (antibodies.includes("Double seronegative"))
      mappedAntibodies.push("double-seronegative");
    if (antibodies.includes("Not sure")) mappedAntibodies.push("unknown");

    // neurofisiologia
    let neuroTests: string[] = [];
    let neuroSfEmgResult = "";
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
          neuroSfEmgResult = "alterata";
          break;
        case "SF-EMG normal":
          if (!neuroTests.includes("SF-EMG")) neuroTests.push("SF-EMG");
          neuroSfEmgResult = "nella norma";
          break;
        case "Not done / I don't remember":
          neuroTests = [];
          neuroSfEmgResult = "";
          neuroSrEmgResult = "";
          break;
      }
    });

    // data timectomia
    const parsedThDate = parseThymectomyDate(thymectomyDateText);

    const ref = doc(db, "users", user.uid, "history", "mg");

    const payload: any = {
      onsetType,
      onsetCategory: onsetCategory || null,
      antibodies: mappedAntibodies,
      thymectomy,
      thymusHistology,
      neuroTests,
      neuroSfEmgResult,
      neuroSrEmgResult,
      hospitalizationYears: hospitalizationYearsArray,
      comorbidities,
      notes,
      previousTherapies,
      lastUpdatedAt: Timestamp.now(),
      source: "patient_app",
      // 🔐 blocco dopo il primo invio
      patientHistoryLocked: true,
    };

    if (ageNumber !== null) {
      payload.ageAtOnset = ageNumber;
    }

    if (parsedThDate) {
      payload.thymectomyDate = Timestamp.fromDate(parsedThDate);
    }

    try {
      await setDoc(ref, payload, { merge: true });
      setShowConfirmModal(false);
      setIsLocked(true); // blocca localmente subito

      Toast.show({
        type: "success",
        text1: "Storico MG inviato",
        text2: "I dati sono stati salvati. Saranno rivisti dal neurologo.",
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

  const onsetCategoryLabel = getOnsetCategoryLabel(ageAtOnset);
  const readableThymectomy =
    thymectomy === "yes" ? "Sì" : thymectomy === "no" ? "No" : "-";
  const readableHistology =
    histologyOptions.find((h) => h.value === thymusHistology)?.label || "-";
  const readableNeuro =
    neurophysiology.length > 0
      ? neurophysiology
          .map(
            (val) => neuroOptions.find((o) => o.value === val)?.label || val
          )
          .join(" · ")
      : "-";

  const readableAntibodies =
    antibodies.length > 0 ? antibodies.join(", ") : "Nessuno / non lo so";

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      {/* HEADER GRADIENT */}
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
        <Text style={FontStyles.variants.mainTitle}>
          Storico Miastenia Gravis
        </Text>
        <Text style={FontStyles.variants.sectionTitle}>
          Raccontaci la storia della tua diagnosi
        </Text>
      </View>

      {/* Banner blocco */}
      {isLocked && (
        <View style={styles.lockBanner}>
          <Lock size={18} color={Colors.turquoise} />
          <Text style={styles.lockBannerText}>
            Hai già inviato il tuo storico. Eventuali correzioni verranno fatte
            dal tuo neurologo in clinica.
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Età all’esordio */}
        <View
          style={[
            styles.card,
            ageAtOnset ? styles.cardSelected : null,
            isLocked && styles.cardDisabled,
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={Colors.turquoise}
            />
            <Text style={styles.cardLabel}>Età all’esordio dei sintomi</Text>
          </View>
          <Text style={styles.helperText}>
            Inserisci quanti anni avevi quando sono comparsi i primi sintomi di
            Miastenia Gravis.
          </Text>
          <TextInput
            value={ageAtOnset}
            onChangeText={setAgeAtOnset}
            placeholder="Es. 31"
            keyboardType="numeric"
            style={styles.textInput}
            editable={!isLocked}
          />
        </View>

        {/* Tipo di esordio */}
        <PressableScaleWithRef
          onPress={
            isLocked ? undefined : () => setActiveModal("onsetType")
          }
          style={[
            styles.card,
            onsetType ? styles.cardSelected : null,
            isLocked && styles.cardDisabled,
          ]}
          weight="light"
          activeScale={isLocked ? 1 : 0.96}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="eye-outline" size={20} color={Colors.turquoise} />
            <Text style={styles.cardLabel}>Tipo di esordio</Text>
            <View style={{ flex: 1 }} />
            <Text
              style={[
                styles.cardRightValue,
                onsetType ? { color: Colors.turquoise } : null,
              ]}
            >
              {onsetType || "Seleziona"}
            </Text>
            <Ionicons
              name="chevron-forward-outline"
              size={16}
              color={Colors.light3}
              style={{ marginLeft: 6 }}
            />
          </View>
        </PressableScaleWithRef>

        {/* Anticorpi (multi-select, stile "questionario") */}
        <View
          style={[
            styles.card,
            antibodies.length > 0 ? styles.cardSelected : null,
            isLocked && styles.cardDisabled,
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="flask-outline" size={20} color={Colors.turquoise} />
            <Text style={styles.cardLabel}>Anticorpi (se conosciuti)</Text>
          </View>

          <Text style={styles.helperText}>
            Seleziona uno o più anticorpi. Se non li conosci, puoi scegliere “Not sure”.
          </Text>

          <View style={styles.optionColumn}>
            {["AChR", "MuSK", "LRP4", "Double seronegative", "Not sure"].map((ab) => {
              const isSelected = antibodies.includes(ab);
              return (
                <PressableScaleWithRef
                  key={ab}
                  onPress={
                    isLocked ? undefined : () => toggleInArray(ab, antibodies, setAntibodies)
                  }
                  weight="light"
                  activeScale={isLocked ? 1 : 0.96}
                  style={[
                    styles.optionFull,
                    isSelected && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {ab}
                  </Text>
                </PressableScaleWithRef>
              );
            })}
          </View>
        </View>

        {/* Terapie precedenti */}
        <View
          style={[
            styles.card,
            previousTherapies ? styles.cardSelected : null,
            isLocked && styles.cardDisabled,
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="medkit-outline"
              size={20}
              color={Colors.turquoise}
            />
            <Text style={styles.cardLabel}>Terapie precedenti per la MG</Text>
          </View>
          <Text style={styles.helperText}>
            Ad esempio: corticosteroidi, IVIG, plasmaferesi, altri
            immunosoppressori…
          </Text>
          <TextInput
            value={previousTherapies}
            onChangeText={setPreviousTherapies}
            placeholder="Scrivi qui le principali terapie che hai fatto in passato."
            multiline
            style={styles.textArea}
            editable={!isLocked}
          />
        </View>

        {/* Timectomia sì/no */}
        <PressableScaleWithRef
          onPress={
            isLocked
              ? undefined
              : () =>
                  setThymectomy((prev) =>
                    prev === "yes" ? "no" : prev === "no" ? "" : "yes"
                  )
          }
          style={[
            styles.card,
            thymectomy && styles.cardSelected,
            isLocked && styles.cardDisabled,
          ]}
          weight="light"
          activeScale={isLocked ? 1 : 0.96}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="body-outline" size={20} color={Colors.turquoise} />
            <Text style={styles.cardLabel}>Timectomia</Text>
            <View style={{ flex: 1 }} />
            {thymectomy === "yes" && (
              <Check size={18} color={Colors.turquoise} />
            )}
            {thymectomy === "no" && <X size={18} color={Colors.light3} />}
            {!thymectomy && (
              <Text style={styles.cardRightValue}>Sì / No</Text>
            )}
          </View>
          {thymectomy === "yes" && (
            <Text style={styles.helperText}>
              Se la ricordi, puoi indicare anche la data dell’intervento e
              l’istologia.
            </Text>
          )}
        </PressableScaleWithRef>

        {/* Data timectomia */}
        {thymectomy === "yes" && (
          <View
            style={[
              styles.card,
              thymectomyDateText ? styles.cardSelected : null,
              isLocked && styles.cardDisabled,
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="calendar-number-outline"
                size={20}
                color={Colors.turquoise}
              />
              <Text style={styles.cardLabel}>Data della timectomia</Text>
            </View>
            <Text style={styles.helperText}>
              Puoi scrivere la data come gg/mm/aaaa oppure aaaa-mm-gg.
            </Text>
            <TextInput
              value={thymectomyDateText}
              onChangeText={setThymectomyDateText}
              placeholder="Es. 11/11/2025 oppure 2025-11-11"
              style={styles.textInput}
              editable={!isLocked}
            />
          </View>
        )}

        {/* Istologia timica */}
        {thymectomy === "yes" && (
          <PressableScaleWithRef
            onPress={
              isLocked ? undefined : () => setActiveModal("thymusHistology")
            }
            style={[
              styles.card,
              thymusHistology ? styles.cardSelected : null,
              isLocked && styles.cardDisabled,
            ]}
            weight="light"
            activeScale={isLocked ? 1 : 0.96}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="file-tray-outline"
                size={20}
                color={Colors.turquoise}
              />
              <Text style={styles.cardLabel}>Istologia timica</Text>
              <View style={{ flex: 1 }} />
              <Text
                style={[
                  styles.cardRightValue,
                  thymusHistology ? { color: Colors.turquoise } : null,
                ]}
              >
                {readableHistology || "Seleziona"}
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

        {/* Esami neurofisiologici */}
        <PressableScaleWithRef
          onPress={
            isLocked ? undefined : () => setActiveModal("neurophysiology")
          }
          style={[
            styles.card,
            neurophysiology.length > 0 && styles.cardSelected,
            isLocked && styles.cardDisabled,
          ]}
          weight="light"
          activeScale={isLocked ? 1 : 0.96}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="pulse-outline"
              size={20}
              color={Colors.turquoise}
            />
            <Text style={styles.cardLabel}>Esami neurofisiologici</Text>
          </View>
          <Text style={styles.helperText}>
            Se lo ricordi, indica quali esami hai fatto (RNS, SF-EMG) e il
            risultato.
          </Text>
          {neurophysiology.length > 0 && (
            <Text style={styles.selectedSummary} numberOfLines={1}>
              {readableNeuro}
            </Text>
          )}
        </PressableScaleWithRef>

        {/* Anni con ricoveri */}
        <View
          style={[
            styles.card,
            hospitalizationsYears ? styles.cardSelected : null,
            isLocked && styles.cardDisabled,
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="medkit" size={20} color={Colors.turquoise} />
            <Text style={styles.cardLabel}>Anni con ricoveri</Text>
          </View>
          <Text style={styles.helperText}>
            Se ti ricordi in quali anni sei stato/a ricoverato/a per problemi
            legati alla MG, indicali qui (separati da virgola).
          </Text>
          <TextInput
            value={hospitalizationsYears}
            onChangeText={setHospitalizationsYears}
            placeholder="Es. 2021, 2023"
            keyboardType="numeric"
            style={styles.textInput}
            editable={!isLocked}
          />
        </View>

        {/* Comorbidità */}
        <View
          style={[
            styles.card,
            comorbidities ? styles.cardSelected : null,
            isLocked && styles.cardDisabled,
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="list-outline" size={20} color={Colors.turquoise} />
            <Text style={styles.cardLabel}>Altre condizioni di salute</Text>
          </View>
          <TextInput
            value={comorbidities}
            onChangeText={setComorbidities}
            placeholder="Es. malattia tiroidea, diabete..."
            multiline
            style={styles.textArea}
            editable={!isLocked}
          />
        </View>

        {/* Note libere */}
        <View
          style={[
            styles.card,
            notes ? styles.cardSelected : null,
            isLocked && styles.cardDisabled,
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color={Colors.turquoise}
            />
            <Text style={styles.cardLabel}>Note per il/la neurologo/a</Text>
          </View>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Qualsiasi altra informazione importante sulla tua storia clinica."
            multiline
            style={styles.textArea}
            editable={!isLocked}
          />
        </View>

        {/* BOTTONE SALVATAGGIO (solo se non bloccato) */}
        {!isLocked && (
          <PressableScaleWithRef
            onPress={handleSavePress}
            weight="light"
            activeScale={0.96}
            style={styles.saveButton}
          >
            <Text style={styles.saveText}>Salva storico</Text>
          </PressableScaleWithRef>
        )}
      </ScrollView>

      {/* MODAL: Tipo di esordio */}
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
                    setOnsetType(opt);
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
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Istologia timica */}
      <Modal
        visible={activeModal === "thymusHistology"}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {histologyOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.optionItem}
                onPress={() => {
                  setThymusHistology(opt.value);
                  setActiveModal(null);
                }}
              >
                <Text style={styles.optionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelItem}
              onPress={() => setActiveModal(null)}
            >
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Neurofisiologia */}
      <Modal
        visible={activeModal === "neurophysiology"}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {neuroOptions.map((opt) => {
              const selected = neurophysiology.includes(opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.optionItem,
                    selected && { backgroundColor: "#F2F2F7" },
                  ]}
                  onPress={() =>
                    toggleInArray(opt.value, neurophysiology, setNeurophysiology)
                  }
                >
                  <Text style={styles.optionText}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.cancelItem}
              onPress={() => setActiveModal(null)}
            >
              <Text style={styles.cancelText}>Fine</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Conferma invio con riepilogo */}
      <Modal visible={showConfirmModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "80%" }]}>
            <Text style={styles.confirmTitle}>Conferma invio storico</Text>
            <Text style={styles.confirmSubtitle}>
              Controlla che i dati qui sotto siano corretti. Dopo l’invio non
              potrai più modificarli dall’app.
            </Text>

            <ScrollView style={{ marginTop: 12, marginBottom: 16 }}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Età all’esordio</Text>
                <Text style={styles.summaryValue}>
                  {ageAtOnset || "-"}{" "}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Categoria esordio</Text>
                <Text style={styles.summaryValue}>
                  {onsetCategoryLabel}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tipo di esordio</Text>
                <Text style={styles.summaryValue}>
                  {onsetType || "-"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Anticorpi</Text>
                <Text style={styles.summaryValue}>
                  {readableAntibodies}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Terapie precedenti</Text>
                <Text style={styles.summaryValue}>
                  {previousTherapies || "-"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Timectomia</Text>
                <Text style={styles.summaryValue}>{readableThymectomy}</Text>
              </View>
              {thymectomy === "yes" && (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      Data timectomia
                    </Text>
                    <Text style={styles.summaryValue}>
                      {thymectomyDateText || "-"}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      Istologia timica
                    </Text>
                    <Text style={styles.summaryValue}>
                      {readableHistology}
                    </Text>
                  </View>
                </>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Esami neurofisiologici
                </Text>
                <Text style={styles.summaryValue}>{readableNeuro}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Anni con ricoveri</Text>
                <Text style={styles.summaryValue}>
                  {hospitalizationsYears || "-"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Comorbidità</Text>
                <Text style={styles.summaryValue}>
                  {comorbidities || "-"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Note libere</Text>
                <Text style={styles.summaryValue}>{notes || "-"}</Text>
              </View>
            </ScrollView>

            <View style={styles.confirmButtonsRow}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmCancel]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.confirmCancelText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmOk]}
                onPress={performSave}
              >
                <Text style={styles.confirmOkText}>Conferma invio</Text>
              </TouchableOpacity>
            </View>
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
  cardDisabled: {
    opacity: 0.6,
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
    color: Colors.gray3,
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
  lockBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#E5F7F4",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lockBannerText: {
    flex: 1,
    fontSize: 13,
    color: Colors.gray1,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
    color: "#111",
  },
  confirmSubtitle: {
    fontSize: 13,
    textAlign: "center",
    color: Colors.gray3 || "#6e6e73",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6e6e73",
    maxWidth: "55%",
  },
  summaryValue: {
    fontSize: 13,
    color: "#111",
    textAlign: "right",
    maxWidth: "45%",
  },
  confirmButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  confirmCancel: {
    backgroundColor: "#F2F2F7",
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  confirmOk: {
    backgroundColor: Colors.turquoise,
  },
  confirmOkText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
  },
  // --- "Questionnaire-like" options (full-width, stacked) ---
  optionColumn: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 8,
    marginTop: 12,
  },
  optionFull: {
    backgroundColor: Colors.light2,     // come questionario
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionSelected: {
    backgroundColor: Colors.turquoise,  // accent della pagina (al posto del viola)
  },
  optionTextSelected: {
    color: "#fff",
  },
});
