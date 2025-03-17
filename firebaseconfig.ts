import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configurazione Firebase (usa i dati copiati da Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyDkLKo397p5BeuC6x7cauFbvjuO9QbeMDY",
  authDomain: "wilksapp.firebaseapp.com",
  projectId: "wilksapp",
  storageBucket: "wilksapp.firebasestorage.app",
  messagingSenderId: "892270456868",
  appId: "1:892270456868:web:5b34f244260f7787ff68b1",
};

// Inizializzazione di Firebase
const app = initializeApp(firebaseConfig);

// Export dei servizi di Auth e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
