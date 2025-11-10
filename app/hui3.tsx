import React, { useState, useRef  } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Animated,
} from "react-native";
import { auth, db } from "../firebaseconfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import * as Animatable from "react-native-animatable";
import BottomNavigation from "../components/bottomnavigationnew";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { PressableScale } from "react-native-pressable-scale";
import { Ionicons } from "@expo/vector-icons";

const hui3Attributes = [
  { label: "Vision", icon: "eye" },
  { label: "Hearing", icon: "ear" },
  { label: "Speech", icon: "mic" },
  { label: "Ambulation", icon: "walk" },
  { label: "Dexterity", icon: "hand-left-outline" },
  { label: "Emotion", icon: "happy" },
  { label: "Cognition", icon: "brain" },
  { label: "Pain", icon: "alert-circle" },
];

export default function HUI3Survey() {
  const [answers, setAnswers] = useState<number[]>(Array(8).fill(1));
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

    const docRef = doc(db, `users/${uid}/clinical_surveys/hui3`);
    try {
      await setDoc(docRef, {
        lastCompiledAt: Timestamp.now(),
        responses: {
          vision: answers[0],
          hearing: answers[1],
          speech: answers[2],
          ambulation: answers[3],
          dexterity: answers[4],
          emotion: answers[5],
          cognition: answers[6],
          pain: answers[7],
          summaryScore: null, // placeholder per ora
        },
      });
      showToast("✅ HUI3 survey saved successfully");
    } catch (err: any) {
      showToast("❌ Error: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInUp" duration={600} style={{ flex: 1 }}>
        <LinearGradient
          colors={["#C2F1E7", Colors.light1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBackground}
        />
        <View style={styles.mainHeader}>
          <Ionicons name="analytics" size={48} color={Colors.green} style={{ marginBottom: 10 }} />
          <Text style={FontStyles.variants.mainTitle}>HUI3 Survey</Text>
          <Text style={[FontStyles.variants.sectionTitle, { textAlign: "center" }]}>
            Evaluate each health attribute 
            {"\n"}(1 = best, 5 = worst)
            </Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {hui3Attributes.map((attr, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.questionRow}>
                <Ionicons name={attr.icon as any} size={18} color={Colors.green} style={{ marginRight: 8 }} />
                <Text style={styles.questionText}>{attr.label}</Text>
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
            backgroundColor: Colors.green,
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
    backgroundColor: Colors.green,
  },
  optionText: {
    color: Colors.gray1,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: Colors.green,
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
