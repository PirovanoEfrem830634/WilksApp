import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";

// Types minimi (se li hai già in infosheets.ts puoi importarli da lì)
export type InfoSection = { title: string; bullets?: string[]; body?: string };
export type InfoAction = { label: string; type: "tel" | "url" | "sheet"; value: string };
export type InfoSheet = {
  slug: string;
  title: string;
  subtitle?: string;
  icon: string;
  tint?: string;
  chips?: string[];
  sections: InfoSection[];
  actions?: InfoAction[];
  updatedAt?: string;
};

function addAlpha(hex: string, alpha: number) {
  const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
  return `${hex}${a}`;
}

// Mini-renderer per **bold**
function MarkdownText({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <Text style={styles.bulletText}>
      {parts.map((p, i) => (
        <Text
          key={i}
          style={i % 2 === 1 ? { fontFamily: FontStyles.weight.semibold } : undefined}
        >
          {p}
        </Text>
      ))}
    </Text>
  );
}

type Props = {
  sheet: InfoSheet;
  onClose: () => void;
};

export default function InfoSheetDetailView({ sheet, onClose }: Props) {
  const tint = sheet.tint ?? Colors.blue;

  const handleAction = (type: string, value: string) => {
    if (type === "tel") Linking.openURL(`tel:${value}`);
    else if (type === "url") Linking.openURL(value);
    else Alert.alert("Azione", value);
  };

  return (
    <View style={styles.overlay}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Gradient */}
        <LinearGradient
          colors={["#EBC9FB", Colors.light1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBackground}
        />

        {/* Header */}
        <View style={styles.headerWrap}>
          <Pressable onPress={onClose} style={styles.backBtn} accessibilityRole="button">
            <Ionicons name="chevron-back" size={22} color={Colors.gray1} />
          </Pressable>

          <View style={styles.iconHero}>
            <Ionicons name={(sheet.icon as any) ?? "document-text"} size={48} color={tint} />
          </View>

          <Text style={FontStyles.variants.mainTitle}>{sheet.title}</Text>
          {!!sheet.subtitle && (
            <Text style={[FontStyles.variants.sectionTitle, { textAlign: "center" }]}>
              {sheet.subtitle}
            </Text>
          )}

          {!!sheet.chips?.length && (
            <View style={styles.pillsRow}>
              {sheet.chips.map((c) => (
                <View key={c} style={styles.pill}>
                  <Text style={styles.pillText}>{c}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Contenuti */}
        {sheet.sections.map((sec, idx) => (
          <Animatable.View key={idx} animation="fadeInUp" delay={80 + idx * 40} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>

            {!!sec.body && <Text style={styles.sectionBody}>{sec.body}</Text>}

            {!!sec.bullets && (
              <View style={{ marginTop: 8 }}>
                {sec.bullets.map((b, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Ionicons name="ellipse" size={6} color={Colors.gray3} style={{ marginTop: 7, marginRight: 8 }} />
                    <MarkdownText text={b} />
                  </View>
                ))}
              </View>
            )}
          </Animatable.View>
        ))}

        {!!sheet.actions?.length && (
          <View style={{ marginTop: 6, marginHorizontal: 20 }}>
            {sheet.actions.map((a, i) => (
              <Pressable
                key={`${a.label}-${i}`}
                onPress={() => handleAction(a.type, a.value)}
                style={[styles.actionBtn, { borderColor: tint }]}
              >
                <Text style={[styles.actionText, { color: tint }]}>{a.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={tint} />
              </Pressable>
            ))}
          </View>
        )}

        {!!sheet.updatedAt && (
          <Text style={styles.updateText}>Ultimo aggiornamento: {sheet.updatedAt}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Colors.light1, zIndex: 1000 },
  gradientBackground: { position: "absolute", top: 0, left: 0, right: 0, height: 160, zIndex: -1 },
  headerWrap: { alignItems: "center", marginTop: 32, marginBottom: 12, paddingHorizontal: 20 },
  backBtn: { position: "absolute", left: 16, top: 8, padding: 6, borderRadius: 10 },
  iconHero: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  pillsRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  pill: { backgroundColor: Colors.light2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: { fontFamily: FontStyles.weight.semibold, fontSize: 12, color: Colors.gray2 },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 10, elevation: 2,
  },
  sectionTitle: { fontFamily: FontStyles.weight.semibold, fontSize: FontStyles.size.md, color: Colors.gray1 },
  sectionBody: { fontFamily: FontStyles.weight.regular, fontSize: FontStyles.size.base, color: Colors.gray1, marginTop: 6 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  bulletText: { fontFamily: FontStyles.weight.regular, fontSize: FontStyles.size.base, color: Colors.gray1, flex: 1 },
  actionBtn: {
    marginTop: 10, padding: 12, borderRadius: 14, borderWidth: 1.5,
    backgroundColor: Colors.white, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  actionText: { fontFamily: FontStyles.weight.semibold, fontSize: FontStyles.size.base },
  updateText: { fontFamily: FontStyles.weight.regular, fontSize: FontStyles.size.sm, color: Colors.gray3, textAlign: "center", marginTop: 10, marginBottom: 10 },
});
