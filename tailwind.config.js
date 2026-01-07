/** @type {import('tailwindcss').Config} */
module.exports = {
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
        regular: ["SFProDisplay-Regular"],
        medium: ["SFProDisplay-Medium"],
        semibold: ["SFProDisplay-Semibold"],
        bold: ["SFProDisplay-Bold"],
      },
    },
  },
  plugins: [],
};
