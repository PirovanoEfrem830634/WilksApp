// Attivazione account mobile: ticket in /activationTickets (creati dal
// medico dalla dashboard) + collegamento del documento paziente.
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

// Ticket per id, o null se non esiste.
export async function fetchActivationTicket(ticketId: string) {
  const snap = await getDoc(doc(db, "activationTickets", ticketId));
  return snap.exists() ? snap.data() : null;
}

// Consuma il ticket (NON cambia userId/email/code).
export async function consumeActivationTicket(
  ticketId: string,
  uid: string,
  email: string
) {
  await updateDoc(doc(db, "activationTickets", ticketId), {
    used: true,
    firebase_uid: uid,
    usedAt: serverTimestamp(),
    usedByUid: uid,
    usedByEmail: email,
  });
}

// Collega l'account Auth appena attivato al documento paziente.
export async function linkActivatedPatient(patientDocId: string, uid: string) {
  await updateDoc(doc(db, "users", patientDocId), {
    firebase_uid: uid,
    has_mobile_account: true,
    has_mobile_account_at: serverTimestamp(),
  });
}
