// app/index.tsx
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebaseconfig"; // usa il tuo path

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null; // opzionale: qui puoi renderizzare uno Splash

  // ✅ Se loggato → homenew; se no → sign-in
  return <Redirect href={user ? "/homenew" : "/sign-in"} />;
}
