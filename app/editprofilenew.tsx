import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardTypeOptions,
  Animated,
  Platform,
} from "react-native";
import { auth, db } from "../firebaseconfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import BottomNavigation from "../components/bottomnavigationnew";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import PressableScaleWithRef from "../components/PressableScaleWithRef";
import { LinearGradient } from "expo-linear-gradient";

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    city: "",
    phone: "",
    height: "",
    weight: "",
  });

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        setLoading(true);
        try {
          if (auth.currentUser) {
            const userRef = doc(db, "users", auth.currentUser.uid);
            const snapshot = await getDoc(userRef);
            if (snapshot.exists()) {
              const data = snapshot.data() as any;
              setFormData({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                age: data.age?.toString() || "",
                city: data.city || "",
                phone: data.phone || "",
                height: data.height || "",
                weight: data.weight || "",
              });
            }
          }
        } finally {
          setLoading(false);
        }
      };

      loadUserData();

      return () => {
        setFormData({
          firstName: "",
          lastName: "",
          age: "",
          city: "",
          phone: "",
          height: "",
          weight: "",
        });
      };
    }, [])
  );

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.delay(1800),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(null));
  };

  const handleSave = async () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.age.trim() ||
      isNaN(Number(formData.age))
    ) {
      Alert.alert(
        "Errore di validazione",
        "Compila correttamente i campi obbligatori (*)."
      );
      return;
    }

    try {
      const userRef = doc(db, "users", auth.currentUser!.uid);
      await updateDoc(userRef, {
        ...formData,
        age: parseInt(formData.age, 10),
      });

      showToast("✅ Profilo aggiornato con successo");
      setTimeout(() => router.back(), 2200);
    } catch (err) {
      Alert.alert("Errore", "Si è verificato un problema durante il salvataggio.");
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" style={{ flex: 1 }} color={Colors.blue} />
    );
  }

  const fields: {
    key: keyof typeof formData;
    label: string;
    placeholder: string;
    keyboard: KeyboardTypeOptions;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    required?: boolean;
  }[] = [
    {
      key: "firstName",
      label: "Nome *",
      placeholder: "Inserisci il nome",
      keyboard: "default",
      icon: "person",
      color: Colors.blue,
      required: true,
    },
    {
      key: "lastName",
      label: "Cognome *",
      placeholder: "Inserisci il cognome",
      keyboard: "default",
      icon: "person",
      color: Colors.purple,
      required: true,
    },
    {
      key: "age",
      label: "Età *",
      placeholder: "Inserisci l’età",
      keyboard: "numeric",
      icon: "calendar",
      color: Colors.orange,
      required: true,
    },
    {
      key: "city",
      label: "Città",
      placeholder: "Inserisci la città",
      keyboard: "default",
      icon: "location",
      color: Colors.green,
    },
    {
      key: "phone",
      label: "Telefono",
      placeholder: "Inserisci il numero",
      keyboard: "phone-pad",
      icon: "call",
      color: Colors.red,
    },
    {
      key: "height",
      label: "Altezza",
      placeholder: "Es. 170 cm",
      keyboard: "numeric",
      icon: "resize",
      color: Colors.turquoise,
    },
    {
      key: "weight",
      label: "Peso",
      placeholder: "Es. 65 kg",
      keyboard: "numeric",
      icon: "barbell",
      color: Colors.yellow,
    },
  ];

  const isSelected = (k: keyof typeof formData) => {
    const v = (formData[k] || "").toString().trim();
    return v.length > 0;
  };

  return (
    <View style={styles.container}>
      {/* Gradient header */}
      <LinearGradient
        colors={["#D1E9FF", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
      />

      {/* Main header (SleepTracking-like) */}
      <View style={styles.mainHeader}>
        <View style={styles.iconWrapper}>
          <Ionicons name="create" size={48} color={Colors.blue} />
        </View>
        <Text style={FontStyles.variants.mainTitle}>Modifica profilo</Text>
        <Text style={FontStyles.variants.sectionTitle}>
          Aggiorna i tuoi dati personali
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {fields.map((f) => (
          <PressableScaleWithRef
            key={f.key}
            style={[styles.card, isSelected(f.key) && styles.cardSelectedBlue]}
            weight="light"
            activeScale={0.96}
          >
            <View style={styles.cardHeader}>
              <Ionicons name={f.icon} size={20} color={f.color} />
              <Text style={styles.cardLabel}>{f.label}</Text>
            </View>

            <TextInput
              value={formData[f.key]}
              onChangeText={(t) => handleChange(f.key, t)}
              keyboardType={f.keyboard}
              placeholder={f.placeholder}
              placeholderTextColor={Colors.light3}
              style={styles.input}
            />
          </PressableScaleWithRef>
        ))}

        <PressableScaleWithRef
          onPress={handleSave}
          weight="light"
          activeScale={0.96}
          style={styles.saveButton}
        >
          <Text style={styles.saveText}>Salva modifiche</Text>
        </PressableScaleWithRef>
      </ScrollView>

      {/* Toast top */}
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
                    outputRange: [-50, 0],
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
  container: { flex: 1, backgroundColor: Colors.light1 },

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

  // Card Apple-like con bordo sottile
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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

  // highlight molto sottile (come richiesto)
  cardSelectedBlue: {
    borderColor: Colors.blue,
    borderWidth: 1,
  },

  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 16,
    color: Colors.gray1,
  },

  saveButton: {
    backgroundColor: Colors.blue,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 6,
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

  toast: {
    position: "absolute",
    top: 58,
    left: 20,
    right: 20,
    backgroundColor: Colors.blue,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
