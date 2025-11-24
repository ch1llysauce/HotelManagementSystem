import { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, QuerySnapshot, type DocumentData } from 'firebase/firestore';
import type { Guest } from "../types";
import GuestCard from "../components/GuestCard";

export default function Guests() {
    const [guests, setGuests] = useState<Guest[]>([]);

    useEffect(() => {
        return onSnapshot(collection(db, 'guests'), (snapshot: QuerySnapshot<DocumentData>) => {
            const data: Guest[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name as string,
                roomNumber: doc.data().room as string,
                checkedIn: doc.data().checkedIn as boolean,
            }));
            setGuests(data);
        });
    }, []);
    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-6">Guest List</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {guests.map((guest) => (
                    <GuestCard key={guest.id} guest={guest} />
                ))}
            </div>
        </div>
    );
}