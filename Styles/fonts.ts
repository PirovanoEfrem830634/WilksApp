import * as Font from "expo-font";

export async function loadFonts() {
  await Font.loadAsync({
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
  });
}
