import React from "react";
import type { Room } from "../types";

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  return (
    <div className="border p-4 rounded shadow">
      <h2 className="font-bold">{room.name}</h2>
      <p>Status: {room.status}</p>
    </div>
  );
};

export default RoomCard;
