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
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import type { Guest } from "../types";
import CheckoutConfirmModal from "./CheckOutConfirmModal";

interface CheckoutModalProps {
  guestId: string;
  onClose: () => void;
}

export default function CheckoutModal({ guestId, onClose }: CheckoutModalProps) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "gcash">("cash");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed">("pending");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const roomRate = 1000;

  // Fetch guest and payment status
  useEffect(() => {
    async function fetchGuestAndPayment() {
      try {
        const guestRef = doc(db, "guests", guestId);
        const guestSnap = await getDoc(guestRef);

        if (!guestSnap.exists()) {
          alert("Guest not found");
          onClose();
          return;
        }

        const guestData = { id: guestSnap.id, ...guestSnap.data() } as Guest;
        setGuest(guestData);

        // Calculate payment status
        const paymentsQuery = query(
          collection(db, "payments"),
          where("guestId", "==", guestId)
        );
        const paymentsSnap = await getDocs(paymentsQuery);

        let totalPaid = 0;
        paymentsSnap.forEach(doc => {
          const data = doc.data();
          totalPaid += data.amount ?? 0;
        });

        const checkInDate = new Date(guestData.checkInDate + "T00:00");
        const checkOutDate = new Date(guestData.checkOutDate + "T00:00");
        const nights = Math.max(0, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000*60*60*24)));
        const extras = guestData.extras ?? 0;
        const totalCost = nights * roomRate + extras;

        setPaymentStatus(totalPaid >= totalCost ? "completed" : "pending");

      } catch (error) {
        console.error("Error fetching guest or payments:", error);
        alert("Failed to fetch guest data.");
        onClose();
      }
    }

    fetchGuestAndPayment();
  }, [guestId, onClose]);

  if (!guest) return null;

  const parseDate = (dateStr?: string) => (dateStr ? new Date(dateStr + "T00:00") : null);
  const checkInDate = parseDate(guest.checkInDate);
  const checkOutDate = parseDate(guest.checkOutDate);

  const nights =
    checkInDate && checkOutDate
      ? Math.max(0, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

  const extras = guest.extras ?? 0;
  const depositPaid = guest.deposit ?? 0;

  const roomCharges = nights * roomRate;
  const totalDue = roomCharges + extras - depositPaid;

  async function handleCheckout() {
    if (!guest) return;
    if (!guest.id) return alert("Guest ID missing");
    if (nights <= 0) return alert("Invalid check-in/check-out dates");

    setLoading(true);

    try {
      const totalCost = roomCharges + extras;
      const remainingPayment = Math.max(0, totalCost - depositPaid);

      if (remainingPayment > 0) {
        await recordPayment(guest.id, remainingPayment, paymentMethod, "full", "completed");
      }

      await updateDoc(doc(db, "guests", guest.id), {
        checkedIn: false,
        checkedOutAt: serverTimestamp(),
        balance: 0,
      });

      alert(`Guest ${guest.name} successfully checked out.`);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Checkout failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

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
            Pending Balance — Payment Not Fully Completed
          </div>
        )}

        <div className="space-y-2 text-lg text-gray-700">
          <p><strong>Nights:</strong> {nights}</p>
          <p><strong>Room Charges:</strong> ₱{roomCharges}</p>
          <p><strong>Extras:</strong> ₱{extras}</p>
          <p><strong>Deposit Paid:</strong> ₱{depositPaid}</p>
          <p className="text-xl mt-4 font-bold">
            Total Due: <span className="text-blue-600">₱{totalDue}</span>
          </p>
        </div>

        <div className="mt-6">
          <label className="block text-gray-600 mb-1 font-medium">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as "cash" | "card" | "gcash")}
            className="w-full border rounded-lg p-2"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="gcash">GCash</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
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
          onConfirm={() => {
            setShowConfirm(false);
            handleCheckout();
          }}
        />
      )}

    </div>
  );
}
