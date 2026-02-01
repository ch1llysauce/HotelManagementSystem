// components/EditGuestModal.tsx
import { useEffect, useState } from "react";
import type { Guest } from "../types";

interface EditGuestModalProps {
  guest: Guest | null;
  onClose: () => void;
  onSave: (updatedGuest: Guest) => void; // Guests.tsx will handle Firestore update
}

export default function EditGuestModal({ guest, onClose, onSave }: EditGuestModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    roomNumber: "",
  });

  useEffect(() => {
    if (guest) {
      setForm({
        name: guest.name ?? "",
        email: guest.email ?? "",
        phone: guest.phone ?? "",
        roomNumber: String(guest.roomNumber ?? ""),
      });
    }
  }, [guest]);

  if (!guest) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Guest</h2>

        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-gray-500 text-lg md:text-xl">Name</label>
            <input
              className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
              value={form.name}
              placeholder="John Doe"
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-gray-500 text-lg md:text-xl">Email Address</label>
            <input
              className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
              value={form.email}
              placeholder="johndoe@gmail.com"
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-gray-500 text-lg md:text-xl">Phone Number</label>
            <input
              className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
              value={form.phone}
              placeholder="0123456789"
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            />
          </div>

          {/* Room Number 
          <div className="space-y-1">
            <label className="text-gray-500 text-lg md:text-xl">Room Number</label>
            <input
              className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
              value={form.roomNumber}
              placeholder="12345"
              onChange={(e) => setForm((s) => ({ ...s, roomNumber: e.target.value }))}
            />
          </div>
          */}
        </div>
        

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700">
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...guest, ...form, roomNumber: Number(form.roomNumber) })}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
