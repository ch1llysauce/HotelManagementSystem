import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export async function autoUpdateReservedRooms(){
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const roomsSnap = await getDocs(
        query(collection(db, "rooms"), where("status", "==", "reserved"))
    );

    for (const roomDoc of roomsSnap.docs) {
        const room = roomDoc.data();
        if(!room.assignedGuestId) continue;

        const guestSnap = await getDocs(
            query(collection(db, "guests"), where("id", "==", room.assignedGuestId))
        );

        if(guestSnap.empty) continue;

        const guest = guestSnap.docs[0].data();
        if(!guest.checkInDate) continue;

        const checkIn = new Date(guest.checkInDate);
        checkIn.setHours(0, 0, 0, 0);

        if(checkIn.getTime() === today.getTime()){
            await updateDoc(doc(db, "rooms", roomDoc.id), {
                status: "occupied"
            });
        }
    }
}