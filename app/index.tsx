import React, { useLayoutEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Image } from "react-native";
import { Link, useNavigation } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from "../app/BottomNavigation";

export default function Index() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Header con immagine e titolo */}
      <View style={styles.header}>
        <Image source={require("../assets/images/BannerWilks.jpg")} style={styles.banner} />
        <Text style={styles.headerTitle}>Welcome to Wilks</Text>
        <Text style={styles.subtitle}>Your journey starts here</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Sezione delle opzioni */}
        <View style={styles.cardContainer}>
          <Link href="/sign-in" asChild>
            <Pressable style={styles.card}>
              <Ionicons name="log-in-outline" size={30} color="#5DADE2" />
              <Text style={styles.cardText}>Sign In</Text>
            </Pressable>
          </Link>

          <Link href="/profile" asChild>
            <Pressable style={styles.card}>
              <Ionicons name="person-outline" size={30} color="#5DADE2" />
              <Text style={styles.cardText}>Profile</Text>
            </Pressable>
          </Link>
          
          <Link href="/info" asChild>
            <Pressable style={styles.card}>
              <Ionicons name="home-outline" size={30} color="#5DADE2" />
              <Text style={styles.cardText}>Properties</Text>
            </Pressable>
          </Link>
          
          <Link href="/tracking" asChild>
            <Pressable style={styles.card}>
              <Ionicons name="location-outline" size={30} color="#5DADE2" />
              <Text style={styles.cardText}>Tracking</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
      
      {/* Bottom Navigation Bar */}
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFEFE",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
  },
  banner: {
    width: "90%",
    height: 150,
    borderRadius: 15,
    marginBottom: 15,
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
  content: {
    alignItems: "center",
    paddingBottom: 40,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    marginTop: 20,
  },
  card: {
    width: 140,
    height: 140,
    backgroundColor: "#fff",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  bottomIcon: {
    padding: 10,
  },
});
