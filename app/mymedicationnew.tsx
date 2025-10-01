// MyMedications.tsx (paziente: sola lettura, niente add/delete)
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Pill, Clock3, CalendarDays, BriefcaseMedical, Lock } from "lucide-react-native";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import BottomNavigation from "../app/bottomnavigationnew";
import * as Animatable from "react-native-animatable";
import FontStyles from "../Styles/fontstyles";
import Colors from "../Styles/color";
import { LinearGradient } from "expo-linear-gradient";

type Medication = {
  id: string;
  name: string;
  dose: string;
  days: string[];   // es. ["Lun","Mar","Mer"] oppure ["Mon","Tue","Wed"]
  times: string[];  // es. ["08:00","13:30"]
  createdAt?: any;
};

type NextDoseInfo = {
  date: Date | null;
  minutesDiff: number | null; // minuti da "adesso" (>=0)
  label: string;              // es. "in 25 min", "tra 2 h", "domani 08:00"
  tone: "red" | "orange" | "blue" | "gray";
};

// ---------- Utils ----------
const DAY_MAP: Record<string, number> = {
  dom: 0, domenica: 0, sunday: 0, sun: 0,
  lun: 1, lunedi: 1, lunedì: 1, monday: 1, mon: 1,
  mar: 2, martedi: 2, martedì: 2, tuesday: 2, tue: 2,
  mer: 3, mercoledi: 3, mercoledì: 3, wednesday: 3, wed: 3,
  gio: 4, giovedì: 4, giovedi: 4, thursday: 4, thu: 4,
  ven: 5, venerdì: 5, venerdi: 5, friday: 5, fri: 5,
  sab: 6, sabato: 6, saturday: 6, sat: 6,
};
const WEEK_LABELS = ["D", "L", "M", "M", "G", "V", "S"]; // IT compact (Dom→Sab)

const toDayIndex = (d: string): number | null => {
  const k = (d || "").trim().toLowerCase();
  return DAY_MAP[k] ?? null;
};

const parseTimeToday = (hhmm: string, base: Date) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec((hhmm || "").trim());
  if (!m) return null;
  const d = new Date(base);
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return isNaN(d.getTime()) ? null : d;
};

const minutesBetween = (a: Date, b: Date) =>
  Math.round((b.getTime() - a.getTime()) / 60000);

