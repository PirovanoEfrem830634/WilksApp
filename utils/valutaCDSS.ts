export type DatiSintomi = {
    ptosi: number;
    disfagia: boolean;
    pastoPesanteNotte: boolean;
  };
  
  export function valutaCDSS(data: DatiSintomi): string[] {
    const { ptosi, disfagia, pastoPesanteNotte } = data;
    const suggerimenti: string[] = [];
  
    if (ptosi >= 2 && disfagia) {
      suggerimenti.push("Consulta urgentemente il tuo neurologo.");
    } else if (ptosi >= 1.5) {
      suggerimenti.push("Osserva attentamente la ptosi, potrebbe peggiorare.");
    }
  
    if (pastoPesanteNotte) {
      suggerimenti.push("Evita pasti pesanti la sera per migliorare la qualità del sonno.");
    }
  
    if (suggerimenti.length === 0) {
      suggerimenti.push("Tutto sotto controllo! Continua così.");
    }
  
    return suggerimenti;
  }
  