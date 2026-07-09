// Autenticazione: login, logout e sottoscrizione allo stato utente.
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

export type { User };

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signIn(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

// Crea l'account Auth; se l'email esiste già, effettua il sign-in.
// Restituisce l'uid dell'utente autenticato.
export async function signUpOrSignIn(email: string, password: string): Promise<string> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user.uid;
  } catch (err: any) {
    if (err?.code === "auth/email-already-in-use") {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user.uid;
    }
    throw err;
  }
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function sendPasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email);
}
