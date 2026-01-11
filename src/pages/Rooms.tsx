import { useEffect, useState } from "react";
import { addRoom, updateRoom, deleteRoomById, listenToRooms } from "../utils/rooms.service";
import { RoomDocument, Room } from "../types";
import { AddRoomForm } from "../components/AddRoomForm";
import { RoomsOverview } from "../components/RoomsOverview";
import { RoomsByFloor } from "../components/RoomsByFloor";
import { autoUpdateReservedRooms } from "../utils/roomAutoStatus";
import { seedRooms } from "../utils/seedRooms";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomDocument[]>([]);

  useEffect(() => {
    autoUpdateReservedRooms();
    // Listen to rooms
    const unsub = listenToRooms((snapshot: { docs: any[]; }) => {
      const data = snapshot.docs.map(doc => ({
        ...(doc.data() as Room),
        id: doc.id,
      }));
      setRooms(data);
    });
    return unsub;
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Rooms Management</h1>

      <RoomsOverview rooms={rooms} />

      <AddRoomForm onAdd={addRoom} />

      <RoomsByFloor
        rooms={rooms}
        onStatusChange={(id, status) => updateRoom(id, { status })}
        onDelete={deleteRoomById}
      />

      <button
        onClick={seedRooms}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Seed Rooms (Dev Only)
      </button>

    </div>
  );
}
