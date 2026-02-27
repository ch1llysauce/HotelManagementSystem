import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Eye, EyeOff } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";


export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      nav("/dashboard", { replace: true });
    } catch (e: any) {
      setErr("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetMsg(null);

    const targetEmail = resetEmail.trim();
    if (!targetEmail) {
      setResetMsg("Please enter your email.");
      return;
    }

    try {
      setResetLoading(true);

      await sendPasswordResetEmail(auth, targetEmail);
      setResetMsg("If an account exists for that email, a reset link has been sent.");
    } catch (err: any) {
      setResetMsg("If an account exists for that email, a reset link has been sent.");
    } finally {
      setResetLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-500 rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Login to continue.</p>

        {err && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400 dark:bg-gray-800 dark:border-gray-700 text-gray-100"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Password
            </label>

            <div className="relative mt-1">
              <input
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                required
                className="
        w-full rounded-xl border
        px-3 py-2 pr-10
        outline-none
        focus:ring-2 focus:ring-sky-400
        dark:bg-gray-800 dark:border-gray-700 text-gray-100
      "
              />

              <button
                type="button"
                onClick={() => setShowPass((prev) => !prev)}
                className="
    absolute inset-y-0 right-3
    flex items-center
    bg-transparent
    border-none
    p-0
    outline-none
    focus:outline-none
    focus:ring-0
    text-white hover:text-gray-200
  "
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>

            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setResetEmail(email);
                setResetMsg(null);
                setForgotOpen(true);
              }}
              className="text-sm text-red-600 dark:text-sky-300 hover:bg-slate-700 hover:ease-in-out transition duration-200
  hover:underline hover:scale-105 bg-slate-300 dark:bg-slate-600"
            >
              Forgot password?
            </button>
          </div>
          <button
            disabled={loading}
            className="w-full rounded-xl bg-sky-500 text-white py-2 font-medium hover:bg-sky-600 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-600 dark:text-gray-200 mt-4">
          No account yet?{" "}
          <Link className="text-sky-600 dark:text-sky-300 hover:underline" to="/signup">
            Sign up
          </Link>
        </p>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-700 shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Reset password
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-200 mt-1">
              Enter your email and we'll send a reset link.
            </p>

            {resetMsg && (
              <div className="mt-4 rounded-xl bg-slate-100 dark:bg-slate-600 text-gray-800 dark:text-gray-100 px-4 py-3 text-sm">
                {resetMsg}
              </div>
            )}

            <form onSubmit={onResetPassword} className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <input
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  type="email"
                  required
                  className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400 dark:bg-gray-800 dark:border-gray-700 text-gray-100"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-600 text-gray-900 dark:text-gray-100"
                  disabled={resetLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="
  text-sm text-sky-600 dark:text-sky-300
  transition duration-200
  hover:underline hover:scale-105
"        >
                  {resetLoading ? "Sending..." : "Send link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
