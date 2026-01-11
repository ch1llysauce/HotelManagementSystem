import { useState } from "react";
import { Room } from "../types";

interface AddRoomFormProps {
  onAdd: (room: Omit<Room, "status" | "assignedGuestId">) => void;
}

export function AddRoomForm({ onAdd }: AddRoomFormProps) {
  const [form, setForm] = useState({
    number: "",
    type: "Single",
    price: "",
    floor: "",
    description: "",
  });

  const handleSubmit = () => {
    onAdd({
      number: Number(form.number),
      type: form.type as "Single" | "Double" | "Deluxe",
      price: Number(form.price),
      floor: Number(form.floor),
      description: form.description,
    });

    setForm({ number: "", type: "Single", price: "", floor: "", description: "" });
  };

  return (
    <div className="border p-4 mb-6 rounded-lg">
      <h2 className="text-xl mb-3 text-black">Add Room</h2>
      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Room Number"
          value={form.number}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="Single">Single</option>
          <option value="Double">Double</option>
          <option value="Deluxe">Deluxe</option>
        </select>
        <input
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Floor"
          value={form.floor}
          onChange={(e) => setForm({ ...form, floor: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
}
