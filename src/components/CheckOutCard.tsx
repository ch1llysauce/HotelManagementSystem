import React from "react";
import type { Guest } from "../types";

interface CheckOutCardProps {
    guest: Guest;
}

const CheckOutCard: React.FC<CheckOutCardProps> = ({ guest }) => {
    return (
        <div className="w-full p-[1px] rounded-2xl bg-gradient-to-r from-gray-400 to-gray-600">
            <div className="
        bg-white 
        dark:bg-gray-900 
        rounded-2xl 
        shadow-lg 
        p-5 
        hover:shadow-xl 
        transition-shadow 
        border 
        border-gray-200 
        dark:border-gray-700
        w-full
        max-w-sm
        mx-auto
      "
            >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                    {guest.name}
                </h2>

                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <p className="truncate"><span className="font-medium">Room:</span> {guest.room}</p>
                    <p className="truncate"><span className="font-medium">Email:</span> {guest.email}</p>
                    <p className="truncate"><span className="font-medium">Phone:</span> {guest.phone}</p>
                </div>
            </div>
        </div>
    );
};

export default CheckOutCard;
