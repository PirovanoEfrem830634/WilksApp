// cdssLogic.ts

// Types
type SleepEntry = {
  hours?: number;
  frequentWakeups?: boolean;
};

type SymptomEntry = {
  difficoltaRespiratorie?: boolean; // Respiratory difficulties
  affaticamentoMuscolare?: number;  // Muscle fatigue level (1–10)
};

type MedicationEntry = {
  notifications?: boolean; // Whether medication reminders are active
};

type CDSSInput = {
  sleep?: SleepEntry;
  symptoms?: SymptomEntry;
  medications?: MedicationEntry;
};

// Fuzzification functions
function fuzzifySleep(hours: number): "very_low" | "low" | "normal" {
  if (hours < 4) return "very_low";
  if (hours < 6) return "low";
  return "normal";
}

function fuzzifyFatigue(value: number): "low" | "moderate" | "high" {
  if (value <= 3) return "low";
  if (value <= 6) return "moderate";
  return "high";
}

// Fuzzy CDSS logic – clinical alerts
export function evaluateCDSS({ sleep, symptoms, medications }: CDSSInput): string[] {
  const alerts: string[] = [];

  const hours = sleep?.hours ?? 0;
  const fatigue = symptoms?.affaticamentoMuscolare ?? 0;

  const sleepLevel = fuzzifySleep(hours);
  const fatigueLevel = fuzzifyFatigue(fatigue);

  // 🔴 1. Respiratory alert
  if (symptoms?.difficoltaRespiratorie) {
    alerts.push("🫁 Respiratory difficulties detected – assess for urgent clinical support.");
  }

  // 🟠 2. Fuzzy insomnia
  if ((sleepLevel === "very_low" || sleepLevel === "low") && sleep?.frequentWakeups) {
    alerts.push("😴 Insufficient sleep with frequent wakeups – risk of insomnia.");
  }

  // 🔴 3. Severe fatigue
  if (fatigueLevel === "high") {
    alerts.push("💪 Severe muscle fatigue – consider adjusting the treatment plan.");
  }

  // 🟡 4. Notifications off
  if (medications?.notifications === false) {
    alerts.push("🔔 Medication reminders are disabled – risk of poor treatment adherence.");
  }

  return alerts;
}

// Fuzzy CDSS logic – personalized recommendations
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
  const fatigue = symptoms?.affaticamentoMuscolare ?? 0;

  const sleepLevel = fuzzifySleep(hours);
  const fatigueLevel = fuzzifyFatigue(fatigue);

  // 1. Sleep
  if (sleepLevel === "very_low") {
    tips.push("⏰ Sleeping less than 4 hours? Try establishing a consistent evening routine.");
  } else if (sleepLevel === "low") {
    tips.push("😴 Aim for 7–8 hours of sleep to improve energy and symptoms.");
  }

  if (sleep?.frequentWakeups) {
    tips.push("🌙 Frequent night awakenings? Try avoiding bright screens before bedtime.");
  }

  // 2. Medication adherence
  if (medications?.notifications === false) {
    tips.push("🔔 Enable medication reminders to help maintain regular intake.");
  }

  // 3. Muscle fatigue
  if (fatigueLevel === "moderate") {
    tips.push("💪 Light physical activity may help maintain muscle tone.");
  } else if (fatigueLevel === "high") {
    tips.push("🧘‍♀️ Rest adequately and discuss treatment adjustments with your doctor.");
  }

  // 4. Respiratory symptoms
  if (symptoms?.difficoltaRespiratorie) {
    tips.push("🫁 If you're experiencing breathing difficulties, avoid smoky environments and consult your doctor.");
  }

  // No advice necessary
  if (tips.length === 0) {
    tips.push("✅ No specific advice for now. Keep it up!");
  }

  return tips;
}