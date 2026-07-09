import { SplashScreen, Stack } from "expo-router";
import "./globals.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { AuthProvider } from "../auth/AuthProvider";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // ✅ Keep only what you actually use
    "SFProDisplay-Regular": require("../assets/fonts/SF-Pro-Display-Regular.otf"),
    "SFProDisplay-Semibold": require("../assets/fonts/SF-Pro-Display-Semibold.otf"),
    "SFProDisplay-Bold": require("../assets/fonts/SF-Pro-Display-Bold.otf"),
    "SFProDisplay-Black": require("../assets/fonts/SF-Pro-Display-Black.otf"),
    "SFProDisplay-Medium": require("../assets/fonts/SF-Pro-Display-Medium.otf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
