import { Timestamp } from "firebase/firestore";
export type RoomStatus = "Available" | "Occupied" | "Reserved" | "Cleaning";

export interface Room {
  number: number;
  type: "Single" | "Double" | "Deluxe";
  price: number;
  floor: number;
  description?: string;
  status: RoomStatus;
  assignedGuestId: string | null;
  createdAt?: Date;
}

export interface RoomDocument extends Room {
  id: string;
}



export interface Guest {
   id: string;
  name: string;
  email: string;
  phone: string;
  roomId: string;
  roomNumber: number;
  checkedIn: boolean;
  checkedOut: boolean;
  checkInDate?: string;
  checkOutDate?: string;

  extras?: number;
  deposit?: number;
  balance?: number;
}

export interface ArchivedGuest {
  id: string;
  name: string;
  email: string;
  phone: string;
  roomId: string;
  roomNumber: number;

  checkInDate?: string;
  checkOutDate?: string;

  extras?: number;
  deposit?: number;
  balance?: number;

  archivedAt: Timestamp;
  checkedOutAt?: Timestamp; 
}

export interface CheckOut {
  id: string;
  guestName: string;
  roomNumber: string;
  checkOutDate: string;
}