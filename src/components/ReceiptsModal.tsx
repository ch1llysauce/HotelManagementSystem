import { useRef } from "react";
import type { ArchivedGuest } from "../types";
interface ReceiptModalProps {
  guest: ArchivedGuest;
  onClose: () => void;
}

export default function ReceiptModal({ guest, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printContents = receiptRef.current.innerHTML;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<html><head><title>Receipt</title></head><body>${printContents}</body></html>`);
      w.document.close();
      w.print();
    }
  };

  const handleEmail = () => {
    // Optional: integrate Firebase Functions or external service to send email
    alert("Email functionality not implemented yet.");
  };

  const parseDate = (dateStr?: string) => (dateStr ? new Date(dateStr + "T00:00") : null);
  const checkInDate = parseDate(guest.checkInDate)?.toLocaleDateString() ?? "-";
  const checkOutDate = parseDate(guest.checkOutDate)?.toLocaleDateString() ?? "-";
  const nights = Math.max(
    0,
    Math.round(
      ((parseDate(guest.checkOutDate)?.getTime() ?? 0) - (parseDate(guest.checkInDate)?.getTime() ?? 0)) /
        (1000 * 60 * 60 * 24)
    )
  );

  const roomRate = 1000;
  const extras = guest.extras ?? 0;
  const depositPaid = guest.deposit ?? 0;
  const roomCharges = nights * roomRate;
  const totalCost = roomCharges + extras;
  const balance = totalCost - depositPaid;

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
            <p><strong className="text-black">Name:</strong><span className="text-gray-700">{guest.name}</span></p>
            <p><strong className="text-black">Room:</strong> <span className="text-gray-700">{guest.room}</span></p>
            <p><strong className="text-black">Check-In:</strong> <span className="text-gray-700">{checkInDate}</span></p>
            <p><strong className="text-black">Check-Out:</strong> <span className="text-gray-700">{checkOutDate}</span></p>
            <p><strong className="text-black">Nights:</strong> <span className="text-gray-700">{nights}</span></p>
            <p><strong className="text-black">Archived At:</strong> <span className="text-gray-700">{(guest.archivedAt as any)?.toDate?.()?.toLocaleDateString() ?? "-"}</span></p>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-1">
            <p><strong className="text-black">Room Charges:</strong> <span className="text-gray-700">₱{roomCharges}</span></p>
            <p><strong className="text-black">Extras:</strong> <span className="text-gray-700">₱{extras}</span></p>
            <p><strong className="text-black">Deposit Paid:</strong> <span className="text-gray-700">₱{depositPaid}</span></p>
            <p className="text-lg font-bold text-black">Total: ₱{totalCost}</p>
            <p className={`font-medium ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
              Balance: ₱{balance} ({balance > 0 ? "Pending" : "Paid"})
            </p>
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
