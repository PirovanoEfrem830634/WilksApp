import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDkLKo397p5BeuC6x7cauFbvjuO9QbeMDY",
  authDomain: "wilksapp.firebaseapp.com",
  projectId: "wilksapp",
  storageBucket: "wilksapp.firebasestorage.app",
  messagingSenderId: "892270456868",
  appId: "1:892270456868:web:5b34f244260f7787ff68b1",
};

// Inizializzazione Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Export dei servizi
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const app = firebaseApp; // ✅ adesso l’export ha un nome diverso dalla dichiarazione
