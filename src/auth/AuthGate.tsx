import { useEffect, useRef, useState } from "react";
import React from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export type UserDoc = {
  createdAt?: any;
  email: string;
  lastLoginAt?: any;
  name: string;
  role: "pending" | "staff" | "admin" | "manager" | "housekeeping";
  status: "inactive" | "active";
};

function useUserDoc() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);

  // Prevent lastLoginAt update loop
  const didUpdateLastLoginRef = useRef(false);

  useEffect(() => {
    let unsubUserDoc: null | (() => void) = null;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setUserDoc(null);
      setLoading(true);
      didUpdateLastLoginRef.current = false;

      // cleanup any prior doc listener
      if (unsubUserDoc) {
        unsubUserDoc();
        unsubUserDoc = null;
      }

      if (!u) {
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", u.uid);

      unsubUserDoc = onSnapshot(
          ref,
          async (snap) => {
            try {
              // bootstrap user doc on first login
              if (!snap.exists()) {
                const payload: UserDoc = {
                  email: u.email ?? "",
                  name: u.displayName ?? "New User",
                  role: "pending",
                  status: "inactive",
                  createdAt: serverTimestamp(),
                  lastLoginAt: serverTimestamp(),
                };
                await setDoc(ref, payload);
                // snapshot will fire again with created data
                return;
              }

              const data = snap.data() as UserDoc;
              setUserDoc(data);
              setLoading(false);

              // update lastLoginAt once per auth session
              if (!didUpdateLastLoginRef.current) {
                didUpdateLastLoginRef.current = true;
                await updateDoc(ref, { lastLoginAt: serverTimestamp() });
              }
            } catch (e) {
              console.error("User doc gate error:", e);
              setUserDoc(null);
              setLoading(false);
            }
          },
          (err) => {
            console.error("User doc snapshot error:", err);
            setUserDoc(null);
            setLoading(false);
          }
      );
    });

    return () => {
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  return { loading, user, userDoc };
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, user } = useUserDoc();
  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RequireActive({ children }: { children: React.ReactNode }) {
  const { loading, user, userDoc } = useUserDoc();
  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!userDoc) return <div className="p-6">Could not load your account.</div>;
  if (userDoc.status !== "active") return <Navigate to="/pending" replace />;
  return <>{children}</>;
}

export function RequireRole({
                              role,
                              children,
                            }: {
  role: "admin" | "staff" | "manager" | "housekeeping";
  children: React.ReactNode;
}) {
  const { loading, user, userDoc } = useUserDoc();
  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!userDoc) return <div className="p-6">Could not load your account.</div>;
  if (userDoc.status !== "active") return <Navigate to="/pending" replace />;

  if (role === "admin" && userDoc.role !== "admin") return <Navigate to="/" replace />;
  if (role === "staff" && !(userDoc.role === "staff" || userDoc.role === "admin")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
