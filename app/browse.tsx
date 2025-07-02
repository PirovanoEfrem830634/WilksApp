import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import FontStyles from "../Styles/fontstyles";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "../app/bottomnavigationnew";
import Colors from "../Styles/color";
import { PressableScale } from "react-native-pressable-scale";
import { TextInput } from "react-native";
import { Image } from "react-native";
import Toast from "react-native-toast-message";
import PressableScaleWithRef from "../components/PressableScaleWithRef";


/* Import PDF Function */

import { generateMonthlyPDF } from "../utils/generateMonthlyPDF";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseconfig";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

/* End Of Import PDF Function */

export default function Browse() {
  const [searchTerm, setSearchTerm] = useState("");
  const [generating, setGenerating] = useState(false);
  const router = useRouter();

  const generateAndDownloadPDF = async () => {
    try {
      setGenerating(true);
      const uid = getAuth().currentUser?.uid;
      if (!uid) throw new Error("Utente non autenticato");

      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const startTimestamp = Timestamp.fromDate(start);
      const endTimestamp = Timestamp.fromDate(end);

      const collections = ["blood_tests", "diet", "sleep", "symptoms", "medications"];
      const results: any = {};

      for (const col of collections) {
        const ref = collection(db, `users/${uid}/${col}`);
        const q = query(ref, where("createdAt", ">=", startTimestamp), where("createdAt", "<=", endTimestamp));
        const snapshot = await getDocs(q);
        results[col] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }

      await generateMonthlyPDF(results);

      Toast.show({
        type: "success",
        text1: "PDF generato!",
        text2: "Il riepilogo mensile è pronto.",
        position: "top",
      });
    } catch (err: any) {
      console.error("Errore PDF:", err);
      alert("Errore durante la generazione del PDF.");
    } finally {
      setGenerating(false);
    }
  };

  const sections: {
    label: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    color: string;
    href?: string;
    onPress?: () => void;
    disabled?: boolean;
  }[] = [
    { label: "Track", icon: "analytics", color: Colors.blue, href: "/trackingnew" },
    { label: "Tracking History", icon: "calendar", color: Colors.pink, href: "/trackinghistorynew" },
    { label: "Medications", icon: "medkit", color: Colors.turquoise, href: "/mymedicationnew" },
    { label: "Symptoms Infos", icon: "information-circle", color: Colors.purple, href: "/infonew" },
    { label: "Blood Monitoring", icon: "water", color: Colors.red, href: "/Bloodmonitoringnew" },
    { label: "Diet", icon: "nutrition", color: Colors.orange, href: "/diettrackernew" },
    { label: "Sleep", icon: "bed", color: Colors.green, href: "/sleeptrackingnew" },
    { label: "Weekly Dashboard", icon: "bar-chart", color: Colors.mint, href: "/weeklydashboard" },
    { label: "Monthly Recap PDF", icon: "document-text", color: Colors.yellow, onPress: generateAndDownloadPDF, disabled: generating, },
  ];

  const filteredSections = sections.filter((section) =>
    section.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerRow}>
          <Text style={FontStyles.variants.mainTitle}>Browse</Text>
          <Link href="/profilenew" asChild>
            <Image
              source={require("../assets/images/avatar-ios.jpg")}
              style={styles.avatar}
            />
          </Link>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Colors.gray3} style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            placeholderTextColor={Colors.gray3}
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <Text style={[FontStyles.variants.sectionTitle,{ marginBottom: 20 }]}>Health Categories</Text>

        {filteredSections.map((item, index) => (
          item.href && !item.onPress ? (
            <Link href={item.href} asChild key={index}>
              <PressableScaleWithRef 
                style={styles.card}
                weight="light"
                activeScale={0.96}>
                <Ionicons name={item.icon} size={20} color={item.color} style={styles.icon} />
                <Text style={FontStyles.variants.body}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.light3} style={styles.chevron} />
              </PressableScaleWithRef>
            </Link>
          ) : (
            <PressableScaleWithRef
              key={index}
              style={[styles.card, item.disabled && { opacity: 0.5 }]}
              weight="light"
              activeScale={0.96}
              onPress={item.disabled ? undefined : item.onPress}
            >
              <Ionicons name={item.icon} size={20} color={item.color} style={styles.icon} />
              {item.label === "Monthly Recap PDF" && generating ? (
                <Text style={[FontStyles.variants.body, { opacity: 0.6 }]}>Generazione in corso...</Text>
              ) : (
                <Text style={FontStyles.variants.body}>{item.label}</Text>
              )}
              <Ionicons name="chevron-forward" size={16} color={Colors.light3} style={styles.chevron} />
            </PressableScaleWithRef>
          )
        ))}
      </ScrollView>
      <BottomNavigation />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  icon: {
    marginRight: 12,
  },
  chevron: {
    marginLeft: "auto",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    marginTop: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray1,
    fontFamily: "SFProDisplay-Regular",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 30,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
