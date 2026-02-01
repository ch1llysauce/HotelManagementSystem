import { useEffect, useRef, useState } from "react";
import type { ArchivedGuest } from "../types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { toDate } from "../utils/hotelDates";

interface ReceiptModalProps {
  guest: ArchivedGuest;
  onClose: () => void;
}

export default function ReceiptModal({ guest, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  console.log("Receipt guest source fields:", guest);
  console.log("archived balance: ", guest.balance);

  const checkIn = toDate(guest.checkInDate);
  const checkOut = toDate(guest.checkOutDate);
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const nights =
    checkIn && checkOut
      ? Math.max(
        Math.ceil((checkOut.getTime() - checkIn.getTime()) / MS_PER_DAY),
        1
      )
      : 1;

  const [roomRate, setRoomRate] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    const loadRoomRate = async () => {
      try {
        if (!guest.roomId) {
          if (!cancelled) setRoomRate(0);
          return;
        }

        const roomSnap = await getDoc(doc(db, "rooms", guest.roomId));
        const price = roomSnap.exists() ? Number(roomSnap.data().price ?? 0) : 0;

        if (!cancelled) setRoomRate(price);
      } catch (err) {
        console.error("Failed to fetch room rate:", err);
        if (!cancelled) setRoomRate(0);
      }
    };

    loadRoomRate();
    return () => {
      cancelled = true;
    };
  }, [guest.roomId]);

  const extras = guest.extras ?? 0;
  const depositPaid = guest.deposit ?? 0;

  const roomCharges = nights * roomRate;
  const totalCost = roomCharges + extras;
  const lastPayment = totalCost - depositPaid;

  const computedBalance = Math.max(0, totalCost - depositPaid);
  const balance =
    typeof guest.balance === "number" ? guest.balance : computedBalance;

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printContents = receiptRef.current.innerHTML;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(
        `<html><head><title>Receipt</title></head><body>${printContents}</body></html>`
      );
      w.document.close();
      w.print();
    }
  };

  const handleEmail = async () => {
    if (!receiptRef.current) return;
    if (!guest.email) {
      alert("Guest email not available");
      return;
    }

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      ${receiptRef.current.innerHTML}
    </div>
  `;

    try {
      const res = await fetch(
        "https://asia-southeast1-hotelmanagement-e654a.cloudfunctions.net/sendReceipt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: guest.email,
            subject: "Your Hotel Receipt",
            html: htmlContent,
          }),
        }
      );

      const text = await res.text(); // ✅ read raw response
      console.log("sendReceipt status:", res.status);
      console.log("sendReceipt response:", text);

      if (!res.ok) {
        alert(`Email failed (HTTP ${res.status}). Check console for details.`);
        return;
      }

      // parse JSON if possible
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: true, raw: text };
      }

      alert(data.success ? "Receipt emailed successfully!" : "Failed to send email");
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Error sending receipt email");
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-200 rounded-2xl shadow-xl p-6 w-full max-w-md animate-fadeIn relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>

        <div ref={receiptRef} className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-black">Hotel Receipt</h2>

          <div className="border-t border-gray-200 pt-4">
            <p>
              <strong className="text-black">Name:</strong>{" "}
              <span className="text-gray-700">{guest.name}</span>
            </p>
            <p>
              <strong className="text-black">Email:</strong>{" "}
              <span className="text-gray-700">{guest.email}</span>
            </p>
            <p>
              <strong className="text-black">Room:</strong>{" "}
              <span className="text-gray-700">{guest.roomNumber}</span>
            </p>
            <p>
              <strong className="text-black">Check-In:</strong>{" "}
              <span className="text-gray-700">{checkIn?.toLocaleDateString() ?? "-"}</span>
            </p>
            <p>
              <strong className="text-black">Check-Out:</strong>{" "}
              <span className="text-gray-700">{checkOut?.toLocaleDateString() ?? "-"}</span>
            </p>
            <p>
              <strong className="text-black">Nights:</strong>{" "}
              <span className="text-gray-700">{nights}</span>
            </p>
            <p>
              <strong className="text-black">Archived At:</strong>{" "}
              <span className="text-gray-700">
                {(guest.archivedAt as any)?.toDate?.()?.toLocaleDateString() ?? "-"}
              </span>
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-1">
            <p>
              <strong className="text-black">Room Rate:</strong>{" "}
              <span className="text-gray-700">₱{roomRate}</span>
            </p>
            <p>
              <strong className="text-black">Room Charges:</strong>{" "}
              <span className="text-gray-700">₱{roomCharges}</span>
            </p>
            <p>
              <strong className="text-black">Extras:</strong>{" "}
              <span className="text-gray-700">₱{extras}</span>
            </p>
            <p>
              <strong className="text-black">Deposit Paid:</strong>{" "}
              <span className="text-gray-700">₱{depositPaid}</span>
            </p>
            <p>
              <strong className="text-black">Last Payment:</strong>{" "}
              <span className="text-gray-700">₱{lastPayment}</span>
            </p>
            <p className="text-lg font-bold text-black">Total: ₱{totalCost}</p>

            <p className="font-medium text-green-600">
              Balance: ₱{balance} ({balance > 0 ? "Pending" : "Paid"})
            </p>

            {/* Optional debug line while testing */}
            {/* <p className="text-xs text-gray-600">Computed balance was ₱{computedBalance}</p> */}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Print
            </button>
            <button
              onClick={handleEmail}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
