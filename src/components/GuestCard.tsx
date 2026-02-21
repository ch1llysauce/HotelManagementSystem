import React from "react";
import type { Guest } from "../types";
import { MoreVertical } from "lucide-react";
import { toDate, startOfDay } from "../utils/hotelDates";

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

function getDateFlags(guest: any) {
  const checkIn = toDate(guest.checkInDate);
  const checkOut = toDate(guest.checkOutDate);
  const today = startOfDay(new Date());

  const checkInDay = checkIn ? startOfDay(checkIn) : null;
  const checkOutDay = checkOut ? startOfDay(checkOut) : null;

  const dueToCheckInToday = !guest.checkedIn && checkInDay?.getTime() === today.getTime();

  const overdueCheckIn = !guest.checkedIn && checkInDay && checkInDay.getTime() < today.getTime();

  const dueToCheckOutToday = guest.checkedIn && !guest.checkedOut && checkOutDay?.getTime() === today.getTime();

  const overdueCheckOut = guest.checkedIn && !guest.checkedOut && checkOutDay && checkOutDay.getTime() < today.getTime();

  return { dueToCheckInToday, overdueCheckIn, dueToCheckOutToday, overdueCheckOut };
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const map: Record<string, { label: string; color: string }> = {
    "reserved": { label: "Reserved", color: "bg-blue-200 text-blue-900" },
    "checked-in": { label: "Checked In", color: "bg-green-200 text-green-900" },
    "due-to-check-out": { label: "Due Check-out", color: "bg-yellow-200 text-yellow-900" },
    "overdue-check-out": { label: "Overdue Check-out", color: "bg-red-200 text-red-900" },
    "checked-out": { label: "Checked Out", color: "bg-gray-200 text-gray-900" },
  };

  const cfg = map[status] ?? { label: status, color: "bg-gray-200 text-gray-900" };

  return (
    <span className={`px-2 py-1 text-xs rounded ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

const GuestCard: React.FC<GuestProps> = ({
  guest,
  onEdit,
  onCheckIn,
  onCheckOut,
  onDelete,
  color = "from-gray-400 to-gray-900",
}) => {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const flags = getDateFlags(guest);

  const status = guest.status ?? (guest.checkedOut ? "checked-out" : guest.checkedIn ? "checked-in" : "reserved");
  const canCheckIn = status === "reserved";
  const canCheckOut = status === "checked-in" || status === "due-to-check-out" || status === "overdue-check-out";

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!open) return;

      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  console.log("FLAGS", guest.name, {
    checkInDate: guest.checkInDate,
    checkOutDate: guest.checkOutDate,
    checkedIn: guest.checkedIn,
    checkedOut: guest.checkedOut,
    flags
  });


  return (
    <div className="relative w-full max-w-sm mx-auto rounded-2xl">
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${color} blur-md opacity-40 pointer-events-none`}
      ></div>

      <div className="relative dark:bg-slate-500 bg-gray-900 rounded-2xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-white truncate">
              {guest.name}
            </h2>

            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge status={guest.status} />

              {guest.status === "reserved" && flags.dueToCheckInToday && (
                <span className="px-2 py-1 text-xs rounded bg-yellow-200 text-yellow-900">
                  Due Check-in
                </span>
              )}

              {guest.status === "reserved" && flags.overdueCheckIn && (
                <span className="px-2 py-1 text-xs rounded bg-red-200 text-red-900">
                  No-show (Overdue)
                </span>
              )}

              {guest.status === "checked-in" && flags.dueToCheckOutToday && (
                <span className="px-2 py-1 text-xs rounded bg-yellow-200 text-yellow-900">
                  Due Check-out
                </span>
              )}

              {guest.status === "checked-in" && flags.overdueCheckOut && (
                <span className="px-2 py-1 text-xs rounded bg-red-200 text-red-900">
                  Overdue Check-out
                </span>
              )}
            </div>
          </div>


          <button
            aria-label="Open menu"
            className="shrink-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => setOpen((s) => !s)}
          >
            <MoreVertical size={18} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="space-y-1 mt-3 text-sm text-gray-100">
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
          <div 
            ref={menuRef}
            className="absolute right-4 top-14 w-36 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 py-2 z-20 animate-fadeIn">
            <button
              className="w-full px-4 py-2 text-left text-sm bg-gray-50 dark:bg-gray-400 hover:bg-gray-400 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation(); 
                setOpen((s) => !s);
                onEdit?.(guest);
              }}
            >
              Edit Guest
            </button>

            {canCheckIn && (
              <button
                className="w-full px-4 py-2 text-left text-sm bg-gray-50 dark:bg-gray-400 hover:bg-gray-400 dark:hover:bg-gray-700"
                onClick={() => {
                  setOpen(false);
                  onCheckIn?.(guest.id);
                }}
              >
                Check In
              </button>
            )}

            {canCheckOut && (
              <button
                className="w-full px-4 py-2 text-left text-sm bg-gray-50 dark:bg-gray-400 hover:bg-gray-400 dark:hover:bg-gray-700"
                onClick={() => {
                  setOpen(false);
                  onCheckOut?.(guest.id, guest.roomId);
                }}
              >
                Check Out
              </button>
            )}

            <button
              className="w-full px-4 py-2 text-left text-sm text-red-600 bg-gray-50 dark:bg-gray-400 hover:bg-gray-400 dark:hover:bg-gray-700"
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
    </div >
  );
};

export default GuestCard;
