import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Link } from "expo-router";
import { ArrowRight } from "lucide-react-native";

export default function HomePage() {
  return (
    <View className="flex-1 bg-light px-6 py-10 justify-between">
      {/* Header Section */}
      <View className="items-center mt-10">
        {/*<Image
          source={require("../assets/images/Wilks-logo.png")}
          className="w-32 h-32 mb-6"
          resizeMode="contain"
        />*/}
        <Text className="text-4xl font-montserrat-bold text-primary text-center">
          Welcome to WilksApp
        </Text>
        <Text className="text-secondary mt-2 text-center text-lg font-opensans-regular">
          Empowering Your Health Journey with Myasthenia Gravis
        </Text>
      </View>

      {/* Feature Cards */}
      <View className="space-y-4 mt-10">
        {[
          { title: "Track Symptoms", description: "Log and monitor your symptoms easily.", link: "/tracking" },
          { title: "Manage Medications", description: "Keep track of your treatments and schedules.", link: "/trackinghistory" },
          { title: "Community Support", description: "Connect with others living with Myasthenia Gravis.", link: "/community" },
        ].map((item, index) => (
          <Link href={item.link} asChild key={index}>
            <Pressable className="p-4 bg-white rounded-xl shadow-lg flex-row items-center justify-between">
              <View>
                <Text className="text-primary text-xl font-montserrat-semibold">{item.title}</Text>
                <Text className="text-secondary mt-1 font-opensans-regular">{item.description}</Text>
              </View>
              <ArrowRight size={24} color="#2C3E50" />
            </Pressable>
          </Link>
        ))}
      </View>

      {/* Footer Button to Return to Index */}
      <View className="mt-8">
        <Link href="/" asChild>
          <Pressable className="bg-primary p-4 rounded-lg shadow-md">
            <Text className="text-light text-center font-opensans-bold text-lg">
              Return to Index
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
