import { View, Text, TouchableOpacity, Image } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View className="flex-1 justify-center items-center bg-light p-4">
      {/* Logo 
      <Image
        source={require("../assets/images/react-logo.png")}
        className="w-40 h-40 mb-6"
        resizeMode="contain"
      />*/}

      {/* Messaggio di Benvenuto */}
      <Text className="text-primary text-2xl font-montserrat-bold mb-4">
        Benvenuto in WilksApp!
      </Text>

      <Text className="text-secondary text-base text-center mb-8">
        Scopri, esplora e gestisci tutto in un'unica app.
      </Text>

      {/* Pulsante Esplora */}
      <TouchableOpacity className="bg-primary p-4 rounded-xl mb-4 w-60">
        <Link href="/explore" className="text-light text-center text-lg font-opensans-regular">
          Inizia a Esplorare
        </Link>
      </TouchableOpacity>

      {/* Pulsante Login */}
      <TouchableOpacity className="border border-secondary p-4 rounded-xl w-60">
        <Link href="/sign-in" className="text-secondary text-center text-lg font-opensans-regular">
          Accedi
        </Link>
      </TouchableOpacity>

      {/* Footer Navigazione */}
      <View className="flex-row justify-center mt-10 space-x-4">
        <Link href="/profile" className="text-primary text-base">Profilo</Link>
        <Link href="/properties/1" className="text-primary text-base">Proprietà</Link>
      </View>
    </View>
  );
}
