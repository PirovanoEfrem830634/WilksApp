// src/data/infosheets.ts
export type InfoSection = { title: string; bullets?: string[]; body?: string };
export type InfoAction = { label: string; type: "tel" | "url" | "sheet"; value: string };
export type InfoSheet = {
  slug: string;
  title: string;
  subtitle?: string;
  icon: string;        // Ionicons name
  tint: string;        // hex o Colors.*
  chips?: string[];    // piccoli tag (es. “MG”, “ALERT”, “Terapia”)
  sections: InfoSection[];
  actions?: InfoAction[];
  updatedAt?: string;
};

export const INFO_SHEETS: InfoSheet[] = [
  {
    slug: "comportamenti-abitudini",
    title: "Abitudini di vita",
    icon: "leaf",
    tint: "#34C759",
    chips: ["MG", "Lifestyle"],
    sections: [
      {
        title: "Attività fisica",
        bullets: [
          "Preferisci attività **a bassa intensità** (camminata, cyclette leggera).",
          "Evita sforzi prolungati durante le fasi di **peggioramento dei sintomi**.",
          "Pianifica pause frequenti e idratazione."
        ],
      },
      {
        title: "Abitudini utili",
        bullets: [
          "Fraziona i pasti per ridurre l’affaticamento.",
          "Organizza le attività nelle ore della giornata in cui ti senti meglio.",
          "Limita calore eccessivo; attenzione a saune/ambienti molto caldi."
        ],
      }
    ],
    updatedAt: "2025-11-10",
  },
  {
    slug: "gestione-disfagia",
    title: "Gestione della disfagia",
    icon: "nutrition",
    tint: "#FF9500",
    chips: ["MG", "Deglutizione"],
    sections: [
      {
        title: "Strategie pratiche",
        bullets: [
          "Mangia lentamente, porzioni piccole, **mastica bene**.",
          "Preferisci consistenze **omogenee**; evita cibi friabili o sbriciolabili.",
          "Sorseggia liquidi addensati se consigliato dal medico/logopedista."
        ],
      },
      {
        title: "Quando fermarsi",
        bullets: [
          "Se tossisci spesso durante il pasto.",
          "Se avverti **voce gorgogliante** o senso di soffocamento.",
          "Se il pasto richiede troppo sforzo → pausa e riprendi più tardi."
        ],
      },
    ],
  },
  {
    slug: "scheda-alert",
    title: "Scheda ALERT",
    icon: "alert-circle",
    tint: "#FF3B30",
    chips: ["ALERT", "Urgenza"],
    sections: [
      {
        title: "Chiama subito il 112 / 118",
        bullets: [
          "**Dispnea** o difficoltà respiratoria marcata.",
          "**Disfagia severa** con rischio di aspirazione.",
          "Debolezza che **peggiora rapidamente** o incapacità a tenere il capo."
        ],
      },
      {
        title: "Azioni immediate",
        bullets: [
          "Sospendi attività, mantieni postura comoda (seduto/semiseduto).",
          "Non assumere farmaci extra senza indicazione medica.",
          "Se sei solo, **chiama un contatto di emergenza**."
        ],
      },
    ],
    actions: [
      { label: "Chiama 112", type: "tel", value: "112" }
    ],
  },
  {
    slug: "farmaci-controindicati",
    title: "Farmaci controindicati nella MG",
    icon: "close-circle",
    tint: "#5856D6",
    chips: ["Farmaci", "Sicurezza"],
    sections: [
      {
        title: "Categorie a rischio (esempi)",
        bullets: [
          "Aminoglicosidi (es. gentamicina).",
          "Fluorochinoloni (es. ciprofloxacina).",
          "Magnesio EV, alcuni **beta-bloccanti**, benzodiazepine: valutazione caso per caso.",
          "Consulta sempre il **neurologo** prima di iniziare nuovi farmaci."
        ],
      }
    ],
  },
  {
    slug: "gravidanza-mg",
    title: "Gravidanza e MG",
    icon: "female",
    tint: "#FF2D55",
    chips: ["MG", "Gravidanza"],
    sections: [
      {
        title: "Pianificazione",
        bullets: [
          "Confronta terapia attuale con neurologo e ginecologo.",
          "Valuta eventuali **switch terapeutici** prima del concepimento.",
          "Pianifica follow-up più ravvicinati."
        ],
      },
      {
        title: "Parto e post-parto",
        bullets: [
          "Coinvolgi anestesista; preferire tecniche che minimizzino fatica.",
          "Attenzione a farmaci che possono **peggiorare la MG**.",
          "Allattamento da valutare individualmente con il team clinico."
        ],
      },
    ],
  },
  {
    slug: "terapia-steroidea-cronica",
    title: "Terapia steroidea cronica",
    icon: "medkit",
    tint: "#0A84FF",
    chips: ["Terapia", "Follow-up"],
    sections: [
      {
        title: "Vademecum",
        bullets: [
          "**Dieta ipoglucidica** e controllo del peso.",
          "Controllo **MOC** e **visita oculistica** annuale.",
          "Monitoraggio **glicemia** ed **emoglobina glicata**.",
          "Non sospendere mai improvvisamente senza indicazione medica."
        ],
      }
    ],
  },
];
