import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import type { Role } from "../utils/permissions";

const validRoles: Role[] = ["admin", "manager", "staff", "housekeeping"];

export default function Layout() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [role, setRole] = useState<Role>("staff");
  const [userName, setUserName] = useState<string>("User");
  const [loadingUser, setLoadingUser] = useState(true);

  const nav = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarVisible(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setLoadingUser(true);
        if (!user) {
          nav("/login", { replace: true });
          return;
        }

        if(!user.emailVerified) {
          nav("/login", { replace: true });
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          nav("/login", { replace: true });
          return;
        }

        const data = snap.data() as { name?: string; role?: string };

        setUserName(data.name?.trim() || "User");

        if (data.role && validRoles.includes(data.role as Role)) {
          setRole(data.role as Role);
        } else {
          setRole("staff");
        }
      } finally {
        setLoadingUser(false);
      }
    });

    return () => unsub();
  }, [nav]);

  return (
    <div className="flex min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <Sidebar
        visible={sidebarVisible}
        isMobile={isMobile}
        onClose={() => setSidebarVisible(false)}
        onItemClick={() => {

          if (isMobile) setSidebarVisible(false);
        }}
        role={role}
        userName={loadingUser ? "Loading..." : userName} />

      {isMobile && !sidebarVisible && (
        <button
          onClick={() => setSidebarVisible(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded bg-sky-500 text-white shadow-md transition-all duration-300 hover:bg-sky-600 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {isMobile && sidebarVisible && (
        <div
          onClick={() => setSidebarVisible(false)}
          className="
      fixed inset-0
      bg-black/40
      backdrop-blur-sm
      z-40
      transition-all duration-300
    "
        />
      )}

      <main
        className={`
          flex-1 overflow-y-auto bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50 p-8 md:p-12 transition-all duration-500
          ${sidebarVisible && !isMobile ? "md:ml-64" : "md:ml-0"}
          ml-0
        `}
      >
        <Outlet />
      </main>
    </div>
  );
}