import firebase from "firebase/compat/app";

export interface Room {
  id: string;
  name: string;
  status: string;
}

export interface Guest {
   id: string;
  name: string;
  email: string;
  phone: string;
  room: string;
  checkedIn: boolean;
  timestamp?: any;
  checkInDate?: string;
  checkOutDate?: string;
  extras?: number;
  deposit?: number;
  balance?: number;
  checkedOutAt?: any;
}

export interface ArchivedGuest extends Guest {
  archivedAt: firebase.firestore.Timestamp;
}

export interface CheckOut {
  id: string;
  guestName: string;
  roomNumber: string;
  checkOutDate: string;
}