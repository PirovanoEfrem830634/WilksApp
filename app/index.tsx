import React, { useLayoutEffect, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import { Link, useNavigation } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from "../app/BottomNavigation";
import { auth, db } from "../firebaseconfig";
import { collection, getDocs } from "firebase/firestore";

export default function Index() {
  const navigation = useNavigation();
  const [nextMedication, setNextMedication] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const fetchNextMedication = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date();
      const dayName = today.toLocaleString("en-US", { weekday: "short" });
      const currentTime = today.getHours() * 60 + today.getMinutes();

      const medsRef = collection(db, "users", user.uid, "medications");
      const snapshot = await getDocs(medsRef);

      const medsToday: { name: string; dose: string; time: string }[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.days?.includes(dayName) && Array.isArray(data.times)) {
          data.times.forEach((time: string) => {
            const [h, m] = time.split(":").map((n) => parseInt(n));
            const total = h * 60 + m;
            if (total >= currentTime) {
              medsToday.push({ name: data.name, dose: data.dose, time });
            }
          });
        }
      });

      medsToday.sort((a, b) => {
        const [h1, m1] = a.time.split(":").map(Number);
        const [h2, m2] = b.time.split(":").map(Number);
        return h1 * 60 + m1 - (h2 * 60 + m2);
      });

      if (medsToday.length > 0) {
        const med = medsToday[0];
        setNextMedication(`${med.name}, ${med.time}`);
      } else {
        setNextMedication(null);
      }
    };

    fetchNextMedication();
  }, []);

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animatable.View animation="fadeInDown" delay={100} style={styles.header}>
          <Image source={require("../assets/images/BannerWilks.jpg")} style={styles.banner} />
          <Text style={styles.headerTitle}>Welcome to Wilks</Text>
          <Text style={styles.subtitle}>Your journey starts here</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={800} easing="ease-out-cubic" delay={300} style={styles.infoCard}>
        <Text style={styles.cardTitle}>💊 Next Medication</Text>
        <Text style={styles.cardValue}>
          {nextMedication ? nextMedication : "No medication scheduled today"}
        </Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" duration={800} easing="ease-out-cubic" delay={500} style={styles.infoCard}>
        <Text style={styles.cardTitle}>📈 Well-being Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryItem}>Fatigue: 7/10</Text>
          <Text style={styles.summaryItem}>Sleep: 😴</Text>
          <Text style={styles.summaryItem}>Mood: 😐</Text>
        </View></Animatable.View>

        <Animatable.Text animation="fadeIn" delay={650} style={styles.sectionTitle}>Quick Actions</Animatable.Text>

        <Animatable.View animation="fadeInUp" delay={700} style={styles.quickActions}>
          <Link href="/tracking" asChild>
            <Pressable style={styles.actionButton}>
              <Ionicons name="analytics-outline" size={26} color="#007AFF" />
              <Text style={styles.actionText}>Track</Text>
            </Pressable>
          </Link>
          <Link href="/mymedication" asChild>
            <Pressable style={styles.actionButton}>
              <Ionicons name="medkit-outline" size={26} color="#007AFF" />
              <Text style={styles.actionText}>Meds</Text>
            </Pressable>
          </Link>
          <Link href="/info" asChild>
            <Pressable style={styles.actionButton}>
              <Ionicons name="information-circle-outline" size={26} color="#007AFF" />
              <Text style={styles.actionText}>Info</Text>
            </Pressable>
          </Link>
        </Animatable.View>
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
wrapper: {
  flex: 1,
  backgroundColor: "#F9FAFB",
},
banner: {
  width: "90%",
  height: 150,
  borderRadius: 15,
  marginBottom: 15,
},
header: {
  paddingTop: 50,
  paddingBottom: 20,
  alignItems: "center",
},
headerTitle: {
  fontSize: 26,
  fontWeight: "bold",
  color: "#2C3E50",
},
subtitle: {
  fontSize: 16,
  color: "#5DADE2",
  marginTop: 5,
},
scrollContainer: {
  paddingHorizontal: 20,
  paddingTop: 50,
  paddingBottom: 100,
},
headerBox: {
  marginBottom: 25,
},
welcome: {
  fontSize: 18,
  color: "#666",
},
name: {
  fontSize: 26,
  fontWeight: "bold",
  color: "#1C1C1E",
},
infoCard: {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 18,
  marginBottom: 16,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 6,
  elevation: 3,
},
cardTitle: {
  fontSize: 16,
  fontWeight: "600",
  marginBottom: 6,
  color: "#333",
},
cardValue: {
  fontSize: 17,
  color: "#1C1C1E",
  fontWeight: "500",
},
summaryRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 6,
},
summaryItem: {
  fontSize: 15,
  color: "#444",
},
sectionTitle: {
  fontSize: 16,
  fontWeight: "600",
  marginTop: 30,
  marginBottom: 10,
  color: "#1C1C1E",
},
quickActions: {
  flexDirection: "row",
  justifyContent: "space-around",
},
actionButton: {
  backgroundColor: "#fff",
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderRadius: 14,
  alignItems: "center",
  width: 100,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 6,
  elevation: 3,
},
actionText: {
  marginTop: 8,
  fontSize: 14,
  fontWeight: "600",
  color: "#2C3E50",
},
});
