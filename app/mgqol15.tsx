import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { auth, db } from "../firebaseconfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import * as Animatable from "react-native-animatable";
import BottomNavigation from "../app/bottomnavigationnew";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { PressableScale } from "react-native-pressable-scale";
import { Ionicons } from "@expo/vector-icons";

const questions = [
  "I have trouble speaking",
  "I have trouble chewing",
  "I have trouble swallowing",
  "I have trouble breathing",
  "I have difficulty brushing teeth or combing hair",
  "I have difficulty standing from a chair",
  "I have double vision",
  "My eyelids droop",
  "I feel weak at the end of the day",
  "I avoid social activities because of MG",
  "I feel frustrated about my condition",
  "My physical abilities limit my daily activities",
  "I need help from others more often",
  "My condition limits my work or school performance",
  "I worry about my future because of MG",
];

export default function MGQoL15Survey() {
  const [answers, setAnswers] = useState<number[]>(Array(15).fill(0));

  const saveSurvey = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }
    const uid = user.uid;
    const docRef = doc(db, `users/${uid}/clinical_surveys/mg_qol15`);
    try {
      await setDoc(docRef, {
        answers,
        lastCompiledAt: Timestamp.now(),
      });
      Alert.alert("Success", "Survey saved successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleAnswer = (index: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInUp" duration={600} style={{ flex: 1 }}>
        <LinearGradient
          colors={["#EFD9FF", Colors.light1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBackground}
        />

        <View style={styles.mainHeader}>
          <Ionicons name="heart" size={48} color={Colors.purple} style={{ marginBottom: 10 }} />
          <Text style={FontStyles.variants.mainTitle}>MG-QoL15 Survey</Text>
          <Text style={FontStyles.variants.sectionTitle}>
            Indicate how much each statement applies to you
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollView}>
          {questions.map((question, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.questionText}>{question}</Text>
              <View style={styles.optionRow}>
                {[0, 1, 2, 3, 4].map((val) => (
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
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray1,
    marginBottom: 10,
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
    backgroundColor: Colors.purple,
  },
  optionText: {
    color: Colors.gray1,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: Colors.purple,
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
