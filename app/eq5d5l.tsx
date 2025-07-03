import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
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

const dimensions = [
  { label: "Mobility", icon: "walk" },
  { label: "Self-care", icon: "body" },
  { label: "Usual activities", icon: "briefcase" },
  { label: "Pain/Discomfort", icon: "alert-circle" },
  { label: "Anxiety/Depression", icon: "sad" },
];

export default function EQ5D5LSurvey() {
  const [answers, setAnswers] = useState<number[]>(Array(5).fill(1));
  const [vasScore, setVasScore] = useState<string>("");

  const handleAnswer = (index: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const saveSurvey = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    if (!vasScore || isNaN(Number(vasScore)) || Number(vasScore) < 0 || Number(vasScore) > 100) {
      Alert.alert("Invalid VAS", "Please enter a valid number between 0 and 100.");
      return;
    }

    const docRef = doc(db, `users/${uid}/clinical_surveys/eq5d5l`);
    try {
      await setDoc(docRef, {
        lastCompiledAt: Timestamp.now(),
        responses: {
          mobility: answers[0],
          selfCare: answers[1],
          usualActivities: answers[2],
          painDiscomfort: answers[3],
          anxietyDepression: answers[4],
          vasScore: Number(vasScore),
        },
      });
      Alert.alert("Success", "Survey saved successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInUp" duration={600} style={{ flex: 1 }}>
        <LinearGradient
          colors={["#FFD6BA", Colors.light1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBackground}
        />

        <View style={styles.mainHeader}>
          <Ionicons name="fitness" size={48} color={Colors.orange} style={{ marginBottom: 10 }} />
          <Text style={FontStyles.variants.mainTitle}>EQ-5D-5L</Text>
          <Text style={FontStyles.variants.sectionTitle}>
            Indicate your current health status
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollView}>
          {dimensions.map((dim, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.questionRow}>
                <Ionicons name={dim.icon as any} size={18} color={Colors.orange} style={{ marginRight: 8 }} />
                <Text style={styles.questionText}>{dim.label}</Text>
              </View>
              <View style={styles.optionRow}>
                {[1, 2, 3, 4, 5].map((val) => (
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

          <View style={styles.card}>
            <View style={styles.questionRow}>
              <Ionicons name="speedometer" size={18} color={Colors.orange} style={{ marginRight: 8 }} />
              <Text style={styles.questionText}>VAS Score (0–100)</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter a number"
              keyboardType="numeric"
              maxLength={3}
              value={vasScore}
              onChangeText={setVasScore}
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={saveSurvey}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animatable.View>
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
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  option: {
    backgroundColor: Colors.light2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 6,
    marginHorizontal: 4,
    flex: 1,
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: Colors.orange,
  },
  optionText: {
    color: Colors.gray1,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#fff",
  },
  input: {
    backgroundColor: Colors.light2,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.gray1,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: Colors.orange,
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
