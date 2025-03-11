import * as Font from "expo-font";

export async function loadFonts() {
  await Font.loadAsync({
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

    // Open Sans Condensed Fonts
    "OpenSans_Condensed-Bold": require("../assets/fonts/OpenSans_Condensed-Bold.ttf"),
    "OpenSans_Condensed-BoldItalic": require("../assets/fonts/OpenSans_Condensed-BoldItalic.ttf"),
    "OpenSans_Condensed-ExtraBold": require("../assets/fonts/OpenSans_Condensed-ExtraBold.ttf"),
    "OpenSans_Condensed-ExtraBoldItalic": require("../assets/fonts/OpenSans_Condensed-ExtraBoldItalic.ttf"),
    "OpenSans_Condensed-Italic": require("../assets/fonts/OpenSans_Condensed-Italic.ttf"),
    "OpenSans_Condensed-Light": require("../assets/fonts/OpenSans_Condensed-Light.ttf"),
    "OpenSans_Condensed-LightItalic": require("../assets/fonts/OpenSans_Condensed-LightItalic.ttf"),
    "OpenSans_Condensed-Medium": require("../assets/fonts/OpenSans_Condensed-Medium.ttf"),
    "OpenSans_Condensed-MediumItalic": require("../assets/fonts/OpenSans_Condensed-MediumItalic.ttf"),
    "OpenSans_Condensed-Regular": require("../assets/fonts/OpenSans_Condensed-Regular.ttf"),
    "OpenSans_Condensed-SemiBold": require("../assets/fonts/OpenSans_Condensed-SemiBold.ttf"),
    "OpenSans_Condensed-SemiBoldItalic": require("../assets/fonts/OpenSans_Condensed-SemiBoldItalic.ttf"),

    // Open Sans Fonts
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
}
