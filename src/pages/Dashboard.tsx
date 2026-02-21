import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { RoomDocument } from "../types";
import DashboardCard from "../components/DashboardCard";
import { FiUsers, FiHome, FiCheckCircle } from "react-icons/fi";

export default function Dashboard() {
  const [rooms, setRooms] = useState<RoomDocument[]>([]);

  useEffect(() => {
    const ref = collection(db, "rooms");
    const unsub = onSnapshot(ref, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as RoomDocument[];
      setRooms(list);
    });
    return () => unsub();
  }, []);

  const total = rooms.length;
  const available = rooms.filter((r) => r.status === "Available").length;
  const reserved = rooms.filter((r) => r.status === "Reserved").length;
  const cleaning = rooms.filter((r) => r.status === "Cleaning").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent p-8 md:p-12 lg:ml-64 mx-auto max-w-5xl transition-all duration-500">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <KPI label="Total Rooms" value={total} />
        <KPI label="Available" value={available} />
        <KPI label="Reserved" value={reserved} />
        <KPI label="Housekeeping (Cleaning)" value={cleaning} />
      </div>

      {/* Cards */}
      <div className="flex flex-wrap justify-center gap-8">
        <DashboardCard title="Check-In" link="/checkin" icon={<FiCheckCircle size={28} />} color="from-green-400 to-green-600" />
        <DashboardCard title="Guest List" link="/guests" icon={<FiUsers size={28} />} color="from-blue-400 to-blue-600" />
        <DashboardCard title="Room Status" link="/rooms" icon={<FiHome size={28} />} color="from-yellow-400 to-yellow-600" />
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 p-4 text-center shadow-sm">
      <div className="text-sm text-gray-500 dark:text-gray-200">{label}</div>
      <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}