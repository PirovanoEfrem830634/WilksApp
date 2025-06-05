const FontStyles = {
  size: {
    xs: 12,
    sm: 14,       // per descrizioni, label
    base: 16,     // corpo testo principale
    md: 18,       // sottotitoli o info evidenziate
    lg: 20,       // titoli secondari
    xl: 24,       // titoli principali
  },
  weight: {
    regular: "SFProDisplay-Regular",    // testuale generico
    semibold: "SFProDisplay-Semibold",  // etichette e dati evidenziati
    bold: "SFProDisplay-Bold",          // titoli principali
  },
  variants: {
    label: {
      fontFamily: "SFProDisplay-Regular",
      fontSize: 14,
    },
    labelBold: {
      fontFamily: "SFProDisplay-Bold",
      fontSize: 14,
    },
    info: {
      fontFamily: "SFProDisplay-Semibold",
      fontSize: 14,
    },
    body: {
      fontFamily: "SFProDisplay-Regular",
      fontSize: 16,
    },
    bodySemibold: {
      fontFamily: "SFProDisplay-Semibold",
      fontSize: 16,
    },
    title: {
      fontFamily: "SFProDisplay-Bold",
      fontSize: 20,
    },
  }
};

export default FontStyles;
