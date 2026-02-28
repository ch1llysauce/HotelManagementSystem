import { useEffect, useState } from "react";
import { updateRoom, deleteRoomById, listenToRooms } from "../utils/rooms.service";
import { RoomDocument, Room, RoomStatus } from "../types";
import { RoomsOverview } from "../components/RoomsOverview";
import { RoomsByFloor } from "../components/RoomsByFloor";
import { autoUpdateReservedRooms } from "../utils/roomAutoStatus";
import { requireRecentPasswordAuth } from "../utils/security";
import { useToast } from "../components/Toast";

type PwAction =
  | { type: "delete"; roomId: string }
  | { type: "status"; roomId: string; status: RoomStatus }
  | null;

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomDocument[]>([]);
  const { showToast } = useToast();

  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pwAction, setPwAction] = useState<PwAction>(null);

  function openPw(action: PwAction) {
    setPw("");
    setPwAction(action);
    setPwOpen(true);
  }

  function closePw() {
    setPwOpen(false);
    setPwAction(null);
    setPw("");
  }

  function cancelPw() {
    closePw();
  }

  async function confirmPw() {
    if (!pw.trim()) {
      showToast("Password is required.");
      return;
    }

    try {
      await requireRecentPasswordAuth(() => Promise.resolve(pw));

      if (!pwAction) return;

      if (pwAction.type === "delete") {
        await deleteRoomById(pwAction.roomId);
        showToast("Room deleted");
      }

      if (pwAction.type === "status") {
        await updateRoom(pwAction.roomId, { status: pwAction.status });
        showToast("Room status updated");
      }

      closePw();
    } catch (e: any) {
      console.log("Auth error:", e);

      if (e?.code === "auth/wrong-password" || e?.code === "auth/invalid-credential") {
        showToast("Incorrect password.");
        setPw(""); 
        return; 
      }

      if (e?.message === "cancelled") {
        closePw();
        return;
      }

      showToast("Authentication failed.");
    }
  }

  function secureDeleteRoom(roomId: string) {
    openPw({ type: "delete", roomId });
  }

  function secureUpdateStatus(roomId: string, status: string) {
    openPw({ type: "status", roomId, status: status as RoomStatus });
  }

  useEffect(() => {
    autoUpdateReservedRooms();

    const unsub = listenToRooms((snapshot: { docs: any[] }) => {
      const data = snapshot.docs.map((doc) => ({
        ...(doc.data() as Room),
        id: doc.id,
      }));
      setRooms(data);
    });

    return unsub;
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Rooms Management</h1>

      <RoomsOverview rooms={rooms} />

      <RoomsByFloor
        rooms={rooms}
        onStatusChange={(id, status) => secureUpdateStatus(id, status)}
        onDelete={(id) => secureDeleteRoom(id)}
      />

      {pwOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirm for security
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              Please re-enter your password to continue.
            </p>

            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="mt-4 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
              placeholder="Password"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmPw();
                if (e.key === "Escape") cancelPw();
              }}
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cancelPw}
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmPw}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}