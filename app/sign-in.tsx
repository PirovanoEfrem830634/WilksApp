import React, { useState } from "react";
import {View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,} from "react-native";
import { Link } from "expo-router";

export default function SignIn() {
  // Stato per gestire l'input dell'email e della password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    // Dismiss della tastiera quando si clicca fuori dagli input
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      
      {/* Componente che gestisce lo spostamento degli input quando la tastiera è attiva */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Comportamento differente per iOS e Android
        className="flex-1 justify-center items-center bg-light px-6" // Layout centrato e padding laterale
      >
        <View className="w-full max-w-sm">
          {/* Titolo della pagina */}
          <Text className="text-3xl font-montserrat-bold text-primary mb-8 text-center">
            Sign In
          </Text>

          {/* --- Input per l'Email --- */}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#A9CCE3" // Colore del placeholder
            className="w-full border border-pale rounded-lg p-3 mb-4 text-primary font-opensans-regular bg-light"
            value={email} // Stato collegato al valore dell'input
            onChangeText={setEmail} // Aggiorna lo stato ad ogni digitazione
            keyboardType="email-address" // Tipo di tastiera per le email
            autoCapitalize="none" // Evita la capitalizzazione automatica
            autoCorrect={false} // Disabilita il correttore automatico
          />

          {/* --- Input per la Password --- */}
          <TextInput
            placeholder="Password"
            placeholderTextColor="#A9CCE3"
            className="w-full border border-pale rounded-lg p-3 mb-2 text-primary font-opensans-regular bg-light"
            value={password}
            onChangeText={setPassword}
            secureTextEntry // Nasconde i caratteri della password
          />

          {/* --- Link "Forgot Password" --- */}
          <Pressable>
            <Text className="text-secondary text-right mb-6 font-opensans-regular">
              Forgot Password?
            </Text>
          </Pressable>

          {/* --- Pulsante di Sign In --- */}
          <Pressable className="bg-primary p-4 rounded-lg shadow-md">
            <Text className="text-light text-center font-opensans-regular text-lg">
              Sign In
            </Text>
          </Pressable>

          {/* --- Divider per separare le sezioni --- */}
          <View className="my-6 border-t border-pale" />

          {/* --- Link per la Registrazione --- */}
          <Text className="text-center text-primary font-opensans-regular">
            Don't have an account?{" "}
            <Link href="/sign-in" className="text-secondary font-opensans-bold">
              Sign Up
            </Link>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
