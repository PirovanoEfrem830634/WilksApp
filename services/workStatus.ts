// Stato lavorativo: documento users/{patientId}/work_status/baseline.
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const baselineRef = (patientId: string) =>
  doc(db, "users", patientId, "work_status", "baseline");

// Baseline corrente, o null se non presente.
export async function fetchWorkBaseline(patientId: string) {
  const snap = await getDoc(baselineRef(patientId));
  return snap.exists() ? snap.data() : null;
}

// Salva (merge) la baseline; compiledAt/compiledBy sono gestiti qui.
export async function saveWorkBaseline(
  patientId: string,
  data: Record<string, any>
) {
  await setDoc(
    baselineRef(patientId),
    { ...data, compiledAt: new Date(), compiledBy: "patient" },
    { merge: true }
  );
}
