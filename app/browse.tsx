import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Link } from "expo-router";
import FontStyles from "../Styles/fontstyles";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "../app/bottomnavigationnew";
import Colors from "../Styles/color";
import { PressableScale } from "react-native-pressable-scale";
import { TextInput } from "react-native";
import { Image } from "react-native";


const sections: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  href: string;
}[] = [
  { label: "Track", icon: "analytics", color: Colors.blue, href: "/trackingnew" },
  { label: "Tracking History", icon: "calendar", color: Colors.gray3, href: "/trackinghistory" },
  { label: "Medications", icon: "medkit", color: Colors.turquoise, href: "/mymedicationnew" },
  { label: "Symptoms Infos", icon: "information-circle", color: Colors.purple, href: "/infonew" },
  { label: "Blood Monitoring", icon: "water", color: Colors.red, href: "/monitoraggioclinico" },
  { label: "Diet", icon: "nutrition", color: Colors.orange, href: "/diettrackernew" },
  { label: "Sleep", icon: "bed", color: Colors.green, href: "/sleeptracking" },
];

export default function Browse() {
const [searchTerm, setSearchTerm] = useState("");
const filteredSections = sections.filter((section) =>
  section.label.toLowerCase().includes(searchTerm.toLowerCase())
);
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerRow}>
        <Text style={FontStyles.variants.mainTitle}>Browse</Text>
        <Image
            source={require("../assets/images/avatar-ios.jpg")}
            style={styles.avatar}
        />
        </View>
        <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.gray3} style={styles.searchIcon} />
        <TextInput
        placeholder="Search"
        placeholderTextColor={Colors.gray3}
        style={styles.searchInput}
        value={searchTerm}
        onChangeText={setSearchTerm}
        />
        </View>
        <Text style={[FontStyles.variants.sectionTitle,{ marginBottom: 20 }]}>Health Categories</Text>

        {filteredSections.map((item, index) => (
        <Link href={item.href} asChild key={index}>
            <PressableScale 
            style={styles.card}
            weight="light"
            activeScale={0.96}>
            <Ionicons name={item.icon} size={20} color={item.color} style={styles.icon} />
            <Text style={FontStyles.variants.body}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.light3} style={styles.chevron} />
            </PressableScale>
        </Link>
        ))}
      </ScrollView>
    <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light1,
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
    },
    icon: {
        marginRight: 12,
    },
    chevron: {
    marginLeft: "auto",
    },
    searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    marginTop: 12,
    },
    searchIcon: {
    marginRight: 8,
    },
    searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray1,
    fontFamily: "SFProDisplay-Regular",
    },
    headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 30,
    },
    avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    },

});
