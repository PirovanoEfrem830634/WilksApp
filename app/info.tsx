import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  TextInput,
} from "react-native";
import { ChevronDown, ChevronUp, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import BottomNavigation from "../app/BottomNavigation";
import * as Animatable from "react-native-animatable";


if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const symptoms = [
  {
    key: "debolezzaMuscolare",
    emoji: "💪",
    title: "Muscle Weakness",
    description:
      "Muscle weakness in Myasthenia Gravis results from impaired nerve-muscle communication. It worsens with use and improves with rest.",
    actions: [
      "Avoid overexertion and heavy lifting",
      "Take frequent rest breaks",
      "Notify your neurologist if symptoms worsen",
    ],
  },
  {
    key: "disfagia",
    emoji: "🥄",
    title: "Swallowing Difficulty",
    description:
      "Swallowing issues (dysphagia) can impact nutrition and pose a risk of aspiration.",
    actions: [
      "Eat soft foods in small bites",
      "Avoid lying down after meals",
      "Consult a speech therapist if needed",
    ],
  },
  {
    key: "disartria",
    emoji: "🗣️",
    title: "Speech Difficulty",
    description:
      "Speech may become slurred or nasal during periods of fatigue.",
    actions: [
      "Speak slowly and clearly",
      "Pause frequently to rest",
      "Inform your specialist if symptoms persist",
    ],
  },
  {
    key: "ptosi",
    emoji: "👁️",
    title: "Ptosis (Drooping Eyelids)",
    description:
      "Ptosis is often one of the earliest signs of Myasthenia Gravis, especially noticeable in the evening.",
    actions: [
      "Try elevating your head when resting",
      "Use cooling compresses to relieve fatigue",
      "Track progression with daily photos",
    ],
  },
  {
    key: "diplopia",
    emoji: "👓",
    title: "Double Vision",
    description:
      "Double vision (diplopia) may come and go depending on muscle fatigue.",
    actions: [
      "Avoid reading or screens during flare-ups",
      "Use an eye patch alternately on each eye",
      "Discuss corrective lenses with your eye doctor",
    ],
  },
  {
    key: "difficoltaRespiratorie",
    emoji: "🌬️",
    title: "Breathing Difficulties",
    description:
      "Respiratory weakness can become serious and requires immediate attention if it worsens.",
    actions: [
      "Sit upright to facilitate breathing",
      "Avoid environments with poor air quality",
      "Seek emergency care if breathing becomes labored",
    ],
  },
];

export default function SymptomInfo() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggleCard = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === key ? null : key);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredSymptoms = symptoms.filter((symptom) =>
    symptom.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.wrapper}>
      <Animatable.View animation="fadeInUp" duration={500} style={styles.scrollWrapper}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
          <Text style={styles.pageTitle}>🧠 Symptoms Infos</Text>
          <Text style={styles.subtitle}>
            Tap on each item to learn what you can do.
          </Text>
        </Animated.View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search a symptom..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#888"
          />
        </View>

        {filteredSymptoms.map((symptom) => {
          const isExpanded = expanded === symptom.key;
          return (
            <Animated.View key={symptom.key} style={{ opacity: fadeAnim }}>
              <Pressable
                onPress={() => toggleCard(symptom.key)}
                style={[styles.card, isExpanded && styles.cardExpanded]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconTitleContainer}>
                    <Text style={styles.emoji}>{symptom.emoji}</Text>
                    <Text style={styles.cardTitle}>{symptom.title}</Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={22} color="#2C3E50" />
                  ) : (
                    <ChevronDown size={22} color="#2C3E50" />
                  )}
                </View>
                <Text style={styles.description}>{symptom.description}</Text>
                {isExpanded && (
                  <View style={styles.actionContainer}>
                    <Text style={styles.actionTitle}>What You Can Do:</Text>
                    {symptom.actions.map((item, idx) => (
                      <Text key={idx} style={styles.actionItem}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
      </Animatable.View>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#5D6D7E",
    textAlign: "center",
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardExpanded: {
    backgroundColor: "#EAF4FC",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emoji: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2C3E50",
  },
  description: {
    fontSize: 15,
    color: "#34495E",
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 10,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E50",
    marginTop: 5,
    marginBottom: 4,
  },
  actionItem: {
    fontSize: 14,
    color: "#2C3E50",
    marginLeft: 8,
    marginBottom: 4,
  },
  scrollWrapper: {
  flex: 1,
  },
});
