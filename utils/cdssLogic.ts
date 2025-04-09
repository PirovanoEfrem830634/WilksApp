// cdssLogic.ts

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
  
  /**
   * Valuta i dati clinici dell’utente e restituisce una lista di alert da visualizzare.
   * Questa è la logica base per un CDSS focalizzato su Miastenia Gravis.
   */
  export function evaluateCDSS({ sleep, symptoms, medications }: CDSSInput): string[] {
    const alerts: string[] = [];
  
    // 🔴 1. Allerta respiratoria
    if (symptoms?.difficoltaRespiratorie) {
      alerts.push("🫁 Difficoltà respiratorie rilevate – valutare supporto clinico urgente.");
    }
  
    // 🟠 2. Insonnia sospetta
    if ((sleep?.hours || 0) < 5 && sleep?.frequentWakeups) {
      alerts.push("😴 Possibile insonnia – meno di 5h di sonno e risvegli frequenti.");
    }
  
    const affaticamento = Number(symptoms?.affaticamentoMuscolare || 0);

    if (affaticamento > 6) {
      alerts.push("💪 Affaticamento muscolare grave – considerare aggiustamento del piano terapeutico.");
    }    
  
    // 🟡 4. Notifiche farmaci disattivate
    if (medications?.notifications === false) {
      alerts.push("🔔 Notifiche dei farmaci disattivate – rischio di non aderenza alla terapia.");
    }
  
    return alerts;

  }

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
  
    // 1. Qualità del sonno
    if ((sleep?.hours || 0) < 6) {
      tips.push("😴 Cerca di dormire almeno 7-8 ore per migliorare i livelli di energia e i sintomi.");
    }
  
    if (sleep?.frequentWakeups) {
      tips.push("🌙 Risvegli notturni frequenti? Prova a evitare schermi luminosi prima di dormire.");
    }
  
    // 2. Adesione alla terapia
    if (medications?.notifications === false) {
      tips.push("🔔 Attiva le notifiche per ricordarti di assumere i farmaci con regolarità.");
    }
  
    // 3. Sintomi muscolari
    const affaticamento = Number(symptoms?.affaticamentoMuscolare || 0);

    if (affaticamento >= 4 && affaticamento <= 6) {
    tips.push("💪 Un'attività fisica leggera può aiutare a mantenere il tono muscolare.");
    }

    if (affaticamento > 6) {
    tips.push("🧘‍♀️ Riposa adeguatamente e valuta con il medico un aggiustamento terapeutico.");
    }

    // 4. Sintomi respiratori
    if (symptoms?.difficoltaRespiratorie) {
      tips.push("🫁 Se hai difficoltà respiratorie, evita ambienti fumosi e consulta il medico.");
    }
  
    if (tips.length === 0) {
      tips.push("✅ Nessun consiglio particolare al momento. Continua così!");
    }
  
    return tips;
  }
  
  