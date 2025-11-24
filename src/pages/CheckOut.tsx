import { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import type { Guest } from "../types";
import GuestCard from "../components/GuestCard";

export default function CheckOut() {
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    return onSnapshot(collection(db, 'guests'), (snapshot) => {
      const data: Guest[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name as string,
        roomNumber: doc.data().room as string,
        checkedIn: doc.data().checkedIn as boolean,
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
      <h1 className="text-2xl font-bold mb-6">Check-Out</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {guests
          .filter((guest) => guest.checkedIn) // show only checked-in guests
          .map((guest) => (
            <div key={guest.id} className="relative">
              <GuestCard guest={guest} />
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
