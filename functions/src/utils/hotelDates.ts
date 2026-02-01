import { Timestamp } from "firebase/firestore";

export function setTime(date: Date, hours: number, minutes: 0){
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d;
}

export const normalizeHotelDates = (checkIn: Date, checkOut: Date) => ({
    checkIn: setTime(checkIn, 14, 0), // 2 PM check-in
    checkOut: setTime(checkOut, 12, 0) // 12 PM check-out
});

export function toDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value instanceof Timestamp) return value.toDate();
    if (typeof value === 'string') return new Date(value);
    return null;
}