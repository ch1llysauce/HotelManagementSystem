import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Predefined rooms
const roomsToSeed = [
  // Floor 1
  { number: 101, type: "Single", price: 1500, floor: 1 },
  { number: 102, type: "Single", price: 1500, floor: 1 },
  { number: 103, type: "Double", price: 2000, floor: 1 },
  { number: 104, type: "Double", price: 2000, floor: 1 },
  { number: 105, type: "Deluxe", price: 2800, floor: 1 },

  // Floor 2
  { number: 201, type: "Single", price: 1600, floor: 2 },
  { number: 202, type: "Double", price: 2100, floor: 2 },
  { number: 203, type: "Double", price: 2100, floor: 2 },
  { number: 204, type: "Deluxe", price: 2900, floor: 2 },
  { number: 205, type: "Suite", price: 4000, floor: 2 },

  // Floor 3
  { number: 301, type: "Single", price: 1700, floor: 3 },
  { number: 302, type: "Twin", price: 2200, floor: 3 },
  { number: 303, type: "Double", price: 2300, floor: 3 },
  { number: 304, type: "Deluxe", price: 3000, floor: 3 },
  { number: 305, type: "Suite", price: 4500, floor: 3 },
];

export async function seedRooms() {
  const roomsRef = collection(db, "rooms");

  for (const room of roomsToSeed) {
    await addDoc(roomsRef, {
      ...room,
      status: "Available",
      assignedGuestId: null,
      createdAt: new Date(),
    });
  }

  return "Seeding completed!";
}
