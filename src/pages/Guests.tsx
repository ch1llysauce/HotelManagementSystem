// pages/Guests.tsx
import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import type { Guest } from "../types";
import { useToast } from "../components/Toast";
import { Download, FileDown, Printer } from "lucide-react";
import GuestCard from "../components/GuestCard";
import EditGuestModal from "../components/EditGuestModal";
import CheckInConfirmModal from "../components/CheckInConfirmModal";
import CheckoutModal from "../components/CheckOutModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

function guestToFirestoreUpdate(g: Guest) {
  return {
    name: g.name ?? "",
    email: g.email ?? "",
    phone: g.phone ?? "",
    roomNumber: g.roomNumber ?? "",
    // don't include id or timestamp here; include checkedIn if you want to update it explicitly
  };
}

export default function Guests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [checkInGuest, setCheckInGuest] = useState<Guest | null>(null);
  const [checkOutGuest, setCheckOutGuest] = useState<Guest | null>(null);
  const [deleteGuestId, setDeleteGuestId] = useState<string | null>(null);
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "reserved" | "checked-in" | "due-checkin" | "due-checkout" | "overdue"
  >("all");
  const [sortBy, setSortBy] = useState<"checkoutSoon" | "checkinSoon" | "room" | "name">(
    "checkoutSoon"
  );
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const activeOnly = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  type UIStatus = "reserved" | "checked-in" | "due-checkin" | "overdue-checkin" | "due-checkout" | "overdue" | "all";

  const parseYMD = (s?: string) => {
    if (!s) return null;
    const d = new Date(`${s}T00:00:00`);
    return Number.isFinite(d.getTime()) ? d : null;
  };

  const startOfToday = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  };

  const getUIStatus = (g: Guest): UIStatus => {
    const today = startOfToday();
    const checkIn = parseYMD(g.checkInDate);
    const checkOut = parseYMD(g.checkOutDate);

    if (g.checkedOut) return "all";

    if (!g.checkedIn) {
      if (!checkIn) return "reserved";

      const inTime = checkIn.getTime();
      const todayTime = today.getTime();

      if (inTime < todayTime) return "overdue-checkin";
      if (inTime === todayTime) return "due-checkin";
      return "reserved";
    }

    if (checkOut) {
      const outTime = checkOut.getTime();
      const todayTime = today.getTime();

      if (outTime < todayTime) return "overdue";
      if (outTime === todayTime) return "due-checkout";
    }

    return "checked-in";
  };

  const statusBadgeClass = (g: Guest) => {
    const s = getUIStatus(g);
    if (s === "overdue") return "bg-red-100 text-red-700";
    if (s === "overdue-checkin") return "bg-red-100 text-red-700";
    if (s === "due-checkout") return "bg-yellow-100 text-yellow-800";
    if (s === "due-checkin") return "bg-blue-100 text-blue-800";
    if (s === "checked-in") return "bg-green-100 text-green-700";
    if (s === "reserved") return "bg-gray-100 text-gray-800";
    return "bg-gray-100 text-gray-800";
  };
  const normalizeStatus = (g: Guest) => {
    const s = g.status ?? "";
    if (s === "overdue-check-out") return "overdue";
    if (s === "due-to-check-in") return "due-checkin";
    if (s === "due-to-check-out") return "due-checkout";
    if (s === "checked-in") return "checked-in";
    if (s === "reserved") return "reserved";
    return "all";
  };

  const toTime = (d?: any) => {
    if (!d) return Number.POSITIVE_INFINITY;
    // d is likely "YYYY-MM-DD"
    const t = new Date(String(d)).getTime();
    return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
  };

  const visibleGuests = guests
    // Active only toggle
    .filter((g) => (activeOnly ? !g.checkedOut : true))
    // Status filter
    .filter((g) => {
      if (statusFilter === "all") return true;
      return normalizeStatus(g) === statusFilter;
    })
    // Search
    .filter((g) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;

      return (
        (g.name ?? "").toLowerCase().includes(q) ||
        (g.email ?? "").toLowerCase().includes(q) ||
        String(g.phone ?? "").toLowerCase().includes(q) ||
        String(g.roomNumber ?? "").includes(q)
      );
    })
    // Sorting Algorithm
    .sort((a, b) => {
      if (sortBy === "room") return Number(a.roomNumber ?? 0) - Number(b.roomNumber ?? 0);
      if (sortBy === "name") return String(a.name ?? "").localeCompare(String(b.name ?? ""));

      if (sortBy === "checkinSoon") return toTime(a.checkInDate) - toTime(b.checkInDate);

      // checkoutSoon default
      return toTime(a.checkOutDate) - toTime(b.checkOutDate);
    });


  const handleCheckIn = async (guestId: string) => {
    try {
      const ref = doc(db, "guests", guestId);
      await updateDoc(ref, {
        checkedIn: true,
        checkedOut: false,
        status: "checked-in",
      });
      showToast("Guest checked in");
    } catch (e) {
      console.error(e);
      showToast("Failed to check in");
    }
  };

  const handleExport = () => {
    const rows = visibleGuests.map((g) => ({
      Name: g.name ?? "",
      Email: g.email ?? "",
      Phone: g.phone ?? "",
      RoomNumber: g.roomNumber ?? "",
      Status: g.status ?? "",
      CheckInDate: g.checkInDate ?? "",
      CheckOutDate: g.checkOutDate ?? "",
    }));

    const headers = Object.keys(rows[0] ?? {});
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `guests_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const printGuests = () => {
    const html = `
    <html>
      <head>
        <title>Guests</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h1 { margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          th { background: #f3f4f6; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Guests</h1>
        <p>Exported: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Room</th><th>Status</th><th>Check-in</th><th>Check-out</th><th>Email</th><th>Phone</th>
            </tr>
          </thead>
          <tbody>
            ${visibleGuests
        .map(
          (g) => `
              <tr>
                <td>${g.name ?? ""}</td>
                <td>${g.roomNumber ?? ""}</td>
                <td>${g.status ?? ""}</td>
                <td>${g.checkInDate ?? ""}</td>
                <td>${g.checkOutDate ?? ""}</td>
                <td>${g.email ?? ""}</td>
                <td>${g.phone ?? ""}</td>
              </tr>`
        )
        .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
    setExportOpen(false);
  };


  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!exportOpen) return;
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [exportOpen]);

  // Live sync with Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "guests"), (snapshot) => {
      const data: Guest[] = snapshot.docs.map((d) => {
        const guestData = d.data() as any;

        console.log("GUEST DOC", d.id, {
          status: guestData.status,
          checkedIn: guestData.checkedIn,
          checkedOut: guestData.checkedOut,
        });


        return {
          id: d.id,
          name: guestData.name ?? "",
          email: guestData.email ?? "",
          phone: guestData.phone ?? "",
          roomId: guestData.roomId ?? "",
          roomNumber: guestData.roomNumber ?? 0,

          checkedIn: !!guestData.checkedIn,
          checkedOut: !!guestData.checkedOut,

          checkInDate: guestData.checkInDate?.toDate
            ? guestData.checkInDate.toDate().toISOString().split("T")[0]
            : (typeof guestData.checkInDate === "string" ? guestData.checkInDate : undefined),

          checkOutDate: guestData.checkOutDate?.toDate
            ? guestData.checkOutDate.toDate().toISOString().split("T")[0]
            : (typeof guestData.checkOutDate === "string" ? guestData.checkOutDate : undefined),

          status: guestData.status,
          expectedCheckOut: guestData.expectedCheckOut ?? null,
          overdueSince: guestData.overdueSince ?? null,
          checkedOutAt: guestData.checkedOutAt ?? null,

          timestamp: guestData.timestamp ?? null,
        } as Guest;
      });
      setGuests(data);
    });

    return () => unsub();
  }, []);

  // Save edits (only updating allowed fields)
  const handleSaveEdit = async (updatedGuest: Guest) => {
    if (!updatedGuest.id) return;
    const ref = doc(db, "guests", updatedGuest.id);
    await updateDoc(ref, guestToFirestoreUpdate(updatedGuest));
    setEditGuest(null);
    showToast("Guest updated");
  };

  // Handle delete confirm
  const confirmDelete = async () => {
    if (!deleteGuestId) return;
    await deleteDoc(doc(db, "guests", deleteGuestId));
    setDeleteGuestId(null);
    showToast("Guest deleted");
  };

  const canCheckIn = (g: Guest) => !g.checkedIn && !g.checkedOut;

  const canCheckOut = (g: Guest) => g.checkedIn && !g.checkedOut;

  const actionButtonType = (g: Guest) => {
    if (g.checkedOut) return "checkedOut";
    if (canCheckIn(g)) return "checkin";
    if (canCheckOut(g)) return "checkout";
    return "none";
  };

  return (
    <div className="p-10">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Guests</h1>
        <p className="mt-3 text-gray-500 text-lg md:text-xl">View and manage all checked-in guests.</p>
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => navigate('/checkin')}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition">
            + Add Guest
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition">
            <Download className="inline-block mr-2" size={16} />
            Export CSV
          </button>

          <button
            onClick={printGuests}
            className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition">
            <Printer className="inline-block mr-2" size={16} />
            Print
          </button>
        </div>

        <div className="flex gap-2 justify-center mt-6">
          <button
            onClick={() => setViewMode("cards")}
            className={`px-4 py-2 rounded-xl transition border ${viewMode === "cards"
              ? "bg-blue-500 text-white border-gray-900"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              }`}
          >
            Card View
          </button>

          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-xl transition border ${viewMode === "table"
              ? "bg-blue-500 text-white border-gray-900"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              }`}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto w-full">
        <div className="bg-blue-200 rounded-2xl shadow-md p-4 flex flex-col lg:flex-row lg:items-center gap-3 mb-8 max-w-6xl mx-auto w-full">
          {/* Search */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, room #, email, phone..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option value="all">All Status</option>
            <option value="reserved">Reserved</option>
            <option value="checked-in">Checked In</option>
            <option value="due-checkin">Due Check-in</option>
            <option value="due-checkout">Due Check-out</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option value="checkoutSoon">Check-out soonest</option>
            <option value="checkinSoon">Check-in soonest</option>
            <option value="room">Room number</option>
            <option value="name">Name</option>
          </select>

          <button
            onClick={() => navigate('/archived-guests')}
            className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition">
            Archived Guests
          </button>
        </div>
      </div>
      {/* Guest Cards and Table */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {visibleGuests.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onEdit={() => setEditGuest(guest)}
              onCheckIn={() => setCheckInGuest(guest)}
              onCheckOut={() => setCheckOutGuest(guest)}
              onDelete={() => setDeleteGuestId(guest.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 max-w-6xl mx-auto w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-3 text-center">Name</th>
                  <th className="p-3 text-center">Room</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Check-in</th>
                  <th className="p-3 text-center">Check-out</th>
                  <th className="p-3 text-center">Email</th>
                  <th className="p-3 text-center">Phone</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleGuests.map((g) => (
                  <tr key={g.id} className="border-t border-gray-100 hover:bg-gray-300">
                    <td className="p-3 font-medium text-gray-900">{g.name}</td>
                    <td className="p-3 text-black">{g.roomNumber}</td>

                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-lg text-xs ${statusBadgeClass(g)}`}>
                        {getUIStatus(g)}
                      </span>
                    </td>

                    <td className="p-3 text-black">{g.checkInDate ?? "—"}</td>
                    <td className="p-3 text-black">{g.checkOutDate ?? "—"}</td>
                    <td className="p-3 text-black">{g.email ?? "—"}</td>
                    <td className="p-3 text-black">{g.phone ?? "—"}</td>

                    <td className="p-3 ">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditGuest(g)}
                          className="w-[90px] h-[50px] px-3 py-1 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                        >
                          Edit
                        </button>

                        {actionButtonType(g) === "checkin" && (
                          <button
                            onClick={() => setCheckInGuest(g)}
                            className="w-[90px] h-[50px] px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                          >
                            Check-in
                          </button>
                        )}

                        {actionButtonType(g) === "checkout" && (
                          <button
                            onClick={() => setCheckOutGuest(g)}
                            className="w-[90px] h-[50px] px-3 py-1 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 transition"
                          >
                            Check-out
                          </button>
                        )}

                        {actionButtonType(g) === "checkedOut" && (
                          <button
                            disabled
                            className="px-3 py-1 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                          >
                            Checked out
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteGuestId(g.id)}
                          className="px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {visibleGuests.length === 0 && (
        <p className="text-center text-gray-500 mt-12">No guests found.</p>
      )}

      {/* Modals */}
      {editGuest && (
        <EditGuestModal
          guest={editGuest}
          onClose={() => setEditGuest(null)}
          onSave={handleSaveEdit}
        />
      )}

      {checkInGuest && (
        <CheckInConfirmModal
          guestName={checkInGuest.name}
          onCancel={() => setCheckInGuest(null)}
          onConfirm={async () => {
            await handleCheckIn(checkInGuest.id);
            setCheckInGuest(null);
          }}
        />
      )}

      {checkOutGuest && (
        <CheckoutModal
          guestId={checkOutGuest.id}
          roomId={checkOutGuest.roomId}
          onClose={() => setCheckOutGuest(null)}
        />
      )}

      {deleteGuestId && (
        <DeleteConfirmModal
          onCancel={() => setDeleteGuestId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
