const FontStyles = {
  size: {
    xs: 12,    // opzionale
    sm: 14,    // etichette, metadati
    base: 16,  // corpo testo
    md: 18,    // titoli di sezione
    lg: 20,    // dati principali, spotlight
    xl: 24,    // titoli grandi
  },

  weight: {
    regular: "SFProDisplay-Regular",
    semibold: "SFProDisplay-Semibold",
    bold: "SFProDisplay-Bold",
    black: "SFProDisplay-Black",
  },

  variants: {
    smallLabel: {
      fontFamily: "SFProDisplay-Regular",
      fontSize: 14,
    },
    smallLabelBold: {
      fontFamily: "SFProDisplay-Bold",
      fontSize: 14,
    },
    sectionTitle: {
      fontFamily: "SFProDisplay-Semibold",
      fontSize: 16,
    },
    body: {
      fontFamily: "SFProDisplay-Regular",
      fontSize: 16,
    },
    bodySemibold: {
      fontFamily: "SFProDisplay-Semibold",
      fontSize: 16,
    },
    dataValue: {
      fontFamily: "SFProDisplay-Bold",
      fontSize: 20,
    },
    mainTitle: {
      fontFamily: "SFProDisplay-Bold",
      fontSize: 24,
    },
  },
};

export default FontStyles;
