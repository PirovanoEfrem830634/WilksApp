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

        <Animatable.View animation="fadeInDown" delay={100} style={styles.profileHeader}>
          <Image source={require("../assets/images/avatar-ios.jpg")} style={styles.avatar} />
          <Text style={styles.name}>{userData?.firstName} {userData?.lastName}</Text>
          <Text style={styles.email}>{userData?.email}</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} style={styles.infoCard}>
          <Text style={styles.infoText}>
            <Ionicons name="calendar-outline" size={16} color="#5DADE2" /> Data di nascita: <Text style={styles.infoValue}>{userData?.age || "Non fornita"}</Text>
          </Text>
          <Text style={styles.infoText}>
            <Ionicons name="location-outline" size={16} color="#5DADE2" /> Città: <Text style={styles.infoValue}>{userData?.city || "Non fornita"}</Text>
          </Text>
          <Text style={styles.infoText}>
            <Ionicons name="call-outline" size={16} color="#5DADE2" /> Telefono: <Text style={styles.infoValue}>{userData?.phone || "Non fornito"}</Text>
          </Text>
          <Text style={styles.infoText}>
            <Ionicons name="body-outline" size={16} color="#5DADE2" /> Altezza: <Text style={styles.infoValue}>{userData?.height || "Non fornita"}</Text>
          </Text>
          <Text style={styles.infoText}>
            <Ionicons name="scale-outline" size={16} color="#5DADE2" /> Peso: <Text style={styles.infoValue}>{userData?.weight || "Non fornito"}</Text>
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
    paddingTop: 50,
    paddingBottom: 80,
  },
  wrapper: {
    flex: 1,
    backgroundColor: "#FDFEFE",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
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
});
