import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardTypeOptions,
  Animated,
} from "react-native";
import { auth, db } from "../firebaseconfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import BottomNavigation from "../app/bottomnavigationnew";
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { TouchableOpacity } from "react-native";
import { PressableScale } from "react-native-pressable-scale";

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [toastAnim] = useState(new Animated.Value(0));
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    city: "",
    phone: "",
    height: "",
    weight: "",
  });

useFocusEffect(
  useCallback(() => {
    const loadUserData = async () => {
      setLoading(true);
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            age: data.age?.toString() || "",
            city: data.city || "",
            phone: data.phone || "",
            height: data.height || "",
            weight: data.weight || "",
          });
        }
      }
      setLoading(false);
    };

    loadUserData();

    // Quando esci dalla schermata: resetta i dati
    return () => {
      setFormData({
        firstName: "",
        lastName: "",
        age: "",
        city: "",
        phone: "",
        height: "",
        weight: "",
      });
    };
  }, [])
);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const showToast = () => {
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSave = async () => {
    // Validazione semplice
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.age.trim() ||
      isNaN(Number(formData.age))
    ) {
      Alert.alert("Validation Error", "Please fill in all required fields correctly.");
      return;
    }

    try {
      const userRef = doc(db, "users", auth.currentUser!.uid);
      await updateDoc(userRef, {
        ...formData,
        age: parseInt(formData.age),
      });

      showToast();
      setTimeout(() => router.back(), 2500); // ritorna dopo la toast
    } catch (err) {
      Alert.alert("Error", "Something went wrong while saving.");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} color="#007AFF" />;
  }

  const fields: {
  label: string;
  key: keyof typeof formData;
  keyboard: KeyboardTypeOptions;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { icon: "person", label: "First Name *", key: "firstName", keyboard: "default", color: Colors.blue },
  { icon: "person", label: "Last Name *", key: "lastName", keyboard: "default", color: Colors.purple },
  { icon: "calendar", label: "Age *", key: "age", keyboard: "numeric", color: Colors.orange },
  { icon: "location", label: "City", key: "city", keyboard: "default", color: Colors.green },
  { icon: "call", label: "Phone", key: "phone", keyboard: "phone-pad", color: Colors.red },
  { icon: "resize", label: "Height", key: "height", keyboard: "numeric", color: Colors.turquoise },
  { icon: "barbell", label: "Weight", key: "weight", keyboard: "numeric", color: Colors.yellow },
];

  return (
  <View style={styles.wrapper}>
    <Animatable.View animation="fadeInUp" duration={500} style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={FontStyles.variants.mainTitle}>Edit Profile</Text>
        </View>

      {fields.map((field) => (
        <View key={field.key} style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
            <Ionicons
                name={field.icon}
                size={18}
                color={field.color}
                style={styles.iconLeft}
            />
            <Text style={[FontStyles.variants.smallLabelBold, { color: field.color }]}>
                {field.label}
            </Text>
            </View>
            <TextInput
            value={formData[field.key]}
            onChangeText={(text) => handleChange(field.key, text)}
            keyboardType={field.keyboard}
            style={styles.input}
            />
        </View>
        ))}

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </Pressable>

      <Animated.View
        style={[
          styles.toast,
          {
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
        <Text style={styles.toastText}>Profile updated successfully</Text>
      </Animated.View>
    </ScrollView>
    </Animatable.View>
    <BottomNavigation />
  </View>
);

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    padding: 20,
    paddingBottom: 120,
  },
  header: {
  marginBottom: 10,
  alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1C1C1E",
    textAlign: "center",
  },
  subtitle: {
  fontSize: 15,
  color: "#6B7280",
  textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  toast: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    zIndex: 999,
  },
  toastText: {
    color: "#fff",
    fontWeight: "600",
  },
  wrapper: {
  flex: 1,
  backgroundColor: "#F9FAFB",
  },
  scrollContent: {
  padding: 20,
  paddingBottom: 120,
  },
  iconLeft: {
  marginRight: 12,
  },
  inputLabelRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 6,
  },
  headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 20,
  marginBottom: 12,
  },
});