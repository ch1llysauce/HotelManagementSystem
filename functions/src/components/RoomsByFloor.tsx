import { RoomDocument } from "../types";
import { RoomCard } from "./RoomCard";

export function RoomsByFloor({
  rooms,
  onStatusChange,
  onDelete,
}: {
  rooms: RoomDocument[];
  onStatusChange: (id: string, status: any) => void;
  onDelete: (id: string) => void;
}) {
  const floors = [...new Set(rooms.map((r) => r.floor))].sort();

  return (
    <div className="space-y-8">
      {floors.map((floor) => {
        const roomsOnFloor = rooms.filter((r) => r.floor === floor);

        return (
          <div key={floor}>
            <h2 className="text-xl font-bold mb-3">Floor {floor}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roomsOnFloor.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
