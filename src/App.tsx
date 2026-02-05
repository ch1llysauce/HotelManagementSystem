import AppRoutes from "./routes";
import { useEffect } from "react";
import { db } from "./firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { useTheme } from "./context/ThemeContext";

export default function App() {
  const { setDarkMode } = useTheme();

  useEffect(() => {
    const ref = doc(db, "settings", "app");

    const unsub = onSnapshot(ref, (snap) => {
      const d = snap.data() as any;
      setDarkMode(!!d?.darkMode);
    });

    return () => unsub();
  }, [setDarkMode]);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <AppRoutes />
    </div>
  );
}
