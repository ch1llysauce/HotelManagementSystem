import { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, QuerySnapshot, type DocumentData } from 'firebase/firestore';
import RoomCard from "../components/RoomCard";
import type { Room } from '../types';

export default function Rooms() {
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        return onSnapshot(collection(db, 'rooms'), (snapshot: QuerySnapshot<DocumentData>) => {
            const roomsData: Room[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name as string,     // type assertion
                status: doc.data().status as string, // type assertion
            }));
            setRooms(roomsData);
        });
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-6">Room Status</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {rooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                ))}
            </div>
        </div>
    );
}
