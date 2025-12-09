import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, Link } from "expo-router";
import Colors from "../Styles/color";

export default function BottomNavigation() {
  const pathname = usePathname();

  const tabs: {
    name: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    path: string;
  }[] = [
    { name: "Home",       icon: "home",               path: "/homenew" },

    // 🔕 Solo commentato, non rimosso
    // { name: "Assistente AI", icon: "git-branch-outline", path: "/cdsspagenew" },

    { name: "Questionari", icon: "clipboard",          path: "/clinicalsurveyscreen" },
    { name: "Esplora",     icon: "apps",               path: "/browse" },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => {
        const isActive = pathname === tab.path;
        return (
          <TabItem
            key={index}
            tab={tab}
            isActive={isActive}
          />
        );
      })}
    </View>
  );
}

// 🔹 Componente interno con animazione di scale sul cambio pagina
function TabItem({
  tab,
  isActive,
}: {
  tab: { name: string; icon: React.ComponentProps<typeof Ionicons>["name"]; path: string };
  isActive: boolean;
}) {
  const scale = useRef(new Animated.Value(isActive ? 1 : 0.95)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1 : 0.95,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();
  }, [isActive, scale]);

  return (
    <Link href={tab.path} asChild>
      <Pressable style={styles.tabItem}>
        <Animated.View
          style={{
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale }],
          }}
        >
          <Ionicons
            name={tab.icon}
            size={24}
            color={isActive ? Colors.blue : "#8E8E93"}
          />
          <Text
            style={[
              styles.tabLabel,
              isActive && styles.tabLabelActive,
            ]}
          >
            {tab.name}
          </Text>
        </Animated.View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: Colors.light2,
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    color: Colors.secondary,
    fontFamily: "SFProDisplay-Regular",
  },
  tabLabelActive: {
    color: Colors.blue,
    fontFamily: "SFProDisplay-Semibold",
  },
});
