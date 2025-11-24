export interface Room {
  id: string;
  name: string;
  status: string;
}

export interface Guest {
  id: string;
  name: string;
  roomNumber: string;
  checkedIn: boolean; 
}

export interface CheckOut {
  id: string;
  guestName: string;
  roomNumber: string;
  checkOutDate: string;
}