import { RoomDocument } from "../types";

export function RoomsOverview({ rooms }: { rooms: RoomDocument[] }) {
  const total = rooms.length;

  const available = rooms.filter((r) => r.status === "Available").length;
  const occupied = rooms.filter((r) => r.status === "Occupied").length;
  const reserved = rooms.filter((r) => r.status === "Reserved").length;
  const cleaning = rooms.filter((r) => r.status === "Cleaning").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <SummaryCard label="Total Rooms" value={total} color="bg-gray-700" />
      <SummaryCard label="Available" value={available} color="bg-green-600" />
      <SummaryCard label="Occupied" value={occupied} color="bg-red-600" />
      <SummaryCard label="Reserved" value={reserved} color="bg-yellow-600" />
      <SummaryCard label="Cleaning" value={cleaning} color="bg-blue-600" />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`p-4 rounded-lg text-white ${color}`}>
      <h2 className="text-lg font-semibold">{label}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
