import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import type { ArchivedGuest } from "../types";
import ReceiptModal from "../components/ReceiptsModal";

export default function ArchivedGuests() {
  const [guests, setGuests] = useState<ArchivedGuest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedGuest, setSelectedGuest] = useState<ArchivedGuest | null>(null);
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
  const filteredGuests = guests.filter(g => {
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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Archived Guests History</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or room"
          className="border rounded-lg p-2 flex-1"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <input
          type="date"
          className="border rounded-lg p-2 text-gray-100 dark:text-gray-100"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="border rounded-lg p-2 text-gray-100 dark:text-gray-100"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
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
            {filteredGuests.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No archived guests found.
                </td>
              </tr>
            )}
            {filteredGuests.map(guest => (
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
