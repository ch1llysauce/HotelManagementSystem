import AppRoutes from "./routes";
import { useEffect } from "react";
import { db } from "./firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { useTheme } from "./context/ThemeContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebaseConfig";
import { getDoc } from "firebase/firestore";

export default function App() {
  const { setDarkMode } = useTheme();

  useEffect(() => {
    let unsubSettings: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubSettings) unsubSettings();

      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const d = userSnap.data() as any;

      if (d?.status !== "active") return;

      const ref = doc(db, "settings", "app");
      unsubSettings = onSnapshot(ref, (snap) => {
        const s = snap.data() as any;
        setDarkMode(!!s?.darkMode);
      });
    });

    return () => {
      unsubAuth();
      if (unsubSettings) unsubSettings();
    };
  }, [setDarkMode]);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <AppRoutes />
    </div>
  );
}