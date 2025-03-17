import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function PredictiveSuggestion() {
  const [monthlySymptoms, setMonthlySymptoms] = useState<Record<string, any>>({});
  const [suggestion, setSuggestion] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadMonthlyData();
  }, []);

  const loadMonthlyData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      const data = items.reduce((acc, [key, value]) => {
        if (value && key.startsWith(getCurrentMonth())) {
          acc[key] = JSON.parse(value);
        }
        return acc;
      }, {} as Record<string, any>);
      setMonthlySymptoms(data);
    } catch (error) {
      console.error("Error loading symptom data:", error);
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const generateSuggestion = () => {
    const totalSymptoms = Object.values(monthlySymptoms).reduce((acc, data) => {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === "boolean" && value) acc[key] = (acc[key] || 0) + 1;
        if (typeof value === "number") acc[key] = (acc[key] || 0) + value;
      });
      return acc;
    }, {} as Record<string, number>);

    if (totalSymptoms.affaticamentoMuscolare && totalSymptoms.affaticamentoMuscolare > 30) {
      setSuggestion("Based on your muscle fatigue this month, consider lighter exercises and more rest days.");
    } else if (totalSymptoms.difficoltaRespiratorie && totalSymptoms.difficoltaRespiratorie > 5) {
      setSuggestion("Monitor your breathing closely and consult your doctor for potential respiratory support.");
    } else {
      setSuggestion("Your symptoms appear stable. Continue with your current treatment and consult your doctor if needed.");
    }

    setShowModal(true);
  };

  const lineChartData = {
    labels: Object.keys(monthlySymptoms),
    datasets: [
      {
        data: Object.values(monthlySymptoms).map((item: any) => item.affaticamentoMuscolare || 0),
        strokeWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(monthlySymptoms),
    datasets: [
      {
        data: Object.values(monthlySymptoms).map((item: any) => item.difficoltaRespiratorie ? 1 : 0),
      },
    ],
  };

  return (
    <ScrollView className="p-4">
      <Text className="text-3xl font-bold mb-6 text-center">Predictive Suggestions</Text>

      <Text className="text-lg font-bold mb-2">Muscle Fatigue Trend</Text>
      <LineChart
        data={lineChartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        bezier
        style={{ borderRadius: 16 }}
      />

      <Text className="text-lg font-bold mt-6 mb-2">Respiratory Difficulty Frequency</Text>
      <BarChart
        data={barChartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: "#1cc910",
          backgroundGradientFrom: "#43a047",
          backgroundGradientTo: "#66bb6a",
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        style={{ borderRadius: 16 }}
      />

      <Pressable
        className="bg-primary p-4 rounded-lg mt-6"
        onPress={generateSuggestion}
      >
        <Text className="text-white text-center font-bold">Generate Suggestion</Text>
      </Pressable>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg shadow-lg">
            <Text className="text-lg font-bold mb-4">Suggested Advice</Text>
            <Text className="mb-4">{suggestion}</Text>
            <Pressable
              onPress={() => setShowModal(false)}
              className="bg-primary p-3 rounded-lg"
            >
              <Text className="text-white text-center">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}