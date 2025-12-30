import React from "react";
import { View, Image, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "../Styles/color";

export default function SplashPage() {
  return (
    <View style={styles.root}>
      {/* Gradient background */}
      <LinearGradient
        colors={[Colors.blue, Colors.turquoise]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Logo */}
      <Animatable.View
        animation="fadeIn"
        duration={1100}
        delay={150}
        easing="ease-out-cubic"
        style={styles.logoWrapper}
      >
        <Image
          source={require("../assets/images/splashsecond.png")}
          style={styles.logo}
        />
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  logo: {
    width: 190,   // ⬅️ più grande
    height: 190,  // ⬅️ più grande
    resizeMode: "contain",
  },
});
