// pages/Guests.tsx
import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

import type { Guest } from "../types";
import { useToast } from "../components/Toast";
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

  return (
    <div className="p-10">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Guests</h1>
        <p className="mt-3 text-gray-500 text-lg md:text-xl">View and manage all checked-in guests.</p>
      </div>

      {/* Guest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {guests
          .filter((g) => !g.checkedOut)
          .sort((a, b) => {
            const rank = (s?: string) => {
              if (s === "overdue-check-out") return 0;
              if (s === "due-to-check-out") return 1;
              if (s === "checked-in") return 2;
              if (s === "reserved") return 3;
              return 4;
            };
            return rank(a.status) - rank(b.status);
          })
          .map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onEdit={() => setEditGuest(guest)}
              onCheckIn={(id) => setCheckInGuest(guest)}
              onCheckOut={(id) => setCheckOutGuest(guest)}
              onDelete={(id) => setDeleteGuestId(id)}
            />
          ))}
      </div>

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
