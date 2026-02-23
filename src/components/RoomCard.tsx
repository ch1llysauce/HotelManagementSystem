import { RoomDocument, RoomStatus } from "../types";
import { useState } from "react";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface RoomCardProps {
  room: RoomDocument;
  onStatusChange: (id: string, status: RoomStatus) => void;
  onDelete: (id: string) => void;
}

export function RoomCard({ room, onStatusChange, onDelete }: RoomCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="p-4 border rounded-lg shadow hover:shadow-lg transition text-black dark:text-white">
      <h2 className="font-semibold text-lg">
        Room {room.number} ({room.type})
      </h2>
      <p>Floor: {room.floor}</p>
      <p>Price: ₱{room.price}</p>
      <p>Status:</p>
      <select
        value={room.status}
        disabled={room.status === "Occupied" || room.status === "Reserved"}
        onChange={(e) => onStatusChange(room.id, e.target.value as RoomStatus)}
        className={`border p-2 mt-1 w-full rounded
    ${(room.status === "Occupied" || room.status === "Reserved")
            ? "bg-gray-600 text-black cursor-not-allowed opacity-70"
            : "bg-gray-500 text-white hover:bg-gray-600"
          }`}
      >

        {(room.status === "Occupied" || room.status === "Reserved") && (
          <option value={room.status}>{room.status}</option>
        )}

        <option value="Available">Available</option>
        <option value="Cleaning">Cleaning</option>
      </select>
      <div className="mt-3 flex justify-between">
        <button
          className="bg-red-600 text-white px-3 py-1 rounded"
          onClick={() => setConfirmOpen(true)}
        >
          Delete
        </button>
      </div>

      {confirmOpen && (
        <DeleteConfirmModal
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            onDelete(room.id);
          }}
        />
      )}
    </div>

  );
}
