import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, ActivityIndicator } from "react-native";
import { auth, db } from "../firebaseconfig"; // Assicurati che il percorso sia corretto
import { getDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

// Definizione dell'interfaccia per i dati utente
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  city?: string;
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData); // Casting a UserData
        } else {
          console.log("User document does not exist");
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  // Funzione per il logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/sign-in"); // Reindirizza alla pagina di login
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#2C3E50" />;
  }

  return (
    <View className="flex-1 bg-light px-6 py-10 items-center">
      <Text className="text-3xl font-bold text-primary mb-4">Profile</Text>

      {/* Immagine Profilo (Puoi cambiarla con una reale se disponibile) */}
      <Image
        source={{ uri: "https://via.placeholder.com/150" }}
        className="w-32 h-32 rounded-full mb-4"
      />

      {userData ? (
        <>
          <Text className="text-xl font-semibold text-primary">{userData.firstName} {userData.lastName}</Text>
          <Text className="text-lg text-secondary">{userData.email}</Text>

          <View className="mt-6 space-y-2">
            <Text className="text-lg">Età: {userData.age || "Non fornita"}</Text>
            <Text className="text-lg">Città: {userData.city || "Non fornita"}</Text>
          </View>

          {/* Pulsante di Logout */}
          <Pressable className="bg-red-500 p-3 rounded-lg mt-6" onPress={handleLogout}>
            <Text className="text-white text-center font-bold">Logout</Text>
          </Pressable>
        </>
      ) : (
        <Text className="text-lg text-gray-600">Nessun dato disponibile.</Text>
      )}
    </View>
  );
}
