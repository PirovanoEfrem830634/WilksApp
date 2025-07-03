import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";

export default function Hui3Survey() {
  return (
    <View style={styles.container}>
      <Ionicons name="analytics" size={40} color={Colors.green} style={styles.icon} />
      <Text style={FontStyles.variants.mainTitle}>HUI3</Text>
      <Text style={styles.description}>
        This is a placeholder for the Health Utilities Index (HUI3). You can build the full questionnaire UI here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  icon: {
    marginBottom: 12,
  },
  description: {
    textAlign: "center",
    fontSize: 14,
    color: Colors.gray3,
    marginTop: 8,
  },
});
