import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Platform } from "react-native";
import SplashPage from "./splashpage";

export default function Index() {
  const { user, loadingAuth } = useAuth();
  const [minSplashDone, setMinSplashDone] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") document.title = "WilksApp";

    const t = setTimeout(() => setMinSplashDone(true), 1800); // 1.8s (Apple-like)
    return () => clearTimeout(t);
  }, []);

  // ✅ finché auth non è pronta o non è passato il tempo minimo → splash
  if (loadingAuth || !minSplashDone) return <SplashPage />;

  return <Redirect href={user ? "/homenew" : "/sign-in"} />;
}
