import { useEffect, useState } from "react";
import { signOut, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

type UserStatus = "pending" | "active";

export default function Pending() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [emailVerified, setEmailVerified] = useState(false);
  const [status, setStatus] = useState<UserStatus>("pending");

  async function fetchState() {
    const user = auth.currentUser;
    if (!user) return;

    await user.reload();
    const verified = !!user.emailVerified;
    setEmailVerified(verified);

    // fetch approval status from Firestore
    const snap = await getDoc(doc(db, "users", user.uid));
    const st = (snap.data()?.status as UserStatus) ?? "pending";
    setStatus(st);

    // if BOTH are okay, go dashboard
    if (verified && st === "active") {
      nav("/dashboard", { replace: true });
    }
  }

  useEffect(() => {
    fetchState();
  }, []);

  async function handleRefresh() {
    setMsg(null);
    setLoading(true);
    try {
      await fetchState();
      setMsg("Status updated.");
    } catch {
      setMsg("Failed to refresh status.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    const user = auth.currentUser;
    if (!user) return;

    setMsg(null);
    setLoading(true);
    try {
      await sendEmailVerification(user);
      setMsg("Verification email sent again.");
    } catch {
      setMsg("Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  }

  const needsEmail = !emailVerified;
  const needsApproval = status !== "active";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow p-6">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Account Setup
        </h1>

        <p className="mt-2 text-gray-600">
          Your account must pass these steps before you can continue:
        </p>

        <div className="mt-4 space-y-2 text-sm">
          <Step ok={!needsEmail} label="Email verified" />
          <Step ok={!needsApproval} label="Admin approved account" />
        </div>

        {needsEmail && (
          <div className="mt-4 rounded-xl bg-amber-50 text-amber-900 px-4 py-3 text-sm">
            Please verify your email. Check your inbox (and spam).
          </div>
        )}

        {!needsEmail && needsApproval && (
          <div className="mt-4 rounded-xl bg-blue-50 text-blue-900 px-4 py-3 text-sm">
            Email verified. Waiting for admin approval.
          </div>
        )}

        {msg && <div className="mt-3 text-sm text-gray-700">{msg}</div>}

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-white bg-slate-600 hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Status"}
          </button>

          {needsEmail && (
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-white bg-sky-500 hover:bg-sky-700 transition disabled:opacity-50"
            >
              Resend Verification Email
            </button>
          )}

          <button
            onClick={() => signOut(auth)}
            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-900 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 ${ok ? "text-green-700" : "text-gray-600"}`}>
      <span className="text-xs">{ok ? "✔" : "•"}</span>
      <span>{label}</span>
    </div>
  );
}