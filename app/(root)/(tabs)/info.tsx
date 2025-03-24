import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, LayoutAnimation, Platform, UIManager, Animated, TextInput } from "react-native";
import { Activity, Eye, Wind, ChevronsDown, DivideCircle, Mic, ChevronDown, ChevronUp, Home, User, Search } from "lucide-react-native";
import { useRouter } from "expo-router";

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const symptoms = [
  {
    key: "debolezzaMuscolare",
    icon: <Activity size={28} color="#2C3E50" />,
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
    icon: <ChevronsDown size={28} color="#2C3E50" />,
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
    icon: <Mic size={28} color="#2C3E50" />,
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
    icon: <Eye size={28} color="#2C3E50" />,
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
    icon: <DivideCircle size={28} color="#2C3E50" />,
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
    icon: <Wind size={28} color="#2C3E50" />,
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
  const router = useRouter();
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
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentInsetAdjustmentBehavior="never">
        <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}> 
          <Text style={styles.pageTitle}>Understand Your Symptoms</Text>
          <Text style={styles.subtitle}>Tap on each item to learn what it means and what you can do.</Text>
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
                    {symptom.icon}
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
                      <Text key={idx} style={styles.actionItem}>• {item}</Text>
                    ))}
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <Pressable onPress={() => router.push("/")} style={styles.navButton}>
          <Home size={24} color="#007AFF" />
          <Text style={styles.navText}>Home</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/tracking")} style={styles.navButton}>
          <Activity size={24} color="#007AFF" />
          <Text style={styles.navText}>Tracking</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/profile")} style={styles.navButton}>
          <User size={24} color="#007AFF" />
          <Text style={styles.navText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 25,
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
    borderRadius: 10,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardExpanded: {
    backgroundColor: "#EDF6FF",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  iconTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
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
    fontSize: 16,
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
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
  },
  navButton: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 4,
  },
});