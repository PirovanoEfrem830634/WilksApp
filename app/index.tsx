import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebaseconfig";
import { Platform } from "react-native";
import SplashPage from "./splashpage";

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [minSplashDone, setMinSplashDone] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") document.title = "WilksApp";

    const t = setTimeout(() => setMinSplashDone(true), 1800); // 1.8s (Apple-like)
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });

    return () => {
      clearTimeout(t);
      unsub();
    };
  }, []);

  // ✅ finché auth non è pronta o non è passato il tempo minimo → splash
  if (authLoading || !minSplashDone) return <SplashPage />;

  return <Redirect href={user ? "/homenew" : "/sign-in"} />;
}
