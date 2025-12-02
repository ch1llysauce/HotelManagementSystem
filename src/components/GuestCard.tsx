// components/GuestCard.tsx
import React from "react";
import type { Guest } from "../types";
import { MoreVertical } from "lucide-react";

interface GuestProps {
  guest: Guest;
  onEdit?: (guest: Guest) => void;
  onCheckOut?: (guestId: string) => void;
  onDelete?: (guestId: string) => void;
  color?: string;
}

const GuestCard: React.FC<GuestProps> = ({
  guest,
  onEdit,
  onCheckOut,
  onDelete,
  color = "from-gray-400 to-gray-900",
}) => {
  const [open, setOpen] = React.useState(false);

  const handleEdit = () => {
    setOpen(false);
    onEdit?.(guest);
  };

  const handleCheckOut = () => {
    setOpen(false);
    onCheckOut?.(guest.id);
  };

  const handleDelete = () => {
    setOpen(false);
    onDelete?.(guest.id);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto rounded-2xl">
      {/* Feathered Gradient Border */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color} blur-md opacity-60 pointer-events-none`}
      ></div>

      {/* Card Content */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
        {/* Top row: Name + Menu */}
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {guest.name}
          </h2>

          {/* Burger Menu Button */}
          <button
            aria-label="Open menu"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => setOpen((s) => !s)}
          >
            <MoreVertical size={18} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Guest Info */}
        <div className="space-y-1 mt-3 text-sm text-gray-700 dark:text-gray-300">
          <p className="truncate">
            <span className="font-medium">Room:</span> {guest.room}
          </p>
          <p className="truncate">
            <span className="font-medium">Email:</span> {guest.email}
          </p>
          <p className="truncate">
            <span className="font-medium">Phone:</span> {guest.phone}
          </p>
        </div>

        {/* Dropdown Menu */}
        {open && (
          <div
            className="absolute right-4 top-14 w-36 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 py-2 z-20 animate-fadeIn"
            role="menu"
          >
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleEdit}
            >
              Edit Guest
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleCheckOut}
            >
              Check Out
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleDelete}
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
