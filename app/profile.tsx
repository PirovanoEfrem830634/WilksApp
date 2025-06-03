import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, Image, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { auth, db } from "../firebaseconfig";
import { getDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "../app/BottomNavigation";
import * as Animatable from "react-native-animatable";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  city?: string;
  phone?: string;
  height?: string;
  weight?: string;
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          console.log("User document does not exist");
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/sign-in");
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#2C3E50" style={{ flex: 1 }} />;
  }

  return (
  <View style={styles.wrapper}>
    <Animatable.View animation="fadeIn" duration={600} style={styles.container}>

      {/* Copertina e pulsante modifica */}
      <View style={styles.coverContainer}>
      <Image source={require("../assets/images/cover.jpg")} style={styles.coverImage} />
        <Ionicons name="create-outline" size={22} color="#FFF" />
        <View style={styles.avatarContainer}>
          <Image source={require("../assets/images/avatar-ios.jpg")} style={styles.avatar} />
        </View>
      </View>

      {/* Informazioni base */}
      <Animatable.View animation="fadeInDown" delay={100} style={styles.profileHeader}>
        <Text style={styles.name}>{userData?.firstName} {userData?.lastName}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
      </Animatable.View>

      {/* Info card */}
      <View style={styles.cardGroup}>
      {[
        { emoji: "📅", label: "Date of birth", value: userData?.age || "Not provided" },
        { emoji: "📍", label: "City", value: userData?.city || "Not provided" },
        { emoji: "📞", label: "Phone", value: userData?.phone || "Not provided" },
        { emoji: "📏", label: "Height", value: userData?.height || "Not provided" },
        { emoji: "⚖️", label: "Weight", value: userData?.weight || "Not provided" },
      ].map((item, index) => (
        <Animatable.View
          key={item.label}
          animation="fadeInUp"
          delay={300 + index * 100}
          style={styles.miniCard}
        >
          <Text style={styles.emojiIcon}>{item.emoji}</Text>
          <View>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        </Animatable.View>
      ))}
    </View>

    <Animatable.View animation="fadeInUp" delay={700} style={styles.buttonColumn}>
      <Pressable
        style={[styles.fullButton, styles.editButton]}
        onPress={() => router.push("/edit-profile")}
      >
        <Text style={styles.fullButtonText}>Edit Profile</Text>
      </Pressable>

      <Pressable
        style={[styles.fullButton, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.fullButtonText}>Logout</Text>
      </Pressable>
    </Animatable.View>

  </Animatable.View>
    <BottomNavigation />
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 80,
  },
  wrapper: {
    flex: 1,
    backgroundColor: "#FDFEFE",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop : 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  email: {
    fontSize: 16,
    color: "#5DADE2",
  },
  infoCard: {
    width: "90%",
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 16,
    color: "#2C3E50",
    marginBottom: 10,
  },
  infoValue: {
    fontWeight: "600",
  },
  logoutText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
    coverContainer: {
    position: "relative",
    width: "100%",
    height: 140,
    backgroundColor: "#EAF4F4",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  coverImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    resizeMode: "cover",
  },
  badge: {
    marginTop: 8,
    backgroundColor: "#5DADE2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  avatarContainer: {
  position: "absolute",
  bottom: -50,
  alignItems: "center",
  justifyContent: "center",
  zIndex: 3,
  },
  cardGroup: {
    width: "90%",
    gap: 12,
    marginBottom: 24,
  },
  miniCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  editProfileButton: {
  backgroundColor: "#5DADE2",
  paddingVertical: 14,
  paddingHorizontal: 30,
  borderRadius: 12,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  buttonColumn: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 14,
    marginBottom: 40,
  },
  fullButton: {
    backgroundColor: "#007AFF", 
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  editButton: {
    backgroundColor: "#007AFF", 
  },
  logoutButton: {
    backgroundColor: "#E74C3C", 
  },
  emojiIcon: {
    fontSize: 20,
    marginRight: 10,
  },
});
