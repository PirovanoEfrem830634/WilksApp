import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "patientDocId";

export async function setPatientDocId(id: string) {
  await AsyncStorage.setItem(KEY, id);
}

export async function getPatientDocId(): Promise<string | null> {
  return await AsyncStorage.getItem(KEY);
}

export async function clearPatientDocId() {
  await AsyncStorage.removeItem(KEY);
}
