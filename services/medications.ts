// Farmaci: sottocollezione users/{patientId}/medications.
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const medsCol = (patientId: string) =>
  collection(db, "users", patientId, "medications");

// Tutti i farmaci del paziente (lettura una tantum).
export async function fetchMedications(patientId: string) {
  const snap = await getDocs(medsCol(patientId));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Listener realtime sui farmaci (più recenti prima).
// Restituisce la funzione di unsubscribe.
export function subscribeToMedications(
  patientId: string,
  onRows: (rows: Array<{ id: string } & Record<string, any>>) => void,
  onError?: (err: Error) => void
) {
  const q = query(medsCol(patientId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

// Aggiunge un farmaco; createdAt/createdBy sono gestiti qui.
export async function addMedication(
  patientId: string,
  data: Record<string, any>,
  createdByUid: string
) {
  const res = await addDoc(medsCol(patientId), {
    ...data,
    createdAt: Timestamp.now(),
    createdBy: createdByUid,
  });
  return res.id;
}
