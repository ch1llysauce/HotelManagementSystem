import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Pending() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow p-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Account Pending</h1>
        <p className="mt-2 text-gray-600">
          Your account is created, but access hasn't been approved yet.
          Please contact the administrator or wait for approval.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 rounded-xl text-white bg-slate-500 hover:bg-gray-800 transition"
          >
            Refresh
          </button>
          <button
            onClick={() => signOut(auth)}
            className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-900 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
