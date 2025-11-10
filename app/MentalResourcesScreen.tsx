import React from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "../components/bottomnavigationnew";
import { LinearGradient } from "expo-linear-gradient";
import FontStyles from "../Styles/fontstyles";
import Colors from "../Styles/color";

const MentalResourcesScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={["#EBC9FB", Colors.light1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBackground}
        />

        <View style={styles.mainHeader}>
          <View style={styles.iconWrapper}>
            <Ionicons name="help-buoy" size={48} color={Colors.indigo} />
          </View>
          <Text style={FontStyles.variants.mainTitle}>Mental Health Resources</Text>
          <Text style={FontStyles.variants.sectionTitle}>
            Find help, tools, and support services
          </Text>
        </View>

        <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="call" size={20} color={Colors.blue} />
            <Text style={[FontStyles.variants.sectionTitle, { color: Colors.blue }]}>Help Lines</Text>
          </View>
          <Text style={FontStyles.variants.cardDescription}>
            Contact 24/7 mental health professionals or emergency services.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL("tel:800123456")}>
            <Text style={styles.link}>Call 800 123 456</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={200} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="book" size={20} color={Colors.purple} />
            <Text style={[FontStyles.variants.sectionTitle, { color: Colors.purple }]}>Self-help Guides</Text>
          </View>
          <Text style={FontStyles.variants.cardDescription}>
            Articles and guides on stress management, anxiety and depression.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://www.mind.org.uk")}>
            <Text style={styles.link}>Visit mind.org.uk</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="map" size={20} color={Colors.turquoise} />
            <Text style={[FontStyles.variants.sectionTitle, { color: Colors.turquoise }]}>Find Local Services</Text>
          </View>
          <Text style={FontStyles.variants.cardDescription}>
            Search for mental health clinics and therapists in your area.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://www.mentalhealthmap.org")}>
            <Text style={styles.link}>Open mentalhealthmap.org</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light1,
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    zIndex: -1,
  },
  mainHeader: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  iconWrapper: {
    borderRadius: 60,
    padding: 5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  link: {
    marginTop: 8,
    color: Colors.blue,
    fontWeight: "600",
  },
});

export default MentalResourcesScreen;
