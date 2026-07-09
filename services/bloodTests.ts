// Esami del sangue: sottocollezione users/{patientId}/blood_tests.
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Tutti gli esami, più recente prima (per createdAt).
export async function fetchBloodTests(patientId: string) {
  const snapshot = await getDocs(collection(db, `users/${patientId}/blood_tests`));
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as any))
    .sort(
      (a, b) =>
        new Date(b.createdAt.seconds * 1000).getTime() -
        new Date(a.createdAt.seconds * 1000).getTime()
    );
}

// Aggiunge un esame; createdAt è gestito qui.
export async function addBloodTest(patientId: string, data: Record<string, any>) {
  await addDoc(collection(db, `users/${patientId}/blood_tests`), {
    ...data,
    createdAt: serverTimestamp(),
  });
}
