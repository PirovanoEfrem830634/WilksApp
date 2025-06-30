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

const classifications = [
  {
    label: "Class I",
    description: "Any ocular muscle weakness; all other muscle strength is normal",
  },
  {
    label: "Class IIa",
    description: "Mild weakness affecting limb, axial muscles, or both. May also have ocular involvement."
  },
  {
    label: "Class IIb",
    description: "Mild weakness affecting oropharyngeal or respiratory muscles. May also have ocular involvement."
  },
  {
    label: "Class IIIa",
    description: "Moderate weakness affecting limb, axial muscles, or both. May also have ocular involvement."
  },
  {
    label: "Class IIIb",
    description: "Moderate weakness affecting oropharyngeal or respiratory muscles. May also have ocular involvement."
  },
  {
    label: "Class IVa",
    description: "Severe weakness affecting limb, axial muscles, or both. May also have ocular involvement."
  },
  {
    label: "Class IVb",
    description: "Severe weakness affecting oropharyngeal or respiratory muscles. May also have ocular involvement."
  },
  {
    label: "Class V",
    description: "Defined by intubation, with or without mechanical ventilation"
  },
];

export default function MGFAClassificationSurvey() {
  const [selected, setSelected] = useState<string | null>(null);

  const saveSurvey = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }
    const uid = user.uid;
    const docRef = doc(db, `users/${uid}/clinical_surveys/mgfa`);
    try {
      await setDoc(docRef, {
        classification: selected,
        lastCompiledAt: Timestamp.now(),
      });
      Alert.alert("Success", "Classification saved successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
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
          <Ionicons name="medkit" size={48} color={Colors.turquoise} style={{ marginBottom: 10 }} />
          <Text style={FontStyles.variants.mainTitle}>MGFA Classification</Text>
          <Text style={FontStyles.variants.sectionTitle}>Select the most appropriate classification</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollView}>
          {classifications.map((item, index) => (
            <PressableScale
              key={index}
              onPress={() => setSelected(item.label)}
              style={[styles.card, selected === item.label && styles.cardSelected]}
              weight="light"
              activeScale={0.96}
            >
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </PressableScale>
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
  cardSelected: {
    borderColor: Colors.turquoise,
    borderWidth: 2,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gray1,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.gray3,
  },
  submitButton: {
    backgroundColor: Colors.turquoise,
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
