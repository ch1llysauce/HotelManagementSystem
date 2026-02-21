import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Eye, EyeOff } from "lucide-react";


export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

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
    </div>
  );
}
