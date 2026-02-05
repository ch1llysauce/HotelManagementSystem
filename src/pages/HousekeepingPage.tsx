import { useEffect, useState } from "react";
import { listenToRooms, updateRoom } from "../utils/rooms.service";
import { RoomDocument } from "../types";

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<RoomDocument[]>([]);

  useEffect(() => {
    const unsub = listenToRooms((snapshot: { docs: any[]; }) => {
      const data = snapshot.docs.map((doc) => ({
        ...(doc.data() as any),
        id: doc.id,
      }));
      setRooms(data);
    });
    return unsub;
  }, []);

  const cleaningRooms = rooms.filter((r) => r.status === "Cleaning");

  const markAsAvailable = async (id: string) => {
    await updateRoom(id, { status: "Available" });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">Housekeeping</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cleaningRooms.map((room) => (
          <div
            key={room.id}
            className="border border-gray-700 dark:border-gray-200 p-4 rounded shadow bg-blue-300 dark:bg-slate-700"
          >
            <h3 className="font-bold text-gray-600 dark:text-gray-300">Room {room.number}</h3>
            <p className="text-gray-600 dark:text-gray-300">Type: {room.type}</p>

            <button
              onClick={() => markAsAvailable(room.id)}
              className="mt-2 bg-green-600 text-white px-3 py-2 rounded"
            >
              Mark as Available
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
