import React, { useState, useRef } from "react";
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
import { Animated } from "react-native";


const questions = [
  { label: "Talking", icon: "mic" },
  { label: "Chewing", icon: "restaurant" },
  { label: "Swallowing", icon: "water" },
  { label: "Breathing", icon: "cloud" },
  { label: "Impairment of ability to brush teeth or comb hair", icon: "body" },
  { label: "Impairment of ability to rise from a chair", icon: "walk" },
  { label: "Double vision", icon: "eye" },
  { label: "Eyelid droop", icon: "eye-off" },
];

export default function MGADLSurvey() {
  const [answers, setAnswers] = useState<number[]>(Array(8).fill(0));

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

  const saveSurvey = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }
    const uid = user.uid;
    const docRef = doc(db, `users/${uid}/clinical_surveys/mg_adl`);
    try {
      await setDoc(docRef, {
        answers,
        lastCompiledAt: Timestamp.now(),
      });
      showToast("✅ Survey saved successfully");
    } catch (err: any) {
      showToast("❌ Error: " + err.message);
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
          colors={["#D1E9FF", Colors.light1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBackground}
        />

        <View style={styles.mainHeader}>
          <Ionicons name="pulse" size={48} color={Colors.blue} style={{ marginBottom: 10 }} />
          <Text style={FontStyles.variants.mainTitle}>MG-ADL Survey</Text>
          <Text style={FontStyles.variants.sectionTitle}>
            Indicate the severity for each item
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollView}>
          {questions.map((question, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.questionRow}>
                <Ionicons name={question.icon as any} size={18} color={Colors.blue} style={{ marginRight: 8 }} />
                <Text style={styles.questionText}>{question.label}</Text>
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
                      style={[styles.optionText, answers[index] === val && styles.optionTextSelected]}
                    >
                      {val}
                    </Text>
                  </PressableScale>
                ))}
              </View>
            </View>
          ))}

          <PressableScale
            onPress={saveSurvey}
            weight="light"
            activeScale={0.96}
            style={styles.submitButton}
            >
            <Text style={styles.submitButtonText}>Submit</Text>
          </PressableScale>
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
            backgroundColor: "#007AFF",
            padding: 14,
            borderRadius: 12,
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
          },
        ]}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>{toastMessage}</Text>
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
    backgroundColor: Colors.blue,
  },
  optionText: {
    color: Colors.gray1,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: Colors.blue,
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
