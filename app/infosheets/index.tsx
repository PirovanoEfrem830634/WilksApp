import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "../../Styles/color";
import FontStyles from "../../Styles/fontstyles";
import BottomNavigation from "../../components/bottomnavigationnew";
import { INFO_SHEETS, InfoSheet } from "../../infosheets";
import InfoSheetDetailView from "../../components/InfoSheetDetailView";

export default function InfoSheetsIndex() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<InfoSheet | null>(null);

  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);
  const tabbarHeight = 56 + bottomPad;
  const scrollBottomPadding = tabbarHeight + 28;

  const filtered: InfoSheet[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INFO_SHEETS;
    return INFO_SHEETS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.subtitle?.toLowerCase().includes(q) ?? false) ||
        (s.chips?.some((c) => c.toLowerCase().includes(q)) ?? false)
    );
  }, [query]);

  return (
    <View style={styles.container}>
      {/* ✅ Gradient senza zIndex (pattern SleepTracking / SymptomInfo) */}
      <LinearGradient
        pointerEvents="none"
        colors={["#EBC9FB", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { height: 180 }]}
      />

      {/* ✅ HEADER FISSO */}
      <View style={styles.mainHeader}>
        <View style={styles.iconWrapper}>
          <Ionicons name="reader-outline" size={48} color={Colors.indigo} />
        </View>

        <Text style={FontStyles.variants.mainTitle}>Schede informative</Text>

        <Text
          style={[
            FontStyles.variants.sectionTitle,
            { textAlign: "center", alignSelf: "center" },
          ]}
        >
          Buone pratiche MG
        </Text>
      </View>

      {/* ✅ CONTENUTO SCROLL */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.gray3} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cerca per titolo o tag…"
            placeholderTextColor={Colors.gray3}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        {/* Lista */}
        {filtered.map((item, i) => (
          <Animatable.View
            key={item.slug}
            animation="fadeInUp"
            delay={80 + i * 40}
            style={styles.card}
          >
            <Pressable
              onPress={() => setSelected(item)}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View style={styles.leading}>
                <Ionicons
                  name={(item.icon as any) ?? "document-text"}
                  size={20}
                  color={item.tint ?? Colors.blue}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>

                {!!item.subtitle && (
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                )}

                {!!item.chips?.length && (
                  <View style={styles.chipsRow}>
                    {item.chips.map((c) => (
                      <View key={c} style={styles.chip}>
                        <Text style={styles.chipText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.light3}
              />
            </Pressable>
          </Animatable.View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search" size={22} color={Colors.gray3} />
            <Text style={styles.emptyText}>Nessuna scheda trovata</Text>
          </View>
        )}
      </ScrollView>

      {/* Overlay full-screen per il dettaglio */}
      {selected && (
        <InfoSheetDetailView sheet={selected} onClose={() => setSelected(null)} />
      )}

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light1 },

  // header fisso
  mainHeader: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  iconWrapper: { borderRadius: 60, padding: 5, marginBottom: 10 },

  // contenuto scroll
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray1,
    fontFamily: "SFProDisplay-Regular",
    paddingVertical: 0,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light2, // ✅ fisso
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 2,
  },
  leading: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontFamily: FontStyles.weight.semibold,
    fontSize: FontStyles.size.md,
    color: Colors.gray1,
  },
  cardSubtitle: { ...FontStyles.variants.cardDescription, marginTop: 2 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: {
    backgroundColor: Colors.light2,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    fontFamily: FontStyles.weight.semibold,
    fontSize: 11,
    color: Colors.gray2,
  },

  empty: { marginTop: 32, alignItems: "center", gap: 8 },
  emptyText: {
    fontFamily: FontStyles.weight.regular,
    fontSize: FontStyles.size.base,
    color: Colors.gray3,
  },
});
