// Clinical surveys: formato a documento giornaliero
//   users/{patientId}/clinical_surveys/{surveyKey}/entries/{YYYY-MM-DD}
// (stesso pattern di sleep/{YYYY-MM-DD})
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebaseconfig";

export type SurveyEntry = { entryDate?: string } & Record<string, any>;

export const todayId = () => new Date().toISOString().split("T")[0];

// Riferimento al documento del giorno per un questionario
export const surveyEntryRef = (
  patientId: string,
  surveyKey: string,
  dayId: string = todayId()
) => doc(db, "users", patientId, "clinical_surveys", surveyKey, "entries", dayId);

// Ultima compilazione di un questionario: entry con lastCompiledAt più recente.
// I documenti senza lastCompiledAt vengono ignorati dall'orderBy.
export async function fetchLatestSurveyEntry(
  patientId: string,
  surveyKey: string
): Promise<SurveyEntry | null> {
  const snap = await getDocs(
    query(
      collection(db, "users", patientId, "clinical_surveys", surveyKey, "entries"),
      orderBy("lastCompiledAt", "desc"),
      limit(1)
    )
  );
  if (snap.empty) return null;
  return { entryDate: snap.docs[0].id, ...snap.docs[0].data() };
}