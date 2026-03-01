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

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(sortedGuests.length / PAGE_SIZE));

  const pageGuests = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedGuests.slice(start, start + PAGE_SIZE);
  }, [sortedGuests, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, startDate, endDate, sortKey, sortDir]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);


  function onHeaderSort(key: keyof ArchivedGuest) {
    if (sortKey === key) {
      setSortDir(prev => (prev === "desc" ? "asc" : "desc"));
      return;
    }

    setSortKey(key);

    const isDate =
      key === "name" ||
      key === "roomNumber" ||
      key === "checkInDate" ||
      key === "checkOutDate" ||
      key === "archivedAt";

    setSortDir(isDate ? "asc" : "desc");
  }

  function SortArrow({ k }: { k: keyof ArchivedGuest }) {
    if (sortKey !== k) return null;
    return <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-black dark:text-white mb-6">Archived Guests History</h1>

      {/* Filters */}
      <div className="w-full max-w-5xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-center">

          <div className="flex flex-col">
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
              <th
                className="px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => onHeaderSort("name")}
              >
                <span className="flex items-center">
                  Name
                  <SortArrow k="name" />
                </span>
              </th>

              <th
                className="px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => onHeaderSort("roomNumber")}
              >
                <span className="flex items-center">
                  Room
                  <SortArrow k="roomNumber" />
                </span>
              </th>

              <th
                className="px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => onHeaderSort("checkInDate")}
              >
                <span className="flex items-center">
                  Check-In
                  <SortArrow k="checkInDate" />
                </span>
              </th>

              <th
                className="px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => onHeaderSort("checkOutDate")}
              >
                <span className="flex items-center">
                  Check-Out
                  <SortArrow k="checkOutDate" />
                </span>
              </th>

              <th
                className="px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => onHeaderSort("archivedAt")}
              >
                <span className="flex items-center">
                  Archived At
                  <SortArrow k="archivedAt" />
                </span>
              </th>

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
            {pageGuests.map(guest => (
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

      {/* Pagination */}
      {sortedGuests.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            className="px-3 py-1 rounded-lg border bg-gray-300 dark:bg-gray-800 text-black dark:text-gray-100 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>

          {/* Part buttons */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`px-3 py-1 rounded-lg border ${p === page
                ? "bg-blue-600 text-white"
                : "bg-gray-300 dark:bg-gray-800 text-black dark:text-gray-100"
                }`}
              onClick={() => setPage(p)}
            >
              Part {p}
            </button>
          ))}

          <button
            className="px-3 py-1 rounded-lg border bg-gray-300 dark:bg-gray-800 text-black dark:text-gray-100 disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>

          <div className="w-full text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
            Part {page} / {totalPages} • Showing {(page - 1) * PAGE_SIZE + 1}-
            {Math.min(page * PAGE_SIZE, sortedGuests.length)} of {sortedGuests.length}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedGuest && (
        <ReceiptModal guest={selectedGuest} onClose={() => setSelectedGuest(null)} />
      )}
    </div>
  );
} 