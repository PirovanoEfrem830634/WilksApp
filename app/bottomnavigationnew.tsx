import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, Link } from "expo-router";

export default function BottomNavigation() {
  const pathname = usePathname();

  const tabs: {
  name: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  path: string;
    }[] = [
  { name: "Home", icon: "home", path: "/index" },
  { name: "AI Assistant", icon: "chatbubble-ellipses", path: "/cdsspage" },
  { name: "Browse", icon: "apps", path: "/browse" },
    ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => {
        const isActive = pathname === tab.path;
        return (
          <Link href={tab.path} asChild key={index}>
            <Pressable style={styles.tabItem}>
              <Ionicons
                name={tab.icon}
                size={24}
                color={isActive ? "#3A82F7" : "#8E8E93"}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.name}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5EA",
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    color: "#8E8E93",
    fontFamily: "SFProDisplay-Regular",
  },
  tabLabelActive: {
    color: "#3A82F7",
    fontFamily: "SFProDisplay-Semibold",
  },
});
