import { useMemo, useState } from "react";
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

  const [error, setError] = useState<string>("");

  const digitsOnly = (value: string) => value.replace(/\D/g, "");

  // compute validity
  const { isValid, roomNumber, price, floor } = useMemo(() => {
    const rn = Number(form.number);
    const pr = Number(form.price);
    const fl = Number(form.floor);

    const ok =
      form.number.trim() !== "" &&
      form.price.trim() !== "" &&
      form.floor.trim() !== "" &&
      !Number.isNaN(rn) &&
      !Number.isNaN(pr) &&
      !Number.isNaN(fl) &&
      rn > 0 &&
      pr > 0 &&
      fl >= 1 &&
      fl <= 50;

    return { isValid: ok, roomNumber: rn, price: pr, floor: fl };
  }, [form.number, form.price, form.floor]);

  const handleSubmit = () => {
    setError("");

    // Safety (in case someone bypasses disabled)
    if (!isValid) {
      setError("Please enter valid Room Number, Price, and Floor (1-50).");
      return;
    }

    onAdd({
      number: roomNumber,
      type: form.type as "Single" | "Double" | "Deluxe",
      price,
      floor,
      description: form.description,
    });

    setForm({ number: "", type: "Single", price: "", floor: "", description: "" });
  };

  return (
    <div className="bg-slate-300 dark:bg-slate-800 p-4 mb-6 rounded-2xl shadow-md flex flex-col">
      <h2 className="text-xl mb-3 text-black dark:text-white">Add Room</h2>

      {error && <p className="mb-2 text-sm text-red-600 font-medium">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Room Number"
          inputMode="numeric"
          value={form.number}
          onChange={(e) =>
            setForm({ ...form, number: digitsOnly(e.target.value) })
          }
          className="border p-2 rounded text-gray-50"
        />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="text-gray-100 dark:text-gray-100 border p-2 rounded"
        >
          <option value="Single">Single</option>
          <option value="Double">Double</option>
          <option value="Deluxe">Deluxe</option>
        </select>

        <input
          placeholder="Price"
          inputMode="numeric"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: digitsOnly(e.target.value) })
          }
          className="border p-2 rounded text-gray-50"
        />

        <input
          placeholder="Floor"
          inputMode="numeric"
          value={form.floor}
          onChange={(e) =>
            setForm({ ...form, floor: digitsOnly(e.target.value) })
          }
          className="border p-2 rounded text-gray-50"
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded flex-1 text-gray-50"
        />

        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`px-4 py-2 rounded text-white transition
            ${
              isValid
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          title={
            isValid
              ? "Add room"
              : "Enter valid Room Number, Price, and Floor (Floor: 1-50)"
          }
        >
          Add
        </button>
      </div>
    </div>
  );
}
