import React, { useEffect, useState, useLayoutEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { auth, db } from "../firebaseconfig";
import { getDoc, doc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "../components/bottomnavigationnew";
import * as Animatable from "react-native-animatable";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import PressableScaleWithRef from "../components/PressableScaleWithRef";
import { clearPatientDocId, getPatientDocId } from "../utils/session";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const patientId = await getPatientDocId();
        if (!patientId) {
          console.log("patientDocId mancante: rifai login/attivazione");
          setUserData(null);
          setLoading(false);
          return;
        }

        try {
          const userDocRef = doc(db, "users", patientId);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            console.log("User document does not exist");
            setUserData(null);
          }
        } catch (e) {
          console.log("Errore lettura profilo:", e);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
      await signOut(auth);
      setUserData(null);
      await clearPatientDocId();
      router.replace("/sign-in");
    };

    const bottomPadding = useMemo(() => {
      const NAV_H = 56; // altezza tipica bottom nav
      return NAV_H + Math.max(insets.bottom, 10) + 18; // respiro extra
    }, [insets.bottom]);

    if (loading) {
      return (
        <ActivityIndicator size="large" color="#2C3E50" style={{ flex: 1 }} />
      );
    }

    return (
      <View style={styles.wrapper}>
        {/* ===== HEADER FISSO ===== */}
        <View style={styles.fixedHeader}>
          <Image
            source={require("../assets/images/avatar-ios.jpg")}
            style={styles.avatar}
          />
          <Text style={FontStyles.variants.mainTitle}>
            {userData?.firstName} {userData?.lastName}
          </Text>
          <Text style={FontStyles.variants.bodySemibold}>
            {userData?.email}
          </Text>
        </View>

        {/* ===== CONTENUTO SCROLLABILE ===== */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPadding },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardGroup}>
            {[
              { icon: "calendar", label: "Età", value: userData?.age || "Non fornita", color: Colors.purple },
              { icon: "location", label: "Città", value: userData?.city || "Non fornita", color: Colors.orange },
              { icon: "call", label: "Telefono", value: userData?.phone || "Non fornito", color: Colors.blue },
              { icon: "resize", label: "Altezza", value: userData?.height || "Non fornita", color: Colors.green },
              { icon: "barbell", label: "Peso", value: userData?.weight || "Non fornito", color: Colors.red },
            ].map((item, index) => (
              <Animatable.View
                key={item.label}
                animation="fadeInUp"
                delay={200 + index * 80}
              >
                <PressableScaleWithRef
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
                    <Text
                      style={[
                        FontStyles.variants.sectionTitle,
                        { color: item.color },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={FontStyles.variants.body}>{item.value}</Text>
                  </View>
                </PressableScaleWithRef>
              </Animatable.View>
            ))}
          </View>

          <View style={styles.buttonColumn}>
            <PressableScaleWithRef
              onPress={() => router.push("/editprofilenew")}
              weight="light"
              activeScale={0.96}
              style={[styles.fullButton, styles.editButton]}
            >
              <Text style={styles.fullButtonText}>Modifica profilo</Text>
            </PressableScaleWithRef>

            <PressableScaleWithRef
              onPress={handleLogout}
              weight="light"
              activeScale={0.96}
              style={[styles.fullButton, styles.logoutButton]}
            >
              <Text style={styles.fullButtonText}>Logout</Text>
            </PressableScaleWithRef>
          </View>
        </ScrollView>

        <BottomNavigation />
      </View>
    );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FDFEFE",
  },
  container: {
    alignItems: "center",
    paddingTop: 0,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
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
  iconLeft: {
    marginRight: 12,
  },
  fullButton: {
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
    backgroundColor: Colors.red,
  },
  fixedHeader: {
  alignItems: "center",
  paddingTop: 40,
  paddingBottom: 20,
  backgroundColor: "#FDFEFE",
  },
  scrollContent: {
    paddingTop: 8,
  },
  cardGroup: {
    width: "90%",
    alignSelf: "center",
    gap: 12,
    marginBottom: 28,
  },
  buttonColumn: {
    paddingHorizontal: 20,
    gap: 14,
  },
});
