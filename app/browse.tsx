import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput } from "react-native";
import { Link, useRouter } from "expo-router";
import FontStyles from "../Styles/fontstyles";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "../components/bottomnavigationnew";
import Colors from "../Styles/color";
import Toast from "react-native-toast-message";
import PressableScaleWithRef from "../components/PressableScaleWithRef";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

/* Import PDF Function */
import { generateMonthlyPDF } from "../utils/generateMonthlyPDF";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseconfig";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
/* End Of Import PDF Function */

type BrowseSection = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  href?: string;
  onPress?: () => void;
  disabled?: boolean;
};

export default function Browse() {
  const insets = useSafeAreaInsets();

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
        const q = query(
          ref,
          where("createdAt", ">=", startTimestamp),
          where("createdAt", "<=", endTimestamp)
        );
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

  const sections: BrowseSection[] = [
    { label: "Lavoro e impatto sociale", icon: "briefcase", color: Colors.red, href: "/WorkStatusScreen" },
    { label: "Monitoraggio alimentazione", icon: "nutrition", color: Colors.orange, href: "/diettrackernew" },
    { label: "Piano terapeutico", icon: "newspaper", color: Colors.yellow, href: "/TherapyPlanCurrentScreen" },
    { label: "Monitoraggio del sonno", icon: "bed", color: Colors.green, href: "/sleeptrackingnew" },
    { label: "Storico Miastenia Gravis", icon: "pulse", color: Colors.turquoise, href: "/HistoryMgScreen" },
    { label: "Monitoraggio sintomi", icon: "analytics", color: Colors.blue, href: "/trackingnew" },
    { label: "Farmaci Prescritti", icon: "medkit", color: Colors.turquoise, href: "/mymedicationnew" },
    { label: "Calendario dei sintomi", icon: "calendar", color: Colors.pink, href: "/trackinghistorynew" },
    { label: "Informazioni sui sintomi", icon: "information-circle", color: Colors.purple, href: "/infonew" },
    { label: "Schede informative", icon: "reader", color: Colors.indigo, href: "/infosheets" },

    // Se un giorno vuoi rimettere il PDF:
    // {
    //   label: "Riepilogo mensile (PDF)",
    //   icon: "document-text",
    //   color: Colors.yellow,
    //   onPress: generateAndDownloadPDF,
    //   disabled: generating,
    // },
  ];

  const filteredSections = sections.filter((section) =>
    section.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bottomPad = 56 + Math.max(insets.bottom, 10) + 18;

  return (
    <View style={styles.root}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <View style={styles.headerBleed}>
          <LinearGradient
            colors={[
              "rgba(125, 211, 252, 0.28)",
              "rgba(168, 85, 247, 0.18)",
              "rgba(94, 234, 212, 0.16)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFillObject} />

          <LinearGradient
            colors={[
              "rgba(242,242,247,0)",
              "rgba(242,242,247,0.65)",
              "rgba(242,242,247,1)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.headerFade}
            pointerEvents="none"
          />

          <SafeAreaView edges={["top"]} style={styles.headerSafe}>
            <View style={styles.headerInner}>
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={FontStyles.variants.mainTitle}>Esplora</Text>
                  <Text style={[styles.headerSubtitle, FontStyles.variants.bodySemibold]}>
                    Browse
                  </Text>
                </View>

                {/* Icona Apple-style (come Questionari) */}
                <View style={styles.headerIconRing}>
                  <LinearGradient
                    colors={[
                      "rgba(125, 211, 252, 0.65)",
                      "rgba(168, 85, 247, 0.55)",
                      "rgba(94, 234, 212, 0.55)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerIconRingGradient}
                  >
                    <View style={styles.headerIconGlass}>
                      <Ionicons name="grid-outline" size={18} color={Colors.blue} />
                    </View>
                  </LinearGradient>
                </View>
              </View>

              {/* Search (più compatta, iOS-like) */}
              <View style={styles.searchWrap}>
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={16} color={Colors.gray3} style={styles.searchIcon} />
                  <TextInput
                    placeholder="Cerca"
                    placeholderTextColor={Colors.gray3}
                    style={styles.searchInput}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    returnKeyType="search"
                  />
                  {searchTerm.length > 0 && (
                    <PressableScaleWithRef
                      onPress={() => setSearchTerm("")}
                      weight="light"
                      activeScale={0.96}
                      style={styles.clearInline}
                    >
                      <Ionicons name="close-circle" size={18} color={Colors.gray3} />
                    </PressableScaleWithRef>
                  )}
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>

      {/* LIST */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[FontStyles.variants.sectionTitle, { marginBottom: 12 }]}>
          Categorie di salute
        </Text>

        {filteredSections.map((item, index) =>
          item.href && !item.onPress ? (
            <Link href={item.href} asChild key={index}>
              <PressableScaleWithRef style={styles.card} weight="light" activeScale={0.96}>
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
              <Text style={FontStyles.variants.body}>
                {item.label === "Riepilogo mensile (PDF)" && generating ? "Generazione in corso..." : item.label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.light3} style={styles.chevron} />
            </PressableScaleWithRef>
          )
        )}

        {filteredSections.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="search" size={18} color={Colors.gray3} />
            <Text style={styles.emptyText}>Nessun risultato per “{searchTerm}”.</Text>
          </View>
        )}
      </ScrollView>

      <BottomNavigation />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light1 },

  // Header
  headerWrapper: { backgroundColor: Colors.light1 },
  headerBleed: {
    overflow: "hidden",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  headerSafe: { backgroundColor: "transparent" },
  headerInner: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerSubtitle: { marginTop: 6, fontSize: 16, color: Colors.gray3 },
  headerFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 44 },

  // Badge icon (come Questionari)
  headerIconRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },
  headerIconRingGradient: {
    flex: 1,
    borderRadius: 19,
    padding: 2,
  },
  headerIconGlass: {
    flex: 1,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Search (più compatta)
  searchWrap: { marginTop: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(242,242,247,0.9)", // iOS systemGray6
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray1,
    fontFamily: "SFProDisplay-Regular",
    paddingVertical: 0, // evita altezza extra su Android
  },
  clearInline: {
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },

  // Cards list (NO cerchio dietro le icone)
  card: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  icon: { marginRight: 12 },
  chevron: { marginLeft: "auto" },

  // Empty state
  emptyBox: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  emptyText: { flex: 1, fontSize: 13, color: Colors.gray3 },
});
