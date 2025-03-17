import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import { useRouter } from "expo-router";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
      });

      Alert.alert("Success", "User registered successfully!");
      router.push("/sign-in");
    } catch (error) {
      Alert.alert("Error");
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-light p-6">
      <Text className="text-3xl font-bold mb-8 text-primary">Sign Up</Text>

      <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} className="w-full border border-pale rounded-lg p-3 mb-4" />
      <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} className="w-full border border-pale rounded-lg p-3 mb-4" />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} className="w-full border border-pale rounded-lg p-3 mb-4" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry className="w-full border border-pale rounded-lg p-3 mb-6" />

      <Pressable onPress={handleSignUp} className="bg-primary p-4 rounded-lg shadow-md w-full">
        <Text className="text-light text-center font-bold text-lg">Sign Up</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/sign-in")} className="mt-4">
        <Text className="text-secondary">Already have an account? <Text className="font-bold">Sign In</Text></Text>
      </Pressable>
    </View>
  );
}
