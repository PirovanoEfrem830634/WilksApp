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

        {/* Badge Profilo Completo */}
        {userData?.age && userData?.city && userData?.phone && userData?.height && userData?.weight && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Profilo Completo</Text>
          </View>
        )}
      </Animatable.View>

      {/* Info card */}
      <Animatable.View animation="fadeInUp" delay={300} style={styles.infoCard}>
        <Text style={styles.infoText}>
          <Ionicons name="calendar-outline" size={16} color="#5DADE2" /> Date of birth: <Text style={styles.infoValue}>{userData?.age || "Not provided"}</Text>
        </Text>
        <Text style={styles.infoText}>
          <Ionicons name="location-outline" size={16} color="#5DADE2" /> City: <Text style={styles.infoValue}>{userData?.city || "Not provided"}</Text>
        </Text>
        <Text style={styles.infoText}>
          <Ionicons name="call-outline" size={16} color="#5DADE2" /> Phone: <Text style={styles.infoValue}>{userData?.phone || "Not provided"}</Text>
        </Text>
        <Text style={styles.infoText}>
          <Ionicons name="body-outline" size={16} color="#5DADE2" /> Height: <Text style={styles.infoValue}>{userData?.height || "Not provided"}</Text>
        </Text>
        <Text style={styles.infoText}>
          <Ionicons name="scale-outline" size={16} color="#5DADE2" /> Weight: <Text style={styles.infoValue}>{userData?.weight || "Not provided"}</Text>
        </Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={500}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
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
  logoutButton: {
    backgroundColor: "#E74C3C",
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
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
});
