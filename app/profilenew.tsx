import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, Image, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { auth, db } from "../firebaseconfig";
import { getDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "../app/bottomnavigationnew";
import * as Animatable from "react-native-animatable";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { TouchableOpacity } from "react-native";
import { PressableScale } from "react-native-pressable-scale";

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

      {/* Informazioni base */}
      <View style={styles.profileHeader}>
        <Image
            source={require("../assets/images/avatar-ios.jpg")}
            style={styles.avatar}
        />
        <Text style={FontStyles.variants.mainTitle}>
            {userData?.firstName} {userData?.lastName}
        </Text>
        <Text style={FontStyles.variants.bodySemibold}>{userData?.email}</Text>
        </View>

      {/* Info card */}
      <View style={styles.cardGroup}>
        {[
            {
            icon: "calendar",
            label: "Date of birth",
            value: userData?.age || "Not provided",
            color: Colors.purple,
            },
            {
            icon: "location",
            label: "City",
            value: userData?.city || "Not provided",
            color: Colors.orange,
            },
            {
            icon: "call",
            label: "Phone",
            value: userData?.phone || "Not provided",
            color: Colors.blue,
            },
            {
            icon: "resize",
            label: "Height",
            value: userData?.height || "Not provided",
            color: Colors.green,
            },
            {
            icon: "barbell",
            label: "Weight",
            value: userData?.weight || "Not provided",
            color: Colors.red,
            },
        ].map((item, index) => (
            <Animatable.View
            key={item.label}
            animation="fadeInUp"
            delay={300 + index * 100}
            >
            <PressableScale
                weight="light"
                activeScale={0.96}
                style={styles.miniCard}
            >
                <Ionicons
                name={item.icon as any}
                size={20}
                color={item.color}
                style={styles.iconLeft}
                />
                <View style={{ flex: 1 }}>
                <Text style={[FontStyles.variants.sectionTitle, { color: item.color }]}>
                    {item.label}
                </Text>
                <Text style={FontStyles.variants.body}>{item.value}</Text>
                </View>
            </PressableScale>
            </Animatable.View>
        ))}
        </View>

    <Animatable.View animation="fadeInUp" delay={700} style={styles.buttonColumn}>
    <PressableScale
    onPress={() => router.push("/editprofilenew")}
    weight="light"
    activeScale={0.96}
    style={[styles.fullButton, styles.editButton]}
    >
    <Text style={styles.fullButtonText}>Edit Profile</Text>
    </PressableScale>

    <PressableScale
    onPress={handleLogout}
    weight="light"
    activeScale={0.96}
    style={[styles.fullButton, styles.logoutButton]}
    >
    <Text style={styles.fullButtonText}>Logout</Text>
    </PressableScale>
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
    backgroundColor: Colors.blue,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: Colors.red,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, 
  },
  emojiIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  iconLeft: {
  marginRight: 12,
},
});