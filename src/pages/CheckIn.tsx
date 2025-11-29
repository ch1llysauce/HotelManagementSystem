import { useState, useRef } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

export default function CheckIn() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryISO, setCountryISO] = useState("");
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name || !phone || !email || !room || !checkInDate || !checkOutDate) {
      alert("Please fill in all fields.");
      return;
    }

    const trunkZeroDialCodes = ["63", "44", "81", "61", "64", "39", "33", "82", "49"];

    let sanitized = phone.replace(/[^\d+]/g, "");
    const dialCodeMatch = sanitized.match(/^\+(\d{1,3})/);
    const countryCode = dialCodeMatch ? dialCodeMatch[1] : "";
    let localNumber = sanitized.replace(`+${countryCode}`, "");

    if (trunkZeroDialCodes.includes(countryCode) && localNumber.startsWith("0")) {
      localNumber = localNumber.slice(1);
    }

    const finalPhone = `+${countryCode}${localNumber}`;
    console.log("Sanitized Phone:", finalPhone);

    try {
      const emailQuery = query(collection(db, "guests"), where("email", "==", email));
      const phoneQuery = query(collection(db, "guests"), where("phone", "==", finalPhone));

      const [emailSnap, phoneSnap] = await Promise.all([getDocs(emailQuery), getDocs(phoneQuery)]);

      if (!emailSnap.empty || !phoneSnap.empty) {
        alert("A guest with this email or phone number is already checked in.");
        phoneInputRef.current?.focus();
        return;
      }
    } catch (error) {
      console.error("Error checking duplicates:", error);
      alert("Failed to verify guest info. Try again.");
      return;
    }

    const confirmMessage = `
Please confirm the following details:

Name: ${name}
Phone: ${finalPhone}
Email: ${email}
Room: ${room}
Check-In Date: ${checkInDate}
Check-Out Date: ${checkOutDate}
Notes: ${notes || "None"}
  `;

    const isConfirmed = window.confirm(confirmMessage);
    if (!isConfirmed) {
      return; // User cancelled
    }

    if (phone.length < 10) {
      alert("Please enter a valid 11-digit phone number.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    // Optional: Validate room number (numeric only)
    if (!/^\d+$/.test(room)) {
      alert("Please enter a valid room number.");
      return;
    }
    setLoading(true);

    //Store guest data in Firestore
    try {
      await addDoc(collection(db, "guests"), {
        name,
        phone: finalPhone,
        email,
        room,
        checkInDate,
        checkOutDate,
        notes,
        checkedIn: true,
        timestamp: serverTimestamp(),
      });

      alert(`Guest "${name}" checked in successfully!`);
      setName("");
      setPhone("");
      setEmail("");
      setRoom("");
      setCheckInDate("");
      setCheckOutDate("");
      setNotes("");
    } catch (error) {
      console.error(error);
      alert("Failed to check in guest. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg p-8 md:p-12 transition-all">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Guest Check-In
          </h1>
          <p className="mt-3 text-gray-500 text-lg md:text-xl">
            Registration of guests, make sure to input all the necessary information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Full Name"
            value={name}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, "");
              setName(sanitized);
            }}
          />

          <PhoneInput
            country={countryISO || ""}
            value={phone}
            onChange={(value, data: any) => {
              setPhone(value);
              if (data?.countryCode) {
                setCountryISO(data.countryCode);
              } else {
                // If user typed a full number with +<code>, auto-detect ISO2
                const dialCodeMatch = value.replace(/[^\d+]/g, "").match(/^\+(\d{1,3})/);
                if (dialCodeMatch) {
                  const dialCode = dialCodeMatch[1];
                  // react-phone-input-2 exposes all countries internally
                  const country = require("react-phone-input-2/dist/lib/countries").find(
                    (c: any) => c.dialCode === dialCode
                  );
                  if (country) setCountryISO(country.iso2);
                }
              }
            }}
            inputProps={{
              name: "phone",
              ref: phoneInputRef,
              className:
                "border border-gray-300 rounded-lg p-3 pl-16 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full",
            }}
            countryCodeEditable={true}
            enableAreaCodes
            disableCountryGuess={false}
            specialLabel="Phone"
          />

          <input
            type="email"
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Room Number"
            value={room}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/\D/g, "");
              setRoom(sanitized);
            }}
            maxLength={5}
          />

          <div className="flex gap-4">
            {/* Check-In Date */}
            <div className="flex flex-col flex-1">
              <label
                htmlFor="checkInDate"
                className="text-gray-500 text-lg md:text-xl mb-1"
              >
                Check-In Date
              </label>
              <input
                id="checkInDate"
                type="date"
                className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>

            {/* Check-Out Date */}
            <div className="flex flex-col flex-1">
              <label
                htmlFor="checkOutDate"
                className="text-gray-500 text-lg md:text-xl mb-1"
              >
                Check-Out Date
              </label>
              <input
                id="checkOutDate"
                type="date"
                className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>
          </div>

          <textarea
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Special Requests / Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Checking In..." : "Check-In"}
          </button>
        </form>
      </div>
    </div>
  );
}