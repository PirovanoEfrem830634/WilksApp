// Piano terapeutico: documento users/{patientId}/therapy_plan/current
// (scritto dal medico dalla dashboard, sola lettura per il paziente).
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// Piano corrente, o null se non presente.
export async function fetchTherapyPlan(patientId: string) {
  const snap = await getDoc(doc(db, "users", patientId, "therapy_plan", "current"));
  return snap.exists() ? snap.data() : null;
}
