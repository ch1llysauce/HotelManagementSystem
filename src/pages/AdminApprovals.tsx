import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: "pending" | "staff" | "admin";
  status: "inactive" | "active";
};

export default function AdminApprovals() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const q = query(collection(db, "users"), where("status", "==", "inactive"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: UserRow[] = snap.docs.map((d) => {
          const data = d.data() as Omit<UserRow, "id">;
          return { id: d.id, ...data };
        });
        setUsers(rows);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  async function approve(uid: string, newRole: "staff" | "admin") {
    await updateDoc(doc(db, "users", uid), {
      role: newRole,
      status: "active",
    });
  }

  if (loading) return <div className="p-6">Loading approvals…</div>;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900">User Approvals</h1>
        <p className="mt-1 text-gray-600">Approve accounts to activate access.</p>

        <div className="mt-6 bg-white rounded-2xl shadow overflow-hidden">
          {users.length === 0 ? (
            <div className="p-6 text-gray-600">No pending users.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3">{u.status}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => approve(u.id, "staff")}
                        className="px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-black"
                      >
                        Approve Staff
                      </button>
                      <button
                        onClick={() => approve(u.id, "admin")}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        Approve Admin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
