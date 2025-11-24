import React from 'react';
import type { CheckOut } from "../types";

interface CheckOutCardProps {
    checkout: CheckOut;
}

const CheckOutCard: React.FC<CheckOutCardProps> = ({ checkout }) => {
    return (
        <div className="border p-4 rounded shadow">
            <h2 className="font-bold">{checkout.guestName}</h2>
            <p>Room Number: {checkout.roomNumber}</p>
            <p>Check-Out Date: {checkout.checkOutDate}</p>
        </div>
    );
}

export default CheckOutCard;