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
}

export interface CheckOut {
  id: string;
  guestName: string;
  roomNumber: string;
  checkOutDate: string;
}