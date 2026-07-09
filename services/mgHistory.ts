// Anamnesi MG: documento users/{patientId}/history/mg.
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

const mgHistoryRef = (patientId: string) =>
  doc(db, "users", patientId, "history", "mg");

// Anamnesi corrente, o null se non presente.
export async function fetchMgHistory(patientId: string) {
  const snap = await getDoc(mgHistoryRef(patientId));
  return snap.exists() ? snap.data() : null;
}

// Salva (merge) l'anamnesi; lastUpdatedAt è gestito qui.
// Eventuali campi Date (es. thymectomyDate) vengono convertiti in
// Timestamp automaticamente dal SDK Firestore.
export async function saveMgHistory(
  patientId: string,
  payload: Record<string, any>
) {
  await setDoc(
    mgHistoryRef(patientId),
    { ...payload, lastUpdatedAt: Timestamp.now() },
    { merge: true }
  );
}
