import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { Home, Activity, User, Brain } from "lucide-react-native"; // Aggiunto `Info`
import { useRouter } from "expo-router";

export default function BottomNavigation() {
  const router = useRouter();

  return (
    <View style={styles.bottomBar}>
      <Pressable onPress={() => router.push("/")} style={styles.navButton}>
        <Home size={24} color="#007AFF" />
        <Text style={styles.navText}>Home</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/trackinghistory")} style={styles.navButton}>
        <Activity size={24} color="#007AFF" />
        <Text style={styles.navText}>History</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/cdsspage")} style={styles.navButton}>
        <Brain size={24} color="#007AFF" />
        <Text style={styles.navText}>Ai Assistant</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/profile")} style={styles.navButton}>
        <User size={24} color="#007AFF" />
        <Text style={styles.navText}>Profile</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
  },
  navButton: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 4,
  },
});
