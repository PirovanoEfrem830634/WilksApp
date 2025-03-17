import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
    
    <Text className="text-secondary text-lg font-opensans-light">Welcome with OpenSans Light</Text>

    <Link href="/sign-in">Signin</Link>
    <Link href="/explore">Explore</Link>
    <Link href="/profile">Profile</Link>
    <Link href="/properties/1">Property</Link>
    <Link href="/trydesign">try</Link>
    <Link href="/home">Home</Link>
    <Link href="/tracking">Tracking</Link>
    <Link href="/trackinghistory">Tracking History</Link>
    <Link href="/predictive">Predictive</Link>

    </View>
  );
}
