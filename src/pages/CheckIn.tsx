import { useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function CheckIn() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await addDoc(collection(db, "guests"), {
      name,
      room,
      checkedIn: true,
      timestamp: Date.now(),
    });

    alert("Guest checked in!");
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Check-In</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
        <input
          className="border p-2"
          placeholder="Guest Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Room Number"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />

        <button className="bg-blue-500 text-white p-2 rounded">
          Check-In
        </button>
      </form>
    </div>
  );
}
