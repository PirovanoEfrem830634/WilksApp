import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";

export default function HadsSurvey() {
  return (
    <View style={styles.container}>
      <Ionicons name="sad" size={40} color={Colors.red} style={styles.icon} />
      <Text style={FontStyles.variants.mainTitle}>HADS</Text>
      <Text style={styles.description}>
        This is a placeholder for the Hospital Anxiety and Depression Scale (HADS). Implement the survey logic here.
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
