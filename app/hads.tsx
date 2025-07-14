import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Animated
} from "react-native";
import { auth, db } from "../firebaseconfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import * as Animatable from "react-native-animatable";
import BottomNavigation from "./bottomnavigationnew";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { PressableScale } from "react-native-pressable-scale";
import { Ionicons } from "@expo/vector-icons";

const hadsQuestions = [
  { label: "I feel tense or 'wound up'", type: "anxiety" },
  { label: "I still enjoy the things I used to enjoy", type: "depression" },
  { label: "I get a sort of frightened feeling as if something awful is about to happen", type: "anxiety" },
  { label: "I can laugh and see the funny side of things", type: "depression" },
  { label: "Worrying thoughts go through my mind", type: "anxiety" },
  { label: "I feel cheerful", type: "depression" },
  { label: "I can sit at ease and feel relaxed", type: "anxiety" },
  { label: "I feel as if I am slowed down", type: "depression" },
  { label: "I get a sort of frightened feeling like 'butterflies' in the stomach", type: "anxiety" },
  { label: "I have lost interest in my appearance", type: "depression" },
  { label: "I feel restless as if I have to be on the move", type: "anxiety" },
  { label: "I look forward with enjoyment to things", type: "depression" },
  { label: "I get sudden feelings of panic", type: "anxiety" },
  { label: "I can enjoy a good book or radio or TV program", type: "depression" },
];

export default function HADSSurvey() {
  const [answers, setAnswers] = useState<number[]>(Array(14).fill(0));
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(null));
  };

  const handleAnswer = (index: number, value: number) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const saveSurvey = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      showToast("❌ User not logged in");
      return;
    }

    const anxietyScore = hadsQuestions.reduce(
      (sum, q, i) => q.type === "anxiety" ? sum + answers[i] : sum,
      0
    );

    const depressionScore = hadsQuestions.reduce(
      (sum, q, i) => q.type === "depression" ? sum + answers[i] : sum,
      0
    );

    const docRef = doc(db, `users/${uid}/clinical_surveys/hads`);
    try {
      await setDoc(docRef, {
        lastCompiledAt: Timestamp.now(),
        responses: {
          answers,
          anxietyScore,
          depressionScore,
          totalScore: anxietyScore + depressionScore,
        },
      });
      showToast("✅ HADS survey saved successfully");
    } catch (err: any) {
      showToast("❌ Error: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInUp" duration={600} style={{ flex: 1 }}>
        <LinearGradient
          colors={["#FFD6DA", Colors.light1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBackground}
        />
        <View style={styles.mainHeader}>
          <Ionicons name="sad" size={48} color={Colors.red} style={{ marginBottom: 10 }} />
          <Text style={FontStyles.variants.mainTitle}>HADS Survey</Text>
          <Text style={FontStyles.variants.sectionTitle}>
            Rate how you felt in the past week
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {hadsQuestions.map((q, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.questionRow}>
                <Ionicons
                  name={q.type === "anxiety" ? "alert-circle" : "cloudy-night"}
                  size={18}
                  color={Colors.red}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.questionText}>{q.label}</Text>
              </View>
              <View style={styles.optionRow}>
                {[0, 1, 2, 3].map((val) => (
                  <PressableScale
                    key={val}
                    onPress={() => handleAnswer(index, val)}
                    weight="light"
                    activeScale={0.95}
                    style={[
                      styles.option,
                      answers[index] === val && styles.optionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        answers[index] === val && styles.optionTextSelected,
                      ]}
                    >
                      {val}
                    </Text>
                  </PressableScale>
                ))}
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.submitButton} onPress={saveSurvey}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animatable.View>
          {toastMessage && (
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 60,
            left: 20,
            right: 20,
            backgroundColor: Colors.red,
            padding: 14,
            borderRadius: 16,
            alignItems: "center",
            zIndex: 10,
            opacity: toastAnim,
            transform: [
              {
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-60, 0],
                }),
              },
            ],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          },
        ]}
      >
        <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
          {toastMessage}
        </Text>
      </Animated.View>
    )}
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light1,
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    zIndex: -1,
  },
  scrollView: {
    padding: 20,
    paddingBottom: 100,
  },
  mainHeader: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray1,
    flexShrink: 1,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  option: {
    backgroundColor: Colors.light2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    flex: 1,
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: Colors.red,
  },
  optionText: {
    color: Colors.gray1,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: Colors.red,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
