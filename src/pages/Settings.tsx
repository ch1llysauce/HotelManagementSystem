import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  doc,
  onSnapshot,
  setDoc,
  collection,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useToast } from "../components/Toast";

type AppSettings = {
  hotelName: string;
  checkInTime: string;  // "HH:MM"
  checkOutTime: string; // "HH:MM"
  currency: string;     // "PHP" | "USD" | ...
  darkMode: boolean;
  archiveRetentionDays: number;
};

type PermissionBlock = {
  view: boolean;
  edit?: boolean;
  delete?: boolean;
  export?: boolean;
};

type Permissions = {
  guests: PermissionBlock;
  rooms: PermissionBlock;
  housekeeping: PermissionBlock;
  settings: PermissionBlock;
};

type UserRole = "admin" | "manager" | "receptionist" | "housekeeping";

type UserDoc = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permissions;
};

const defaultAppSettings: AppSettings = {
  hotelName: "",
  checkInTime: "14:00",
  checkOutTime: "12:00",
  currency: "PHP",
  darkMode: false,
  archiveRetentionDays: 90,
};

const defaultPermissionsByRole: Record<UserRole, Permissions> = {
  admin: {
    guests: { view: true, edit: true, delete: true, export: true },
    rooms: { view: true, edit: true },
    housekeeping: { view: true, edit: true },
    settings: { view: true, edit: true },
  },
  manager: {
    guests: { view: true, edit: true, delete: false, export: true },
    rooms: { view: true, edit: true },
    housekeeping: { view: true, edit: true },
    settings: { view: true, edit: false },
  },
  receptionist: {
    guests: { view: true, edit: true, delete: false, export: true },
    rooms: { view: true, edit: false },
    housekeeping: { view: true, edit: false },
    settings: { view: false, edit: false },
  },
  housekeeping: {
    guests: { view: true, edit: false, delete: false, export: false },
    rooms: { view: true, edit: false },
    housekeeping: { view: true, edit: true },
    settings: { view: false, edit: false },
  },
};

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

