import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseconfig";
import { useRouter } from "expo-router";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Logged in successfully!");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error");
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-light p-6">
      <Text className="text-3xl font-bold mb-8 text-primary">Sign In</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} className="w-full border border-pale rounded-lg p-3 mb-4" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry className="w-full border border-pale rounded-lg p-3 mb-6" />

      <Pressable onPress={handleSignIn} className="bg-primary p-4 rounded-lg shadow-md w-full">
        <Text className="text-light text-center font-bold text-lg">Sign In</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/recover-password")} className="mt-4">
        <Text className="text-secondary">Forgot Password?</Text>
      </Pressable>
    </View>
  );
}
