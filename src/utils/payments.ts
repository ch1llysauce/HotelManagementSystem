import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export async function recordPayment(
  guestId: string, 
  amount: number, 
  method: string, 
  type: "deposit" | "full",
  status: "pending" | "completed" = "pending") {
  try {
    await addDoc(collection(db, "payments"), {
      guestId,
      amount,
      method,
      type,
      status,
      timestamp: serverTimestamp(),
    });
    console.log(`Payment recorded: ${amount} via ${method}`);
  } catch (error) {
    console.error("Failed to record payment:", error);
    throw error;
  }
}
