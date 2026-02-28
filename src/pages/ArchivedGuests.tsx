import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import type { ArchivedGuest } from "../types";
import ReceiptModal from "../components/ReceiptsModal";

type SortDir = "asc" | "desc";

function sortRows<T>(rows: T[], key: keyof T, dir: SortDir) {
  return [...rows].sort((a: any, b: any) => {
    const av = a[key];
    const bv = b[key];

    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;

    const toComparable = (v: any) => {
      if (v?.toDate?.()) return v.toDate().getTime();
      if (v instanceof Date) return v.getTime();
      return v;
    };
    const A = toComparable(av);
    const B = toComparable(bv);

    if (typeof A === "number" && typeof B === "number") {
      return dir === "asc" ? A - B : B - A;
    }

    return dir === "asc"
      ? String(A).localeCompare(String(B))
      : String(B).localeCompare(String(A));
  });
}
export default function ArchivedGuests() {
  const [guests, setGuests] = useState<ArchivedGuest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedGuest, setSelectedGuest] = useState<ArchivedGuest | null>(null);

  const [sortKey, setSortKey] = useState<keyof ArchivedGuest>("archivedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const formatDate = (ts?: Timestamp | string) => {
    if (!ts) return "-";
    if (typeof ts === "string") return ts;
    return ts.toDate().toLocaleDateString();
  };
  useEffect(() => {
    async function fetchArchivedGuests() {
      try {
        const q = query(collection(db, "archivedGuests"), orderBy("archivedAt", "desc"));
        const snap = await getDocs(q);
        const data: ArchivedGuest[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArchivedGuest));
        setGuests(data);
      } catch (error) {
        console.error("Failed to fetch archived guests:", error);
      }
    }

    fetchArchivedGuests();
  }, []);

  // Filtered guests based on search and date range
  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.roomNumber.toString().includes(searchTerm);

      let withinDate = true;

      if (startDate) {
        const archived = (g.archivedAt as Timestamp)?.toDate?.() ?? new Date(0);
        withinDate = archived >= new Date(startDate + "T00:00");
      }
      if (endDate) {
        const archived = (g.archivedAt as Timestamp)?.toDate?.() ?? new Date(0);
        withinDate = withinDate && archived <= new Date(endDate + "T23:59");
      }

      return matchesSearch && withinDate;
    });
  }, [guests, searchTerm, startDate, endDate]);

  const sortedGuests = useMemo(() => {
    return sortRows(filteredGuests, sortKey, sortDir);
  }, [filteredGuests, sortKey, sortDir]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Archived Guests History</h1>

      {/* Filters */}
      <div className="w-full max-w-5xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row gap-4">

          <div className="flex flex-col flex-1">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Name or Room Number"
              className="border rounded-lg p-3 w-full text-gray-50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col w-full md:w-48">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="border rounded-lg p-3 w-full text-gray-50"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col w-full md:w-48">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="border rounded-lg p-3 w-full text-gray-50"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-center flex-col md:flex-row gap-4">
          <div className="flex flex-col w-full md:w-56">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Sort by
            </label>
            <select
              className="border rounded-lg p-3 w-full text-black dark:text-gray-100 bg-white dark:bg-gray-800"
              value={String(sortKey)}
              onChange={e => setSortKey(e.target.value as keyof ArchivedGuest)}
            >
              <option value="name">Name</option>
              <option value="roomNumber">Room</option>
              <option value="checkInDate">Check-In</option>
              <option value="checkOutDate">Check-Out</option>
              <option value="archivedAt">Archived At</option>
            </select>
          </div>

          <div className="flex flex-col w-full md:w-40">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Direction
            </label>
            <select
              className="border rounded-lg p-3 w-full text-black dark:text-gray-100 bg-white dark:bg-gray-800"
              value={sortDir}
              onChange={e => setSortDir(e.target.value as SortDir)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Room</th>
              <th className="px-4 py-2 text-left">Check-In</th>
              <th className="px-4 py-2 text-left">Check-Out</th>
              <th className="px-4 py-2 text-left">Archived At</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedGuests.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No archived guests found.
                </td>
              </tr>
            )}
            {sortedGuests.map(guest => (
              <tr key={guest.id} className="border-b bg-gray-300 hover:bg-gray-400 dark:bg-gray-500 dark:hover:bg-gray-600">
                <td className="px-4 py-2 text-black dark:text-gray-100">{guest.name}</td>
                <td className="px-4 py-2 text-black dark:text-gray-100">{guest.roomNumber}</td>
                <td className="px-4 py-2 text-black dark:text-gray-100">{formatDate(guest.checkInDate)}</td>
                <td className="px-4 py-2 text-black dark:text-gray-100">{formatDate(guest.checkOutDate)}</td>
                <td className="px-4 py-2 text-black dark:text-gray-100">
                  {(guest.archivedAt as any)?.toDate?.()?.toLocaleDateString() ?? "-"}
                </td>
                <td className="px-4 py-2">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={() => setSelectedGuest(guest)}
                  >
                    View Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal */}
      {selectedGuest && (
        <ReceiptModal guest={selectedGuest} onClose={() => setSelectedGuest(null)} />
      )}
    </div>
  );
} 
