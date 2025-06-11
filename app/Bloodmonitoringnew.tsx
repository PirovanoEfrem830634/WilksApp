import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  TextInput,
} from "react-native";
import { getDocs, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { getAuth } from "firebase/auth";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react-native";
import { MotiView } from "moti";
import Toast from "react-native-toast-message";
import BottomNavigation from "../app/bottomnavigationnew";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { PressableScale } from "react-native-pressable-scale";
import { Ionicons } from "@expo/vector-icons";
import { Modal, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';


if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type BloodTest = {
  id: string;
  createdAt: any;
  antiAChR: string;
  antiMuSK: string;
  antiLRP4: string;
  notes?: string;
};

const MonitoraggioClinicoSangue = () => {
  const [bloodTests, setBloodTests] = useState<BloodTest[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

const [examData, setExamData] = useState({
  antiAChR: "",
  antiMuSK: "",
  antiLRP4: "",
  notes: "",
});
const [editingField, setEditingField] = useState<null | string>(null);

  const fetchBloodTests = async () => {
    try {
      setLoading(true);
      const uid = getAuth().currentUser?.uid;
      if (!uid) throw new Error("Utente non autenticato");

      const snapshot = await getDocs(collection(db, `users/${uid}/blood_tests`));
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as BloodTest))
        .sort((a, b) => new Date(b.createdAt.seconds * 1000).getTime() - new Date(a.createdAt.seconds * 1000).getTime());

      setBloodTests(docs);

      Toast.show({
        type: "success",
        text1: "Updated blood tests",
        position: "top",
        visibilityTime: 2000,
      });
    } catch (err: any) {
      console.error("Blood test fetch error:", err);
      Toast.show({
        type: "error",
        text1: "Blood test fetch error",
        text2: err.message,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodTests();
  }, []);

  const toggleSection = () => {
    LayoutAnimation.easeInEaseOut();
    setOpen(prev => !prev);
  };

  const handleSubmit = async () => {
    try {
      const uid = getAuth().currentUser?.uid;
      if (!uid) throw new Error("User not authenticated");

      await addDoc(collection(db, `users/${uid}/blood_tests`), {
        ...examData,
        createdAt: serverTimestamp(),
        });

      Toast.show({
        type: "success",
        text1: "Exam entered",
        position: "top",
      });

      fetchBloodTests();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Save error",
        text2: err.message,
      });
    }
  };

  const last = bloodTests[0];

  return (
  <View style={styles.container}>
      <LinearGradient
        colors={["#F98C9D", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
        />

        <View style={styles.mainHeader}>
        <View style={styles.iconWrapper}>
            <Ionicons name="water" size={48} color={Colors.red} />
        </View>
        <Text style={FontStyles.variants.mainTitle}>Blood Test Monitoring</Text>
        <Text style={FontStyles.variants.sectionTitle}>Monitor your antibody levels</Text>
        </View>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>

        {[
        { key: "antiAChR", label: "anti-AChR", icon: "flask" },
        { key: "antiMuSK", label: "anti-MuSK", icon: "beaker" },
        { key: "antiLRP4", label: "anti-LRP4", icon: "flask" },
        { key: "notes", label: "Notes (optional)", icon: "document-text" },
        ].map((item) => (
        <PressableScale
            key={item.key}
            onPress={() => setEditingField(item.key)}
            activeScale={0.96}
            weight="light"
            style={[
            styles.card,
            examData[item.key as keyof typeof examData] && styles.cardSelected,
            ]}
        >
        <View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name={item.icon as any} size={20} color={Colors.red} />
            <Text style={styles.cardLabel}>{item.label}</Text>
        </View>
        <Text style={styles.cardRightValue}>
            {examData[item.key as keyof typeof examData] || "Tap to enter"}
        </Text>
        </View>
        </PressableScale>
        ))}

        <Pressable onPress={handleSubmit} style={styles.reloadButton}>
          <Text style={styles.reloadText}>Save Exam</Text>
        </Pressable>

        <PressableScale
        onPress={toggleSection}
        activeScale={0.96}
        weight="light"
        >
        <View style={[styles.cardHeader, { marginBottom: 16 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="file-tray-full" size={20} color={Colors.red} />
            <Text style={styles.cardLabel}>Last exam recorded</Text>
        </View>
        <Ionicons
            name={open ? "chevron-up-outline" : "chevron-down-outline"}
            size={18}
            color={Colors.light3}
        />
        </View>
        </PressableScale>

      {open && last && (
        <View style={[styles.card, { marginTop: 8 }]}>
            <View style={styles.row}>
            <Ionicons name="calendar" size={18} color={Colors.red} style={{ marginRight: 10 }} />
            <Text style={styles.detailText}>Date: {new Date(last.createdAt.seconds * 1000).toLocaleDateString()}</Text>
            </View>

            <View style={styles.row}>
            <Ionicons name="flask" size={18} color={Colors.red} style={{ marginRight: 10 }} />
            <Text style={styles.detailText}>anti-AChR: {last.antiAChR}</Text>
            </View>

            <View style={styles.row}>
            <Ionicons name="beaker" size={18} color={Colors.red} style={{ marginRight: 10 }} />
            <Text style={styles.detailText}>anti-MuSK: {last.antiMuSK}</Text>
            </View>

            <View style={styles.row}>
            <Ionicons name="flask" size={18} color={Colors.red} style={{ marginRight: 10 }} />
            <Text style={styles.detailText}>anti-LRP4: {last.antiLRP4}</Text>
            </View>

            <View style={styles.row}>
            <Ionicons name="document-text" size={18} color={Colors.red} style={{ marginRight: 10 }} />
            <Text style={styles.detailText}>Notes: {last.notes || "—"}</Text>
            </View>
        </View>
        )}


      <Pressable onPress={fetchBloodTests} style={styles.reloadButton} disabled={loading}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <MotiView
            animate={{ rotate: loading ? "360deg" : "0deg" }}
            transition={{ loop: loading, type: "timing", duration: 1000 }}
            style={{ width: 20, height: 20 }}
          >
            <RefreshCw size={20} color="#fff" />
          </MotiView>
          <Text style={styles.reloadText}>Reload</Text>
        </View>
      </Pressable>

      <Toast />

      <Modal visible={!!editingField} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
            <Text style={styles.label}>
                {editingField === "notes" ? "Add notes" : `Insert value for ${editingField}`}
            </Text>
            <TextInput
                multiline={editingField === "notes"}
                style={styles.textArea}
                placeholder="Type here..."
                value={examData[editingField as keyof typeof examData]}
                onChangeText={(text) =>
                setExamData((prev) => ({ ...prev, [editingField!]: text }))
                }
            />
            <Pressable
                style={styles.saveButton}
                onPress={() => setEditingField(null)}
            >
                <Text style={styles.saveText}>Save</Text>
            </Pressable>
            </View>
        </View>
        </Modal>

    </ScrollView>
    <BottomNavigation />
  </View>
);
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f5ff" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", color: "#1f2937", marginBottom: 20 },
  cardHeader: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#1e40af", marginBottom: 8 },
  cardBody: {
    backgroundColor: "#fff",
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  reloadButton: {
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
  reloadText: {     
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600", 
  },
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
cardLabel: {
  fontSize: 16,
  fontWeight: "600",
  color: "#1C1C1E",
},
cardRightValue: {
  fontSize: 14,
  color: "#C7C7CC",
},
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.3)",
  justifyContent: "flex-end",
},
modalContent: {
  backgroundColor: "#FFFFFF",
  padding: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
},
textArea: {
  backgroundColor: "#F2F2F7",
  borderRadius: 12,
  padding: 12,
  fontSize: 15,
  marginBottom: 12,
},
  cardSelected: {
    borderColor: Colors.red,
    borderWidth: 2,
  },
    label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1C1C1E",
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
row: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  marginBottom: 8,
},
detailText: {
  fontSize: 14,
  color: "#1C1C1E",
  flexShrink: 1,
},

});

export default MonitoraggioClinicoSangue;
