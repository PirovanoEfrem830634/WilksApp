// Stato di autenticazione globale: un'unica sottoscrizione a Firebase Auth.
// Gli screen leggono l'utente da useAuth() invece di auth.currentUser
// o di sottoscrizioni onAuthStateChanged locali.
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { subscribeToAuth, type User } from "../services/auth";

type AuthState = {
  user: User | null;
  loadingAuth: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, loadingAuth: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