export default function Settings() {
  const { showToast } = useToast();

  // App settings
  const [app, setApp] = useState<AppSettings>(defaultAppSettings);
  const [appLoading, setAppLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Users & roles
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Load app settings (settings/app)
  useEffect(() => {
    const ref = doc(db, "settings", "app");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const d = (snap.data() || {}) as Partial<AppSettings>;
        setApp({
          hotelName: d.hotelName ?? "",
          checkInTime: d.checkInTime ?? "14:00",
          checkOutTime: d.checkOutTime ?? "12:00",
          currency: d.currency ?? "PHP",
          darkMode: !!d.darkMode,
          archiveRetentionDays: clampInt(Number(d.archiveRetentionDays ?? 90), 1, 3650),
        });
        setAppLoading(false);
      },
      (err) => {
        console.error(err);
        setAppLoading(false);
        showToast("Failed to load settings");
      }
    );
    return () => unsub();
  }, [showToast]);

  // Load users (optional)
  useEffect(() => {
    const ref = collection(db, "users");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const list: UserDoc[] = snap.docs.map((d) => {
          const u = d.data() as any;
          const role: UserRole = (u.role as UserRole) ?? "receptionist";

          return {
            id: d.id,
            name: u.name ?? "",
            email: u.email ?? "",
            role,
            permissions: (u.permissions ?? defaultPermissionsByRole[role]) as Permissions,
          };
        });
        setUsers(list);
        setUsersLoading(false);
      },
      (err) => {
        console.error(err);
        setUsersLoading(false);
        // Don’t block the whole page if users collection isn’t ready yet
      }
    );
    return () => unsub();
  }, []);

  const canShowUsers = useMemo(() => users.length > 0 || !usersLoading, [users, usersLoading]);

  const saveAppSettings = async () => {
    try {
      setSaving(true);
      const ref = doc(db, "settings", "app");
      await setDoc(
        ref,
        {
          ...app,
          archiveRetentionDays: clampInt(Number(app.archiveRetentionDays), 1, 3650),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      showToast("Settings saved");
    } catch (e) {
      console.error(e);
      showToast("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      const ref = doc(db, "users", userId);
      await updateDoc(ref, {
        role,
        permissions: defaultPermissionsByRole[role],
      });
      showToast("Role updated");
    } catch (e) {
      console.error(e);
      showToast("Failed to update role");
    }
  };

  const toggleUserPermission = async (
    userId: string,
    section: keyof Permissions,
    key: keyof PermissionBlock,
    value: boolean
  ) => {
    try {
      const ref = doc(db, "users", userId);
      // Firestore nested update
      await updateDoc(ref, {
        [`permissions.${section}.${key}`]: value,
      } as any);
    } catch (e) {
      console.error(e);
      showToast("Failed to update permission");
    }
  };

  return (
    <div className="p-10">
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-3 text-gray-500 text-lg md:text-xl">
          Manage hotel configuration, system preferences, and access control.
        </p>
      </div>

      {/* App Settings */}
      <div className="max-w-6xl mx-auto w-full bg-white dark:bg-slate-600 border border-gray-700 dark:border-gray-200 rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hotel & System Settings</h2>
          <button
            onClick={saveAppSettings}
            disabled={saving || appLoading}
            className={`px-4 py-2 rounded-xl transition ${
              saving || appLoading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {appLoading ? (
          <p className="text-gray-500 mt-6">Loading settings…</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hotel Settings */}
            <div className="rounded-2xl border border-gray-700 dark:border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-4">Hotel</h3>

              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Hotel name</label>
              <input
                value={app.hotelName}
                onChange={(e) => setApp((p) => ({ ...p, hotelName: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g., Chill Hotel"
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Check-in time</label>
                  <input
                    type="time"
                    value={app.checkInTime}
                    onChange={(e) => setApp((p) => ({ ...p, checkInTime: e.target.value }))}
                    className="text-gray-100 dark:text-gray-100 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Check-out time</label>
                  <input
                    type="time"
                    value={app.checkOutTime}
                    onChange={(e) => setApp((p) => ({ ...p, checkOutTime: e.target.value }))}
                    className="text-gray-100 dark:text-gray-100 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2 mt-4">Currency</label>
              <select
                value={app.currency}
                onChange={(e) => setApp((p) => ({ ...p, currency: e.target.value }))}
                className="text-gray-100 dark:text-gray-100 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="PHP">PHP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="JPY">JPY</option>
              </select>
            </div>

            {/* System Settings */}
            <div className="rounded-2xl border border-gray-700 dark:border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-4">System</h3>

              <label className="flex items-center gap-3 rounded-xl border border-gray-700 dark:border-gray-200 p-4">
                <input
                  type="checkbox"
                  checked={app.darkMode}
                  onChange={(e) => setApp((p) => ({ ...p, darkMode: e.target.checked }))}
                  className="h-4 w-4"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-300">Dark mode (flag)</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    You can wire this to your theme switch later.
                  </div>
                </div>
              </label>

              <div className="mt-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Archive retention (days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={app.archiveRetentionDays}
                  onChange={(e) =>
                    setApp((p) => ({
                      ...p,
                      archiveRetentionDays: clampInt(Number(e.target.value), 1, 3650),
                    }))
                  }
                  className="text-gray-100 dark:text-gray-100 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Example: auto-delete archives after X days (if you add a scheduled function later).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users & Roles */}
      {canShowUsers && (
        <div className="max-w-6xl mx-auto w-full mt-8 bg-white dark:bg-slate-600 border border-gray-700 dark:border-gray-200 rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200">Users & Roles</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Assign roles and fine-tune permissions per user.
          </p>

          {usersLoading ? (
            <p className="text-gray-500 dark:text-gray-400 mt-6">Loading users…</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 mt-6">
              No users found in <span className="font-mono text-gray-500 dark:text-gray-400 ">users</span> collection.
              You can add this later.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr className="text-left">
                    <th className="p-3 text-gray-100 dark:text-gray-100">Name</th>
                    <th className="p-3 text-gray-100 dark:text-gray-100">Email</th>
                    <th className="p-3 text-gray-100 dark:text-gray-100">Role</th>
                    <th className="p-3 text-gray-100 dark:text-gray-100">Guests</th>
                    <th className="p-3 text-gray-100 dark:text-gray-100">Rooms</th>
                    <th className="p-3 text-gray-100 dark:text-gray-100">Housekeeping</th>
                    <th className="p-3">Settings</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100">
                      <td className="p-3 font-medium text-gray-900">{u.name || "—"}</td>
                      <td className="p-3 text-gray-700">{u.email || "—"}</td>

                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                          className="px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="receptionist">Receptionist</option>
                          <option value="housekeeping">Housekeeping</option>
                        </select>
                      </td>

                      {(["guests", "rooms", "housekeeping", "settings"] as (keyof Permissions)[]).map(
                        (section) => (
                          <td key={section} className="p-3">
                            <div className="flex flex-wrap gap-2">
                              <label className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                <input
                                  type="checkbox"
                                  checked={!!u.permissions?.[section]?.view}
                                  onChange={(e) =>
                                    toggleUserPermission(u.id, section, "view", e.target.checked)
                                  }
                                  className="h-4 w-4"
                                />
                                View
                              </label>

                              {"edit" in (u.permissions?.[section] ?? {}) && (
                                <label className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                  <input
                                    type="checkbox"
                                    checked={!!u.permissions?.[section]?.edit}
                                    onChange={(e) =>
                                      toggleUserPermission(u.id, section, "edit", e.target.checked)
                                    }
                                    className="h-4 w-4"
                                  />
                                  Edit
                                </label>
                              )}

                              {section === "guests" && (
                                <>
                                  <label className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                    <input
                                      type="checkbox"
                                      checked={!!u.permissions?.guests?.delete}
                                      onChange={(e) =>
                                        toggleUserPermission(u.id, "guests", "delete", e.target.checked)
                                      }
                                      className="h-4 w-4"
                                    />
                                    Delete
                                  </label>

                                  <label className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                    <input
                                      type="checkbox"
                                      checked={!!u.permissions?.guests?.export}
                                      onChange={(e) =>
                                        toggleUserPermission(u.id, "guests", "export", e.target.checked)
                                      }
                                      className="h-4 w-4"
                                    />
                                    Export
                                  </label>
                                </>
                              )}
                            </div>
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
