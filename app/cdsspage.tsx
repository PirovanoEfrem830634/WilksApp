import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { MotiView } from "moti";
import { valutaCDSS, DatiSintomi } from "./utils/valutaCDSS";
import { Pill, AlertTriangle, Sparkles } from "lucide-react-native";
import BottomNavigation from "../app/BottomNavigation";

const emojiMap = (msg: string) => {
  if (msg.includes("neurologo")) return { icon: <AlertTriangle size={18} color="red" />, emoji: "🧠" };
  if (msg.includes("pasti") || msg.includes("sera")) return { icon: <Pill size={18} color="orange" />, emoji: "🍝" };
  return { icon: <Sparkles size={18} color="#3b82f6" />, emoji: "✨" };
};

export default function CDSSPage() {
  const [suggerimenti, setSuggerimenti] = useState<string[]>([]);

  const calcolaSuggerimenti = () => {
    const dati: DatiSintomi = {
      ptosi: 2.1,
      disfagia: true,
      pastoPesanteNotte: true,
    };
    const risultati = valutaCDSS(dati);
    setSuggerimenti(risultati);
  };

  useEffect(() => {
    calcolaSuggerimenti();
  }, []);

  return (
    <View className="flex-1 bg-gradient-to-b from-white to-blue-50">
      <ScrollView className="p-5 pb-24">
        <View className="items-center">
          <Text className="text-2xl font-bold mb-1 text-gray-900 text-center">🩺 CDSS – Consigli su misura</Text>
          <Text className="text-base text-gray-600 mb-6 text-center">Analisi basata sui tuoi ultimi dati</Text>

          <Pressable
            onPress={calcolaSuggerimenti}
            className="bg-blue-600 rounded-xl py-3 px-5 mb-6"
          >
            <Text className="text-white text-base font-medium">🔄 Ricalcola consigli</Text>
          </Pressable>

          {suggerimenti.map((msg, i) => {
            const { icon, emoji } = emojiMap(msg);
            return (
              <MotiView
                key={i}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: i * 100 }}
                className="bg-white px-4 py-4 rounded-2xl shadow-md mb-4 flex-row items-center space-x-3 w-full"
              >
                <Text className="text-2xl">{emoji}</Text>
                {icon}
                <Text className="text-base text-gray-800 flex-1 text-left">{msg}</Text>
              </MotiView>
            );
          })}
        </View>
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}
