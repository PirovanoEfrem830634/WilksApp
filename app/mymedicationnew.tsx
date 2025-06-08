import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { MoveRight, Pill } from "lucide-react-native";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import { Trash2 } from "lucide-react-native";
import BottomNavigation from "../app/bottomnavigationnew";
import * as Animatable from 'react-native-animatable';
import FontStyles from "../Styles/fontstyles";
import Colors from "../Styles/color";
import { PressableScale } from "react-native-pressable-scale";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, AlertCircle, Eye, Mic, Droplet, Wind, TrendingUp, Smile, Moon, Check, X, BriefcaseMedical } from "lucide-react-native";


type Medication = {
  id: string;
  name: string;
  dose: string;
  days: string[];
  times: string[];
};

export default function MyMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMedications = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const medsRef = collection(db, "users", user.uid, "medications");
      const snapshot = await getDocs(medsRef);

      console.log("[DEBUG] Firebase meds snapshot:", snapshot.docs);

      const meds = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("[DEBUG] Single doc:", data);
        return {
          id: doc.id,
          name: data.name || "",
          dose: data.dose || "",
          days: Array.isArray(data.days) ? data.days : [],
          times: Array.isArray(data.times) ? data.times : [],
        };
      });

      console.log("[DEBUG] Parsed medications:", meds);
      setMedications(meds);
    };

    fetchMedications();
  }, []);

  const handleDelete = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    await deleteDoc(doc(db, "users", user.uid, "medications", id));
    setMedications((prev) => prev.filter((med) => med.id !== id));
  };

  const renderItem = ({ item }: { item: Medication }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Pill size={18} color={Colors.turquoise} />
            <Text
            style={[FontStyles.variants.bodySemibold, { flex: 1 }]}
            numberOfLines={1}
            ellipsizeMode="tail"
            >
            {item.name} ({item.dose})
            </Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash" size={18} color={Colors.red} />
        </TouchableOpacity>
    </View>
    <Text style={styles.sub}>
        <Text style={styles.sub}>Days:</Text> {item.days.join(", ")}
    </Text>
    <Text style={styles.sub}>
        <Text style={styles.sub}>Times:</Text> {item.times.join(", ")}
    </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#C2F0FF", "#F2F2F7"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
        />
      <View style={styles.mainHeader}>
        <View style={styles.iconWrapper}>
            <BriefcaseMedical size={48} color={Colors.turquoise}  />
        </View>
        <Text style={FontStyles.variants.mainTitle}>My Medications</Text>
        <Text style={FontStyles.variants.sectionTitle}>Keep track of your current prescriptions</Text>
      </View>

      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/addmedication")}
      >
        <Text style={styles.addButtonText}>+ Add Medication</Text>
      </TouchableOpacity>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 5,
  },
  sub: {
    color: Colors.secondary,
  },
  addButton: {
    backgroundColor: Colors.blue,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    margin: 20,
    marginBottom: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 17,
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
});
