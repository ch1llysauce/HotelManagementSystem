import { useState } from "react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Eye, EyeOff } from "lucide-react";
import ConfirmDialog from "../components/LogoutConfirmDialog";
import { type PasswordCheck, validatePassword } from "../utils/validatePassword";
import { sendEmailVerification } from "firebase/auth";

export default function Signup() {
    const nav = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [showPass, setShowPass] = useState(false);
    const [success, setSuccess] = useState(false);
    const [pwChecks, setPwChecks] = useState<PasswordCheck | null>(null);
    

    const passwordValid =
        pwChecks ? Object.values(pwChecks).every(Boolean) : false;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);

        const pw = pass;

        const v = validatePassword(pw);
        if (!v.ok) {
            setErr("Please satisfy all password requirements.");
            return;
        }

        if (pw !== confirm) return setErr("Passwords do not match.");

        try {
            setLoading(true);
            const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);

            if (name.trim()) {
                await updateProfile(cred.user, { displayName: name.trim() });
            }

            await sendEmailVerification(cred.user);
            await signOut(auth);
            setSuccess(true);
        } catch (e: any) {
            setErr(e?.message ?? "Signup failed.");
        } finally {
            setLoading(false);
        }
    }

    async function goToLogin() {
        await signOut(auth);
        nav("/login", { replace: true });
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-500 rounded-2xl shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Create account
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Sign up to continue.
                </p>

                {err && (
                    <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
                        {err}
                    </div>
                )}



                <form onSubmit={onSubmit} className="mt-5 space-y-4 text-white">
                    <div>
                        <label className="text-sm text-gray-700 dark:text-gray-300">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            autoComplete="name"
                            placeholder="Optional"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            type="email"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-700 dark:text-gray-300">Password</label>
                        <div className="relative mt-1">
                            <input
                                value={pass}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setPass(value);
                                    const result = validatePassword(value);
                                    setPwChecks(result.checks);
                                }}
                                type={showPass ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                className="w-full rounded-xl border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-sky-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((prev) => !prev)}
                                className="
    absolute inset-y-0 right-3 flex items-center
    bg-transparent p-0
    focus:outline-none focus:ring-0
    text-white hover:text-gray-200
  "                aria-label={showPass ? "Hide password" : "Show password"}
                            >
                                {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>

                        {pwChecks && (
                            <div className="mt-3 text-sm space-y-1">
                                <Rule ok={pwChecks.length} label="At least 8 characters" />
                                <Rule ok={pwChecks.upper} label="1 uppercase letter" />
                                <Rule ok={pwChecks.lower} label="1 lowercase letter" />
                                <Rule ok={pwChecks.number} label="1 number" />
                                <Rule ok={pwChecks.special} label="1 special character" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                            Confirm password
                        </label>
                        <input
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            type={showPass ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        />
                    </div>

                    <button
                        disabled={loading || !passwordValid || pass !== confirm}
                        className="w-full rounded-xl bg-sky-500 text-white py-2 font-medium hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating..." : "Sign up"}
                    </button>
                </form>

                <p className="text-sm text-gray-600 dark:text-gray-200 mt-4">
                    Already have an account?{" "}
                    <Link className="text-sky-600 dark:text-sky-300 hover:underline" to="/login">
                        Login
                    </Link>
                </p>
            </div>

            <ConfirmDialog
                open={success}
                title="Account created"
                message="We sent a verification link to your email. Please verify first, then log in."
                confirmText="Go to Login"
                confirmVariant="success"
                onConfirm={goToLogin}
            />
        </div>
    );
}

function Rule({ ok, label }: { ok: boolean; label: string }) {
    return (
        <div className={`flex items-center gap-2 ${ok ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-300"}`}>
            <span className="text-xs">{ok ? "✔" : "•"}</span>
            <span>{label}</span>
        </div>
    );
}