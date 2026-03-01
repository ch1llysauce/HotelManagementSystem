import { useState, useEffect } from "react";
import { recordPayment } from "../utils/payments";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import type { Guest } from "../types";
import CheckoutConfirmModal from "./CheckOutConfirmModal";

interface CheckoutModalProps {
  guestId: string;
  roomId: string;
  onClose: () => void;
}

export default function CheckoutModal({ guestId, roomId, onClose }: CheckoutModalProps) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "gcash">("cash");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed">("pending");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [balance, setBalance] = useState(0);
  const [roomRate, setRoomRate] = useState(0);
  /* ------------------- */
  /* Helper: Calculate nights */
  /* ------------------- */
  function calculateNights(checkIn?: Timestamp | string, checkOut?: Timestamp | string) {
    if (!checkIn || !checkOut) return 0;
    const inDate = new Date(checkIn instanceof Timestamp ? checkIn.toDate() : (checkIn + "T00:00"));
    const outDate = new Date(checkOut instanceof Timestamp ? checkOut.toDate() : (checkOut + "T00:00"));
    const diffTime = outDate.getTime() - inDate.getTime();
    const diffDays = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    return diffDays;
  }

  /* ------------------- */
  /* Fetch Guest & Balance */
  /* ------------------- */
  useEffect(() => {
    async function fetchGuestAndPayment() {
      try {
        // Fetch Guest
        const guestRef = doc(db, "guests", guestId);
        const guestSnap = await getDoc(guestRef);

        if (!guestSnap.exists()) {
          alert("Guest not found");
          onClose();
          return;
        }

        const guestData = { id: guestSnap.id, ...guestSnap.data() } as Guest;
        setGuest(guestData);

        // Fetch Room (room rate)
        let fetchedRoomRate = 0;
        if (guestData.roomId) {
          const roomSnap = await getDoc(doc(db, "rooms", guestData.roomId));
          if (roomSnap.exists()) {
            fetchedRoomRate = Number(roomSnap.data().price ?? 0);
          }
        }
        setRoomRate(fetchedRoomRate);

        // Fetch Payments
        const paymentsQuery = query(
          collection(db, "payments"),
          where("guestId", "==", guestId)
        );
        const paymentsSnap = await getDocs(paymentsQuery);

        let paymentsTotal = 0;
        paymentsSnap.forEach(doc => {
          paymentsTotal += Number(doc.data().amount ?? 0);
        });

        // Calculations
        const nights = calculateNights(
          guestData.checkInDate,
          guestData.checkOutDate
        );


        const totalCost = nights * fetchedRoomRate;
        const totalPaid = paymentsTotal;
        const balance = totalCost - totalPaid;

        // Update UI State
        setBalance(balance > 0 ? balance : 0);
        setPaymentStatus(balance <= 0 ? "completed" : "pending");

        // Optional debug
        console.log({
          nights,
          fetchedRoomRate,
          totalCost,
          totalPaid,
          balance
        });

      } catch (error) {
        console.error("Error fetching guest/payment data:", error);
        alert("Failed to load billing data.");
        onClose();
      }
    }

    fetchGuestAndPayment();
  }, [guestId, onClose]);

  /* ------------------- */
  /* Null-safe calculations for UI */
  /* ------------------- */
  const nights = guest ? calculateNights(guest.checkInDate, guest.checkOutDate) : 0;
  const depositPaid = Number(guest?.deposit ?? 0);
  const roomCharges = nights * roomRate;

  if (!guest) return null;

  /* ------------------- */
  /* Checkout Handler */
  /* ------------------- */
  async function handleCheckout() {
    if (loading) return; // prevent double submit

    // If already checked out, don't re-run writes
    if (guest?.checkedOut) {
      alert("This guest is already checked out.");
      onClose();
      return;
    }

    if (!guest?.id) return alert("Guest ID missing");
    if (!guest.roomId) return alert("Guest room information missing");
    if (nights <= 0) return alert("Invalid stay duration");

    setLoading(true);

    try {
      // 1) If there’s still a balance, record the final payment
      if (balance > 0) {
        await recordPayment(
          guest.id,
          balance,
          paymentMethod,
          "full",
          "completed"
        );
      }

      // 2) Update guest record: mark out + set balance to 0
      const guestRef = doc(db, "guests", guest.id);
      console.log("STEP 2 guests...");
      await updateDoc(guestRef, {
        checkedIn: false,
        checkedOut: true,
        status: "checked-out",
        checkedOutAt: serverTimestamp(),
        overdueSince: null,
        balance: 0,
      });

      // 3) Update room: Cleaning + clear assignedGuestId
      const roomRef = doc(db, "rooms", guest.roomId);
      console.log("STEP 3 rooms...");
      await updateDoc(roomRef, {
        status: "Cleaning",
        assignedGuestId: null,
      });

      // 4) Log action
      console.log("STEP 4 logs...");
      await addDoc(collection(db, "logs"), {
        action: "check-out",
        guestId: guest.id,
        timestamp: serverTimestamp(),
      });

      // 5) Archive guest WITH balance forced to 0
      console.log("STEP 5 archive...");
      await addDoc(collection(db, "archivedGuests"), {
        id: guest.id,
        archivedAt: serverTimestamp(),
        balance: 0,

        checkInDate: guest.checkInDate ?? null,
        checkOutDate: guest.checkOutDate ?? null,
        expectedCheckOut: guest.expectedCheckOut ?? null,

        checkedIn: false,
        checkedOut: true,
        checkedOutAt: serverTimestamp(),

        deposit: Number(guest.deposit ?? 0),
        extras: guest.extras ?? null,

        email: guest.email ?? "",
        name: guest.name ?? "",
        phone: guest.phone ?? "",
        notes: guest.notes ?? "",

        overdueSince: null,

        roomId: guest.roomId ?? "",          // (or use your effectiveRoomId)
        roomNumber: guest.roomNumber ?? 0,

        status: "checked-out",
        timestamp: guest.timestamp ?? null,
      });

      console.log("DONE");
      alert(`Guest ${guest.name} successfully checked out.`);
      onClose();
    } catch (error: any) {
      console.error("CHECKOUT FAILED:", error?.code, error?.message, error);
      alert(`Checkout failed at a later step: ${error?.code ?? ""} ${error?.message ?? ""}`.trim());
    } finally {
      setLoading(false);
    }
  }

  /* ------------------- */
  /* UI */
  /* ------------------- */
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Check-Out: {guest.name}
        </h2>

        {paymentStatus === "completed" && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 font-medium">
            Fully Paid
          </div>
        )}

        {paymentStatus === "pending" && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-100 text-yellow-800 font-medium">
            Pending Balance — Payment Required
          </div>
        )}

        <div className="space-y-2 text-lg text-gray-700">
          <p><strong>Nights:</strong> {nights}</p>
          <p><strong>Room Charges:</strong> ₱{roomCharges}</p>
          <p><strong>Deposit Paid:</strong> ₱{depositPaid}</p>
          <p className="text-xl mt-4 font-bold">
            Total Due: <span className="text-blue-600">₱{balance}</span>
          </p>
        </div>

        <div className="mt-6">
          <label className="block text-gray-600 mb-1 font-medium">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as "cash" | "card" | "gcash")
            }
            className="w-full border rounded-lg p-2 text-gray-50"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="gcash">GCash</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading || nights <= 0}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Check-Out"}
          </button>
        </div>
      </div>

      {showConfirm && (
        <CheckoutConfirmModal
          guestName={guest.name}
          onCancel={() => setShowConfirm(false)}
          onConfirm={async () => {
            setShowConfirm(false);
            await handleCheckout();
          }}
        />
      )}
    </div>
  );
}