const fmtLabel = (target: Date, now: Date) => {
  const mins = minutesBetween(now, target);
  if (mins < 60) return `in ${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (mins < 24 * 60) return rem ? `tra ${hrs} h ${rem} m` : `tra ${hrs} h`;
  // >= 24h → mostra giorno e ora
  const pad = (n: number) => String(n).padStart(2, "0");
  const days = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  return `${days[target.getDay()]} ${pad(target.getHours())}:${pad(target.getMinutes())}`;
};

const computeNextDose = (days: string[], times: string[]): NextDoseInfo => {
  const now = new Date();
  const activeIdx = new Set<number>();
  (days || []).forEach((d) => {
    const idx = toDayIndex(d);
    if (idx !== null) activeIdx.add(idx);
  });

  // Se non ci sono giorni definiti, consideriamo "tutti i giorni"
  const considerAllDays = activeIdx.size === 0;

  // Cerca la prossima occorrenza entro 7 giorni
  for (let add = 0; add < 7; add++) {
    const cand = new Date(now);
    cand.setDate(now.getDate() + add);
    const dayOk = considerAllDays || activeIdx.has(cand.getDay());
    if (!dayOk) continue;

    // ordina gli orari, poi trova il primo >= adesso (se oggi), altrimenti il primo
    const sortedTimes = [...(times || [])].sort();
    for (const t of sortedTimes) {
      const occ = parseTimeToday(t, cand);
      if (!occ) continue;
      if (occ.getTime() >= now.getTime()) {
        const mins = minutesBetween(now, occ);
        let tone: NextDoseInfo["tone"] = "gray";
        if (mins <= 5) tone = "red";
        else if (mins <= 30) tone = "orange";
        else if (mins <= 120) tone = "blue";
        return { date: occ, minutesDiff: mins, label: fmtLabel(occ, now), tone };
      }
    }
  }
  // Nessuna prossima dose trovata
  return { date: null, minutesDiff: null, label: "Nessun orario", tone: "gray" };
};

// ---------- Component ----------
export default function MyMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const medsRef = collection(db, "users", user.uid, "medications");
    const q = query(medsRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const meds = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data?.name || "",
            dose: data?.dose || "",
            days: Array.isArray(data?.days) ? data.days : [],
            times: Array.isArray(data?.times) ? data.times : [],
            createdAt: data?.createdAt,
          } as Medication;
        });
        setMedications(meds);
      },
      (err) => console.error("onSnapshot medications:", err)
    );
    return () => unsub();
  }, []);

  // Ordina per “prossima dose” imminente (poi fallback createdAt)
  const ordered = useMemo(() => {
    const withNext = medications.map((m) => ({ m, next: computeNextDose(m.days, m.times) }));
    withNext.sort((a, b) => {
      // prima chi ha una prossima dose definita
      if (a.next.date && !b.next.date) return -1;
      if (!a.next.date && b.next.date) return 1;
      if (a.next.date && b.next.date) {
        return (a.next.date.getTime() - b.next.date.getTime());
      }
      // fallback
      return 0;
    });
    return withNext.map((x) => x.m);
  }, [medications]);

  const renderDayBar = (days: string[]) => {
    const active = new Set<number>();
    days?.forEach((d) => {
      const idx = toDayIndex(d);
      if (idx !== null) active.add(idx);
    });
    const all = active.size === 0; // nessun giorno → tutti
    return (
      <View style={styles.weekRow}>
        {WEEK_LABELS.map((lbl, idx) => (
          <View
            key={idx}
            style={[
              styles.weekDot,
              (all || active.has(idx)) && styles.weekDotActive,
            ]}
          >
            <Text style={[
              styles.weekDotText,
              (all || active.has(idx)) && styles.weekDotTextActive,
            ]}>
              {lbl}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Medication }) => {
    const next = computeNextDose(item.days, item.times);

    const toneStyle =
      next.tone === "red" ? styles.badgeRed
      : next.tone === "orange" ? styles.badgeOrange
      : next.tone === "blue" ? styles.badgeBlue
      : styles.badgeGray;

    return (
      <Animatable.View animation="fadeInUp" duration={350} style={styles.card}>
        <View style={styles.cardHeader}>
          <Pill size={18} color={Colors.turquoise} />
          <Text
            style={[FontStyles.variants.bodySemibold, { flex: 1 }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.name} — {item.dose}
          </Text>
          {/* Nessuna azione: sola lettura */}
        </View>

        {/* Prossima dose */}
        <View style={styles.row}>
          <Clock3 size={16} color={Colors.secondary} />
          <Text style={styles.label}>Prossima dose</Text>
          <View style={[styles.badge, toneStyle]}>
            <Text style={styles.badgeText}>{next.label}</Text>
          </View>
        </View>

        {/* Orari del giorno (chips) */}
        {item.times?.length > 0 ? (
          <View style={styles.timesRow}>
            {item.times.map((t) => (
              <View key={t} style={styles.timeChip}>
                <Text style={styles.timeChipText}>{t}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.sub}>Nessun orario impostato</Text>
        )}

        {/* Calendario settimanale compatto */}
        <View style={[styles.row, { marginTop: 8 }]}>
          <CalendarDays size={16} color={Colors.secondary} />
          <Text style={styles.label}>Giorni</Text>
        </View>
        {renderDayBar(item.days)}
      </Animatable.View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyWrap}>
      <Lock size={28} color={Colors.secondary} />
      <Text style={[FontStyles.variants.sectionTitle, { textAlign: "center", marginTop: 8 }]}>
        I farmaci sono gestiti dal clinico
      </Text>
      <Text style={[styles.sub, { textAlign: "center", marginTop: 6 }]}>
        Le terapie vengono caricate e aggiornate dal tuo medico.{"\n"}
        Se qualcosa non ti torna, contatta il centro di riferimento.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#C2F0FF", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
      />

      <View style={styles.mainHeader}>
        <View style={styles.iconWrapper}>
          <BriefcaseMedical size={48} color={Colors.turquoise} />
        </View>
        <Text style={FontStyles.variants.mainTitle}>My Medications</Text>
        <Text style={FontStyles.variants.sectionTitle}>
          Piano terapeutico in sola lettura
        </Text>
      </View>

      <FlatList
        data={ordered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        ListEmptyComponent={<EmptyState />}
      />

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light1 },
  gradientBackground: {
    position: "absolute", top: 0, left: 0, right: 0, height: 160, zIndex: -1,
  },
  mainHeader: { alignItems: "center", marginTop: 32, marginBottom: 12, paddingHorizontal: 20 },
  iconWrapper: { borderRadius: 60, padding: 5, marginBottom: 10 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  label: { color: Colors.secondary, fontSize: 13 },

  sub: { color: Colors.secondary },

  // badge prossima dose
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: Colors.white, fontWeight: "600", fontSize: 12 },
  badgeRed: { backgroundColor: Colors.red },
  badgeOrange: { backgroundColor: Colors.orange },
  badgeBlue: { backgroundColor: Colors.blue },
  badgeGray: { backgroundColor: Colors.gray1 },

  // times chips
  timesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  timeChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    backgroundColor: Colors.light2 || "#F2F4F7",
  },
  timeChipText: { fontSize: 13, color: Colors.gray1 || "#111" },

  // settimana compatta
  weekRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  weekDot: {
    width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  weekDotActive: { backgroundColor: "#E6FAFF" },
  weekDotText: { fontSize: 12, color: Colors.secondary },
  weekDotTextActive: { fontWeight: "700", color: Colors.turquoise },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 12,
  },
});
