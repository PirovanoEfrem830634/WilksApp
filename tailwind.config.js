/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2C3E50",
        secondary: "#5DADE2",
        accent: "#A9CCE3",
        pale: "#D4E6F1",
        light: "#FDFEFE",
      },
      fontFamily: {
        // Montserrat
        "montserrat-black": ["Montserrat-Black", "sans-serif"],
        "montserrat-black-italic": ["Montserrat-BlackItalic", "sans-serif"],
        "montserrat-bold": ["Montserrat-Bold", "sans-serif"],
        "montserrat-bold-italic": ["Montserrat-BoldItalic", "sans-serif"],
        "montserrat-extrabold": ["Montserrat-ExtraBold", "sans-serif"],
        "montserrat-extrabold-italic": ["Montserrat-ExtraBoldItalic", "sans-serif"],
        "montserrat-extralight": ["Montserrat-ExtraLight", "sans-serif"],
        "montserrat-extralight-italic": ["Montserrat-ExtraLightItalic", "sans-serif"],
        "montserrat-italic": ["Montserrat-Italic", "sans-serif"],
        "montserrat-light": ["Montserrat-Light", "sans-serif"],
        "montserrat-light-italic": ["Montserrat-LightItalic", "sans-serif"],
        "montserrat-medium": ["Montserrat-Medium", "sans-serif"],
        "montserrat-medium-italic": ["Montserrat-MediumItalic", "sans-serif"],
        "montserrat-regular": ["Montserrat-Regular", "sans-serif"],
        "montserrat-semibold": ["Montserrat-SemiBold", "sans-serif"],
        "montserrat-semibold-italic": ["Montserrat-SemiBoldItalic", "sans-serif"],
        "montserrat-thin": ["Montserrat-Thin", "sans-serif"],
        "montserrat-thin-italic": ["Montserrat-ThinItalic", "sans-serif"],

        // OpenSans Condensed
        "opensans-condensed-bold": ["OpenSans_Condensed-Bold", "sans-serif"],
        "opensans-condensed-bolditalic": ["OpenSans_Condensed-BoldItalic", "sans-serif"],
        "opensans-condensed-extrabold": ["OpenSans_Condensed-ExtraBold", "sans-serif"],
        "opensans-condensed-extrabolditalic": ["OpenSans_Condensed-ExtraBoldItalic", "sans-serif"],
        "opensans-condensed-italic": ["OpenSans_Condensed-Italic", "sans-serif"],
        "opensans-condensed-light": ["OpenSans_Condensed-Light", "sans-serif"],
        "opensans-condensed-lightitalic": ["OpenSans_Condensed-LightItalic", "sans-serif"],
        "opensans-condensed-medium": ["OpenSans_Condensed-Medium", "sans-serif"],
        "opensans-condensed-mediumitalic": ["OpenSans_Condensed-MediumItalic", "sans-serif"],
        "opensans-condensed-regular": ["OpenSans_Condensed-Regular", "sans-serif"],
        "opensans-condensed-semibold": ["OpenSans_Condensed-SemiBold", "sans-serif"],
        "opensans-condensed-semibolditalic": ["OpenSans_Condensed-SemiBoldItalic", "sans-serif"],

        // OpenSans Semi Condensed
        "opensans-semicon-bold": ["OpenSans_SemiCondensed-Bold", "sans-serif"],
        "opensans-semicon-bolditalic": ["OpenSans_SemiCondensed-BoldItalic", "sans-serif"],
        "opensans-semicon-extrabold": ["OpenSans_SemiCondensed-ExtraBold", "sans-serif"],
        "opensans-semicon-extrabolditalic": ["OpenSans_SemiCondensed-ExtraBoldItalic", "sans-serif"],
        "opensans-semicon-italic": ["OpenSans_SemiCondensed-Italic", "sans-serif"],
        "opensans-semicon-light": ["OpenSans_SemiCondensed-Light", "sans-serif"],
        "opensans-semicon-lightitalic": ["OpenSans_SemiCondensed-LightItalic", "sans-serif"],
        "opensans-semicon-medium": ["OpenSans_SemiCondensed-Medium", "sans-serif"],
        "opensans-semicon-mediumitalic": ["OpenSans_SemiCondensed-MediumItalic", "sans-serif"],
        "opensans-semicon-regular": ["OpenSans_SemiCondensed-Regular", "sans-serif"],
        "opensans-semicon-semibold": ["OpenSans_SemiCondensed-SemiBold", "sans-serif"],
        "opensans-semicon-semibolditalic": ["OpenSans_SemiCondensed-SemiBoldItalic", "sans-serif"],

        // OpenSans Standard
        "opensans-bold": ["OpenSans-Bold", "sans-serif"],
        "opensans-bolditalic": ["OpenSans-BoldItalic", "sans-serif"],
        "opensans-extrabold": ["OpenSans-ExtraBold", "sans-serif"],
        "opensans-extrabolditalic": ["OpenSans-ExtraBoldItalic", "sans-serif"],
        "opensans-italic": ["OpenSans-Italic", "sans-serif"],
        "opensans-light": ["OpenSans-Light", "sans-serif"],
        "opensans-lightitalic": ["OpenSans-LightItalic", "sans-serif"],
        "opensans-medium": ["OpenSans-Medium", "sans-serif"],
        "opensans-mediumitalic": ["OpenSans-MediumItalic", "sans-serif"],
        "opensans-regular": ["OpenSans-Regular", "sans-serif"],
        "opensans-semibold": ["OpenSans-SemiBold", "sans-serif"],
        "opensans-semibolditalic": ["OpenSans-SemiBoldItalic", "sans-serif"],

        // SpaceMono
        "spacemono-regular": ["SpaceMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
}