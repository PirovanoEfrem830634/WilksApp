// Tracking giornaliero del paziente: documenti con id YYYY-MM-DD nelle
// sottocollezioni users/{patientId}/symptoms | sleep | diet.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export const todayKey = () => new Date().toISOString().split("T")[0];

const dayRef = (patientId: string, subcol: string, dayKey: string) =>
  doc(db, "users", patientId, subcol, dayKey);

// --- Sintomi ---

// Salva (merge) i sintomi del giorno; dataInserimento è gestito qui.
export async function saveDailySymptoms(
  patientId: string,
  data: Record<string, any>,
  dayKey: string = todayKey()
) {
  await setDoc(
    dayRef(patientId, "symptoms", dayKey),
    { ...data, dataInserimento: Timestamp.now() },
    { merge: true }
  );
}

// Tutte le rilevazioni sintomi (id documento = data).
export async function fetchAllSymptoms(patientId: string) {
  const snap = await getDocs(collection(db, "users", patientId, "symptoms"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// --- Sonno ---

// Sovrascrive il dato sonno del giorno; createdAt è gestito qui.
export async function saveDailySleep(
  patientId: string,
  data: Record<string, any>,
  dayKey: string = todayKey()
) {
  await setDoc(dayRef(patientId, "sleep", dayKey), {
    ...data,
    createdAt: Timestamp.now(),
  });
}

// Tutti i documenti di una sottocollezione di tracking del paziente.
export async function fetchAllEntries(patientId: string, subcol: string) {
  const snap = await getDocs(collection(db, `users/${patientId}/${subcol}`));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Documenti di una sottocollezione con `field` (Timestamp) nel range [start, end].
export async function fetchEntriesInRange(
  patientId: string,
  subcol: string,
  field: string,
  start: Date,
  end: Date
) {
  const q = query(
    collection(db, `users/${patientId}/${subcol}`),
    where(field, ">=", Timestamp.fromDate(start)),
    where(field, "<=", Timestamp.fromDate(end))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Tutte le rilevazioni sonno (id documento = data).
export async function fetchAllSleep(patientId: string) {
  const snap = await getDocs(collection(db, "users", patientId, "sleep"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// --- Dieta ---

export async function fetchDailyDiet(
  patientId: string,
  dayKey: string = todayKey()
) {
  const snap = await getDoc(dayRef(patientId, "diet", dayKey));
  return snap.exists() ? snap.data() : null;
}

// Salva (merge) la dieta del giorno; createdAt è gestito qui.
export async function saveDailyDiet(
  patientId: string,
  data: Record<string, any>,
  dayKey: string = todayKey()
) {
  await setDoc(
    dayRef(patientId, "diet", dayKey),
    { ...data, createdAt: Timestamp.now() },
    { merge: true }
  );
}
