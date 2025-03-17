import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  Modal,
  Alert,
} from "react-native";
import Slider from '@react-native-community/slider';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Activity,
  Eye,
  Wind,
  ChevronsDown,
  DivideCircle,
  Mic,
} from "lucide-react-native";

// Type per i dati del form
type FormDataType = {
  debolezzaMuscolare: boolean;
  andamentoSintomi: string;
  affaticamentoMuscolare: number;
  disfagia: boolean;
  disartria: boolean;
  ptosi: boolean;
  diplopia: boolean;
  difficoltaRespiratorie: boolean;
};

export default function SymptomTracking() {
  const [formData, setFormData] = useState<FormDataType>({
    debolezzaMuscolare: false,
    andamentoSintomi: "",
    affaticamentoMuscolare: 0,
    disfagia: false,
    disartria: false,
    ptosi: false,
    diplopia: false,
    difficoltaRespiratorie: false,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Funzione per gestire i cambiamenti dei dati
  const handleInputChange = <K extends keyof FormDataType>(
    field: K,
    value: FormDataType[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Funzione per salvare i dati usando AsyncStorage
  const submitData = async () => {
    const today = new Date().toISOString().split("T")[0];

    try {
      const existingData = await AsyncStorage.getItem(today);
      if (!existingData) {
        await AsyncStorage.setItem(today, JSON.stringify(formData));
      } else {
        // Se i dati esistono, li aggiorna
        await AsyncStorage.mergeItem(today, JSON.stringify(formData));
      }

      console.log("Submitted Data:", formData);
      setShowSuccessModal(true); // Mostra popup di successo
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save symptoms. Please try again.");
    }
  };

  return (
    <ScrollView className="p-4">
      <Text className="text-3xl font-bold mb-6 text-center">Daily Symptom Tracking</Text>

      {/* Muscle Weakness */}
      <View
        className={`mb-4 p-4 rounded-lg shadow-md bg-white ${
          formData.debolezzaMuscolare ? "border-2 border-blue-500" : "border border-gray-200"
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Activity size={24} color="#2C3E50" />
            <Text className="text-lg ml-2">Muscle Weakness</Text>
          </View>
          <Switch
            value={formData.debolezzaMuscolare}
            onValueChange={(value) => handleInputChange("debolezzaMuscolare", value)}
          />
        </View>
      </View>

      {/* Symptom Trend */}
      <View className="mb-4 p-4 rounded-lg shadow-md bg-white border border-gray-200">
        <Text className="text-lg mb-2">Symptom Trend</Text>
        <TextInput
          placeholder="Stabile, Peggiorato, Migliorato"
          value={formData.andamentoSintomi}
          onChangeText={(value) => handleInputChange("andamentoSintomi", value)}
          className="border p-2 rounded border-gray-300"
        />
      </View>

      {/* Muscle Fatigue */}
      <View className="mb-4 p-4 rounded-lg shadow-md bg-white border border-gray-200">
        <Text className="text-lg mb-2">Muscle Fatigue (0-10)</Text>
        <Slider
          minimumValue={0}
          maximumValue={10}
          step={1}
          minimumTrackTintColor="#2C3E50"
          maximumTrackTintColor="#A9CCE3"
          thumbTintColor="#5DADE2"
          value={formData.affaticamentoMuscolare}
          onValueChange={(value) => handleInputChange("affaticamentoMuscolare", value)}
        />
        <Text className="text-center mt-2">{formData.affaticamentoMuscolare}</Text>
      </View>

      {/* Other Symptoms */}
      {[
        { label: "Swallowing Difficulty", key: "disfagia", icon: <ChevronsDown size={24} color="#2C3E50" /> },
        { label: "Speech Difficulty", key: "disartria", icon: <Mic size={24} color="#2C3E50" /> },
        { label: "Ptosis (Drooping Eyelids)", key: "ptosi", icon: <Eye size={24} color="#2C3E50" /> },
        { label: "Double Vision", key: "diplopia", icon: <DivideCircle size={24} color="#2C3E50" /> },
        { label: "Breathing Difficulties", key: "difficoltaRespiratorie", icon: <Wind size={24} color="#2C3E50" /> },
      ].map((item) => (
        <View
          key={item.key}
          className={`mb-4 p-4 rounded-lg shadow-md bg-white ${
            formData[item.key] ? "border-2 border-blue-500" : "border border-gray-200"
          }`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {item.icon}
              <Text className="text-lg ml-2">{item.label}</Text>
            </View>
            <Switch
              value={formData[item.key]}
              onValueChange={(value) => handleInputChange(item.key, value)}
            />
          </View>
        </View>
      ))}

      {/* Submit Button */}
      <Pressable
        onPress={submitData}
        className="bg-primary p-4 rounded-lg mt-4 shadow-lg"
      >
        <Text className="text-white text-center font-bold text-lg">Submit</Text>
      </Pressable>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg shadow-lg">
            <Text className="text-lg font-bold text-primary mb-4">
              Symptoms Saved Successfully!
            </Text>
            <Pressable
              onPress={() => setShowSuccessModal(false)}
              className="bg-primary p-3 rounded-lg mt-2"
            >
              <Text className="text-white text-center">OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
