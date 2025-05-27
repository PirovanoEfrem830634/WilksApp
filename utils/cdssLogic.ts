// cdssLogic.ts

// Tipi
type SleepEntry = {
  hours?: number;
  frequentWakeups?: boolean;
};

type SymptomEntry = {
  difficoltaRespiratorie?: boolean;
  affaticamentoMuscolare?: number;
};

type MedicationEntry = {
  notifications?: boolean;
};

type CDSSInput = {
  sleep?: SleepEntry;
  symptoms?: SymptomEntry;
  medications?: MedicationEntry;
};

// Funzioni di fuzzyficazione
function fuzzifySleep(hours: number): "molto_basso" | "basso" | "normale" {
  if (hours < 4) return "molto_basso";
  if (hours < 6) return "basso";
  return "normale";
}

function fuzzifyFatigue(value: number): "basso" | "moderato" | "alto" {
  if (value <= 3) return "basso";
  if (value <= 6) return "moderato";
  return "alto";
}

// Logica CDSS fuzzy – alert clinici
export function evaluateCDSS({ sleep, symptoms, medications }: CDSSInput): string[] {
  const alerts: string[] = [];

  const hours = sleep?.hours ?? 0;
  const affaticamento = symptoms?.affaticamentoMuscolare ?? 0;

  const sleepLevel = fuzzifySleep(hours);
  const fatigueLevel = fuzzifyFatigue(affaticamento);

  // 🔴 1. Allerta respiratoria
  if (symptoms?.difficoltaRespiratorie) {
    alerts.push("🫁 Difficoltà respiratorie rilevate – valutare supporto clinico urgente.");
  }

  // 🟠 2. Insonnia fuzzy
  if ((sleepLevel === "molto_basso" || sleepLevel === "basso") && sleep?.frequentWakeups) {
    alerts.push("😴 Sonno insufficiente con risvegli frequenti – rischio di insonnia.");
  }

  // 🔴 3. Affaticamento severo
  if (fatigueLevel === "alto") {
    alerts.push("💪 Affaticamento muscolare grave – considerare aggiustamento del piano terapeutico.");
  }

  // 🟡 4. Notifiche disattivate
  if (medications?.notifications === false) {
    alerts.push("🔔 Notifiche dei farmaci disattivate – rischio di non aderenza alla terapia.");
  }

  return alerts;
}

// Logica CDSS fuzzy – consigli personalizzati
export function getPersonalizedAdvice({
  sleep,
  symptoms,
  medications,
}: {
  sleep?: any;
  symptoms?: any;
  medications?: any;
}): string[] {
  const tips: string[] = [];

  const hours = sleep?.hours ?? 0;
  const affaticamento = symptoms?.affaticamentoMuscolare ?? 0;

  const sleepLevel = fuzzifySleep(hours);
  const fatigueLevel = fuzzifyFatigue(affaticamento);

  // 1. Sonno
  if (sleepLevel === "molto_basso") {
    tips.push("⏰ Dormi meno di 4h? Prova a impostare una routine serale costante.");
  } else if (sleepLevel === "basso") {
    tips.push("😴 Cerca di dormire almeno 7-8 ore per migliorare i livelli di energia e i sintomi.");
  }

  if (sleep?.frequentWakeups) {
    tips.push("🌙 Risvegli notturni frequenti? Prova a evitare schermi luminosi prima di dormire.");
  }

  // 2. Adesione ai farmaci
  if (medications?.notifications === false) {
    tips.push("🔔 Attiva le notifiche per ricordarti di assumere i farmaci con regolarità.");
  }

  // 3. Affaticamento muscolare
  if (fatigueLevel === "moderato") {
    tips.push("💪 Un'attività fisica leggera può aiutare a mantenere il tono muscolare.");
  } else if (fatigueLevel === "alto") {
    tips.push("🧘‍♀️ Riposa adeguatamente e valuta con il medico un aggiustamento terapeutico.");
  }

  // 4. Sintomi respiratori
  if (symptoms?.difficoltaRespiratorie) {
    tips.push("🫁 Se hai difficoltà respiratorie, evita ambienti fumosi e consulta il medico.");
  }

  // Nessun consiglio necessario
  if (tips.length === 0) {
    tips.push("✅ Nessun consiglio particolare al momento. Continua così!");
  }

  return tips;
}
