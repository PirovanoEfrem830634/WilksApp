// Profilo paziente: documento in /users (creato dal medico dalla dashboard).
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type PatientProfile = { id: string } & Record<string, any>;

// Documento paziente per email, o null se non esiste.
export async function findPatientByEmail(email: string): Promise<PatientProfile | null> {
  const snap = await getDocs(
    query(collection(db, "users"), where("email", "==", email))
  );
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// Documento paziente per firebase_uid, o null.
export async function findPatientByUid(uid: string): Promise<PatientProfile | null> {
  const snap = await getDocs(
    query(collection(db, "users"), where("firebase_uid", "==", uid), limit(1))
  );
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// Documento paziente per id, o null.
export async function fetchPatient(patientId: string): Promise<PatientProfile | null> {
  const snap = await getDoc(doc(db, "users", patientId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Collega l'account Firebase Auth al documento paziente (primo login).
export async function linkMobileAccount(patientId: string, uid: string) {
  await updateDoc(doc(db, "users", patientId), {
    firebase_uid: uid,
    has_mobile_account: true,
    mobile_linked_at: serverTimestamp(),
  });
}

// Aggiorna i campi del profilo paziente.
export async function updatePatientProfile(
  patientId: string,
  updates: Record<string, any>
) {
  await updateDoc(doc(db, "users", patientId), updates);
}
