import { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import type { Guest } from "../types";
import CheckOutCard from '../components/CheckOutCard';

export default function CheckOut() {
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    return onSnapshot(collection(db, 'guests'), (snapshot) => {
      const data: Guest[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email,
        phone: doc.data().phone,
        room: doc.data().room,
        checkedIn: doc.data().checkedIn,
        timestamp: doc.data().timestamp,
      }));
      setGuests(data);
    });
  }, []);

  // Optional: function to mark guest as checked out
  const handleCheckOut = async (guestId: string) => {
    const guestRef = doc(db, 'guests', guestId);
    await updateDoc(guestRef, { checkedIn: false });
  };

  return (
    <div className="p-10">
      <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Guest Check-Out
          </h1>
          <p className="mt-3 text-gray-500 text-lg md:text-xl">
            Manage guest check-outs, ensure all guests have completed their stay.
          </p>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {guests
          .filter((guest) => guest.checkedIn) // show only checked-in guests
          .map((guest) => (
            <div key={guest.id} className="flex flex-col items-center">
              <CheckOutCard guest={guest} />
              <button
                className="mt-2 px-4 py-1 bg-red-500 text-white rounded"
                onClick={() => handleCheckOut(guest.id)}
              >
                Check Out
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
