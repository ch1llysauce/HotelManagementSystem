import {
  addDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Room, RoomDocument } from "../types";

const roomsRef = collection(db, "rooms");

// Predefined rooms
const defaultRooms: Omit<Room, "status" | "assignedGuestId" | "createdAt">[] = [
  { number: 101, type: "Single", price: 1500, floor: 1, description: "Standard" },
  { number: 102, type: "Single", price: 1500, floor: 1, description: "Standard" },
  { number: 103, type: "Double", price: 2000, floor: 1, description: "Standard" },
  { number: 104, type: "Double", price: 2000, floor: 1, description: "Standard" },
  { number: 105, type: "Deluxe", price: 2800, floor: 1, description: "Premium" },
  { number: 201, type: "Single", price: 1600, floor: 2, description: "Standard" },
  { number: 202, type: "Double", price: 2100, floor: 2, description: "Standard" },
  { number: 203, type: "Double", price: 2100, floor: 2, description: "Standard" },
  { number: 204, type: "Deluxe", price: 2900, floor: 2, description: "Premium" },
  { number: 205, type: "Deluxe", price: 3000, floor: 2, description: "Premium" },
  { number: 301, type: "Single", price: 1700, floor: 3, description: "Standard" },
  { number: 302, type: "Double", price: 2200, floor: 3, description: "Standard" },
  { number: 303, type: "Double", price: 2300, floor: 3, description: "Standard" },
  { number: 304, type: "Deluxe", price: 3000, floor: 3, description: "Premium" },
  { number: 305, type: "Deluxe", price: 3200, floor: 3, description: "Premium" },
];

// Seed rooms only if empty
export const seedRoomsIfEmpty = async () => {
  const snapshot = await getDocs(roomsRef);

  // Collect existing room numbers
  const existingNumbers = new Set(
    snapshot.docs.map((doc) => doc.data().number)
  );

  const roomsToCreate = defaultRooms.filter(
    (room) => !existingNumbers.has(room.number)
  );

  if (roomsToCreate.length === 0) {
    console.log("Rooms already seeded");
    return;
  }

  const writes = roomsToCreate.map((room) =>
    addDoc(roomsRef, {
      ...room,
      status: "Available",
      assignedGuestId: null,
      createdAt: new Date(),
    })
  );

  await Promise.all(writes);
  console.log(`Seeded ${roomsToCreate.length} rooms`);
};



// Add room
export const addRoom = (roomData: Omit<Room, "status" | "assignedGuestId">) => {
  return addDoc(roomsRef, {
    ...roomData,
    status: "Available",
    assignedGuestId: null,
    createdAt: new Date(),
  });
};

// Update room
export const updateRoom = (roomId: string, updates: Partial<Room>) => {
  return updateDoc(doc(db, "rooms", roomId), updates);
};

// Delete room
export const deleteRoomById = async (roomId: string) => {
  const snapshot = await getDocs(roomsRef);
  // Prevent deletion if less than 15 rooms (default rooms)
  if (snapshot.size <= defaultRooms.length) {
    console.warn("Cannot delete default room!");
    return;
  }
  return deleteDoc(doc(db, "rooms", roomId));
};

// Real-time listener
export const listenToRooms = (callback: any) => {
  const q = query(roomsRef, orderBy("floor"), orderBy("number"));
  return onSnapshot(q, callback);
};
