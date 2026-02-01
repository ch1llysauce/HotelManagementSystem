import React from "react";
import type { Guest } from "../types";
import { MoreVertical } from "lucide-react";

interface GuestProps {
  guest: Guest;
  onEdit?: (guest: Guest) => void;
  onCheckIn?: (guestId: string) => void;
  onCheckOut?: (guestId: string, roomId: string) => void;
  onDelete?: (guestId: string) => void;
  color?: string;
}

// Works with: "YYYY-MM-DD" strings, Firestore Timestamp, Date, or missing values
const formatDate = (value: any) => {
  if (!value) return "N/A";

  // Firestore Timestamp -> Date
  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString().split("T")[0];
  }

  // JS Date
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  // string: either "YYYY-MM-DD" or ISO
  if (typeof value === "string") {
    return value.includes("T") ? value.split("T")[0] : value;
  }

  // fallback (prevents React crash)
  return "N/A";
};


const GuestCard: React.FC<GuestProps> = ({
  guest,
  onEdit,
  onCheckIn,
  onCheckOut,
  onDelete,
  color = "from-gray-400 to-gray-900",
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative w-full max-w-sm mx-auto rounded-2xl">
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color} blur-md opacity-60 pointer-events-none`}
      ></div>

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {guest.name}
          </h2>

          <button
            aria-label="Open menu"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => setOpen((s) => !s)}
          >
            <MoreVertical size={18} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="space-y-1 mt-3 text-sm text-gray-700 dark:text-gray-300">
          <p className="truncate">
            <span className="font-medium">Room Number:</span> {guest.roomNumber}
          </p>
          <p className="truncate">
            <span className="font-medium">Check-In Date:</span>{" "}
            {formatDate(guest.checkInDate)}
          </p>
          <p className="truncate">
            <span className="font-medium">Check-Out Date:</span>{" "}
            {formatDate(guest.checkOutDate)}
          </p>
          <p className="truncate">
            <span className="font-medium">Email:</span> {guest.email}
          </p>
          <p className="truncate">
            <span className="font-medium">Phone:</span> {guest.phone}
          </p>
        </div>

        {open && (
          <div className="absolute right-4 top-14 w-36 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 py-2 z-20 animate-fadeIn">
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                setOpen(false);
                onEdit?.(guest);
              }}
            >
              Edit Guest
            </button>

            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                setOpen(false);
                onCheckIn?.(guest.id);
              }}
            >
              Check In
            </button>

            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                setOpen(false);
                onCheckOut?.(guest.id, guest.roomId);
              }}
            >
              Check Out
            </button>

            <button
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                setOpen(false);
                onDelete?.(guest.id);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestCard;
