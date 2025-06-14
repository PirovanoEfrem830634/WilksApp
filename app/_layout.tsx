import { SplashScreen, Stack } from "expo-router";
import "./globals.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({

    // San Francisco Fonts
    "SFProDisplay-Black": require("../assets/fonts/SF-Pro-Display-Black.otf"),
    "SFProDisplay-BlackItalic": require("../assets/fonts/SF-Pro-Display-BlackItalic.otf"),
    "SFProDisplay-Bold": require("../assets/fonts/SF-Pro-Display-Bold.otf"),
    "SFProDisplay-BoldItalic": require("../assets/fonts/SF-Pro-Display-BoldItalic.otf"),
    "SFProDisplay-Heavy": require("../assets/fonts/SF-Pro-Display-Heavy.otf"),
    "SFProDisplay-HeavyItalic": require("../assets/fonts/SF-Pro-Display-HeavyItalic.otf"),
    "SFProDisplay-Light": require("../assets/fonts/SF-Pro-Display-Light.otf"),
    "SFProDisplay-LightItalic": require("../assets/fonts/SF-Pro-Display-LightItalic.otf"),
    "SFProDisplay-Medium": require("../assets/fonts/SF-Pro-Display-Medium.otf"),
    "SFProDisplay-MediumItalic": require("../assets/fonts/SF-Pro-Display-MediumItalic.otf"),
    "SFProDisplay-Regular": require("../assets/fonts/SF-Pro-Display-Regular.otf"),
    "SFProDisplay-RegularItalic": require("../assets/fonts/SF-Pro-Display-RegularItalic.otf"),
    "SFProDisplay-Semibold": require("../assets/fonts/SF-Pro-Display-Semibold.otf"),
    "SFProDisplay-SemiboldItalic": require("../assets/fonts/SF-Pro-Display-SemiboldItalic.otf"),
    "SFProDisplay-Thin": require("../assets/fonts/SF-Pro-Display-Thin.otf"),
    "SFProDisplay-ThinItalic": require("../assets/fonts/SF-Pro-Display-ThinItalic.otf"),
    "SFProDisplay-Ultralight": require("../assets/fonts/SF-Pro-Display-Ultralight.otf"),
    "SFProDisplay-UltralightItalic": require("../assets/fonts/SF-Pro-Display-UltralightItalic.otf"),

    // Montserrat Fonts
    "Montserrat-Black": require("../assets/fonts/Montserrat-Black.ttf"),
    "Montserrat-BlackItalic": require("../assets/fonts/Montserrat-BlackItalic.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-BoldItalic": require("../assets/fonts/Montserrat-BoldItalic.ttf"),
    "Montserrat-ExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-ExtraBoldItalic": require("../assets/fonts/Montserrat-ExtraBoldItalic.ttf"),
    "Montserrat-ExtraLight": require("../assets/fonts/Montserrat-ExtraLight.ttf"),
    "Montserrat-ExtraLightItalic": require("../assets/fonts/Montserrat-ExtraLightItalic.ttf"),
    "Montserrat-Italic": require("../assets/fonts/Montserrat-Italic.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-LightItalic": require("../assets/fonts/Montserrat-LightItalic.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-MediumItalic": require("../assets/fonts/Montserrat-MediumItalic.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-SemiBoldItalic": require("../assets/fonts/Montserrat-SemiBoldItalic.ttf"),
    "Montserrat-Thin": require("../assets/fonts/Montserrat-Thin.ttf"),
    "Montserrat-ThinItalic": require("../assets/fonts/Montserrat-ThinItalic.ttf"),

    // OpenSans Fonts
    "OpenSans-Bold": require("../assets/fonts/OpenSans-Bold.ttf"),
    "OpenSans-BoldItalic": require("../assets/fonts/OpenSans-BoldItalic.ttf"),
    "OpenSans-ExtraBold": require("../assets/fonts/OpenSans-ExtraBold.ttf"),
    "OpenSans-ExtraBoldItalic": require("../assets/fonts/OpenSans-ExtraBoldItalic.ttf"),
    "OpenSans-Italic": require("../assets/fonts/OpenSans-Italic.ttf"),
    "OpenSans-Light": require("../assets/fonts/OpenSans-Light.ttf"),
    "OpenSans-LightItalic": require("../assets/fonts/OpenSans-LightItalic.ttf"),
    "OpenSans-Medium": require("../assets/fonts/OpenSans-Medium.ttf"),
    "OpenSans-MediumItalic": require("../assets/fonts/OpenSans-MediumItalic.ttf"),
    "OpenSans-Regular": require("../assets/fonts/OpenSans-Regular.ttf"),
    "OpenSans-SemiBold": require("../assets/fonts/OpenSans-SemiBold.ttf"),
    "OpenSans-SemiBoldItalic": require("../assets/fonts/OpenSans-SemiBoldItalic.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
  
}