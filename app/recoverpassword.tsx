import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseconfig";
import { useRouter } from "expo-router";

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset email sent!");
      router.push("/sign-in");
    } catch (error) {
      Alert.alert("Error");
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-light p-6">
      <Text className="text-3xl font-bold mb-8 text-primary">Recover Password</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} className="w-full border border-pale rounded-lg p-3 mb-6" />

      <Pressable onPress={handlePasswordReset} className="bg-primary p-4 rounded-lg shadow-md w-full">
        <Text className="text-light text-center font-bold text-lg">Send Recovery Email</Text>
      </Pressable>
    </View>
  );
}
