import React from "react";
import type { Guest } from "../types";

interface GuestCardProps {
    guest: Guest;
}

const GuestCard: React.FC<GuestCardProps> = ({ guest }) => {
    return (
        <div className="border p-4 rounded shadow">
            <h2 className="font-bold">{guest.name}</h2>
            <p>Room Number: {guest.roomNumber}</p>
            <p>Status: {guest.checkedIn ? "Checked In" : "Checked Out"}</p>
        </div>
    );
};

export default GuestCard;

