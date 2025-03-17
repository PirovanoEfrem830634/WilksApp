import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, Alert, ScrollView } from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TrackingHistory() {
  const router = useRouter();

  const [symptomData, setSymptomData] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Carica i dati da AsyncStorage
  const loadSymptomData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      const data = items.reduce((acc, [key, value]) => {
        if (value) {
          acc[key] = JSON.parse(value);
        }
        return acc;
      }, {} as Record<string, any>);
      setSymptomData(data);
    } catch (error) {
      console.error("Error loading symptom data:", error);
    }
  };

  useEffect(() => {
    loadSymptomData();
  }, []);

  // Gestione della selezione del giorno
  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setShowModal(true);
  };

  // Funzione per eliminare i sintomi di una data specifica
  const handleDelete = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete the symptoms for this date?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (selectedDate && symptomData[selectedDate]) {
                await AsyncStorage.removeItem(selectedDate);
                const updatedData = { ...symptomData };
                delete updatedData[selectedDate];
                setSymptomData(updatedData);
                setShowModal(false);
              } else {
                Alert.alert("No Data", "No symptoms recorded for this date.");
              }
            } catch (error) {
              console.error("Error deleting symptom data:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="p-4">
      {/* Titolo e Sottotitolo */}
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-primary">Track Symptoms</Text>
        <Text className="text-gray-500 text-center">
          Select a date to view or manage tracked symptoms.
        </Text>
      </View>

      {/* Componente del Calendario */}
      <Calendar
        markedDates={Object.keys(symptomData).reduce((acc, date) => {
          acc[date] = { marked: true, dotColor: "blue" };
          return acc;
        }, {} as Record<string, any>)}
        onDayPress={handleDayPress}
      />

      {/* Pulsante per tornare alla Homepage */}
      <Pressable
        className="bg-primary p-4 rounded-lg mt-6"
        onPress={() => router.push("/home")}
      >
        <Text className="text-light text-center font-bold">Return to Homepage</Text>
      </Pressable>

      {/* Modal per visualizzare i sintomi e cancellare */}
      <Modal visible={showModal} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg shadow-lg w-3/4">
            <Text className="text-xl font-bold mb-4">
              Symptoms for {selectedDate}
            </Text>

            <Text className="text-gray-700 mb-4">
              {symptomData[selectedDate!]
                ? Object.entries(symptomData[selectedDate!])
                    .map(([key, value]) =>
                      typeof value === "boolean"
                        ? value
                          ? `${key}: Yes`
                          : `${key}: No`
                        : `${key}: ${value}`
                    )
                    .join("\n")
                : "No symptoms recorded."}
            </Text>

            <View className="flex-row justify-between">
              {/* Pulsante per Chiudere */}
              <Pressable
                className="bg-gray-300 p-3 rounded"
                onPress={() => setShowModal(false)}
              >
                <Text>Close</Text>
              </Pressable>

              {/* Pulsante per Cancellare */}
              <Pressable
                className="bg-red-500 p-3 rounded"
                onPress={handleDelete}
              >
                <Text className="text-white">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
