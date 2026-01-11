// utils/guests.ts (or wherever you fetch guests)
import { collection, doc, addDoc, getDocs, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import type { Guest } from "../types";
import { updateRoom } from "./rooms.service";

const toYMD = (value: any) => {
  if (!value) return undefined;

  // Timestamp
  if (typeof value?.toDate === "function") {
    const d = value.toDate();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // Date
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // string
  if (typeof value === "string") {
    return value.includes("T") ? value.split("T")[0] : value;
  }

  return undefined;
};

const addDays = (ymd: string, days: number) => {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toYMD(date);
}

export const addGuest = async (guest: Omit<Guest, "id">) => {
  const checkInYMD = guest.checkInDate ? toYMD(guest.checkInDate) : toYMD(new Date());
  const checkOutYMD = guest.checkOutDate ? toYMD(guest.checkOutDate) : (checkInYMD ? addDays(checkInYMD, 1) : undefined);

  await addDoc(collection(db, "guests"), {
    name: guest.name,
    email: guest.email,
    phone: guest.phone,
    roomId: guest.roomId,
    roomNumber: guest.roomNumber,

    // planned date-only strings
    checkInDate: checkInYMD,
    checkOutDate: checkOutYMD,

    checkedIn: false,
    checkedOut: false,
  });
};

export const fetchGuests = async (): Promise<Guest[]> => {
  const snapshot = await getDocs(collection(db, "guests"));

  return snapshot.docs.map((d) => {
    const data: any = d.data();

    return {
      id: d.id,
      name: data.name ?? "",
      roomNumber: data.roomNumber ?? 0,
      email: data.email ?? "",
      phone: data.phone ?? "",
      roomId: data.roomId ?? "",
      checkedIn: !!data.checkedIn,
      checkedOut: !!data.checkedOut,

      // normalize everything to "YYYY-MM-DD"
      checkInDate: toYMD(data.checkInDate),
      checkOutDate: toYMD(data.checkOutDate),
    };
  });
};

// Confirm check-in
export const confirmCheckIn = async (guestId: string) => {
  await updateDoc(doc(db, "guests", guestId), { checkedIn: true });
};

// Confirm check-out
export const confirmCheckOut = async (guestId: string) => {
  const guestRef = doc(db, "guests", guestId);

  const snap = await getDoc(guestRef);
  if (!snap.exists()) throw new Error("Guest not found");

  const data: any = snap.data();
  const roomId = data.roomId;

  if (!roomId) throw new Error("Guest has no roomId");

  await updateDoc(doc(db, "guests", guestId), { checkedOut: true });

  await updateRoom(roomId, { status: "Cleaning", assignedGuestId: null });
};