import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";

export default function EQ5D5LSurvey() {
  return (
    <View style={styles.container}>
      <Ionicons name="fitness" size={40} color={Colors.orange} style={styles.icon} />
      <Text style={FontStyles.variants.mainTitle}>EQ-5D-5L</Text>
      <Text style={styles.description}>
        This is a placeholder for the EQ-5D-5L survey screen. You can implement the actual questionnaire here.
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
