import { useLayoutEffect, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Guest, RoomDocument } from "../types";
import DashboardCard from "../components/DashboardCard";
import { FiUsers, FiHome, FiCheckCircle } from "react-icons/fi";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig"; // adjust
import type { Role } from "../utils/permissions";
import { canAccess } from "../utils/permissions";

const todayRange = () => {
  const n = new Date();
  const s = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0, 0);
  const e = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 23, 59, 59, 999);
  return { s, e };
};
const isToday = (ts?: Timestamp | null) => {
  if (!ts) return false;
  const { s, e } = todayRange();
  const d = ts.toDate();
  return d >= s && d <= e;
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

function useCollectionSnap<T>(path: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, path),
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as T[]);
        setLoading(false);
        setErr(null);
      },
      (e) => {
        setLoading(false);
        setErr(e.code || "unknown");
        console.error(`${path} snapshot error:`, e);
      }
    );
    return () => unsub();
  }, [path]);

  return { data, loading, err };
}

export default function Dashboard() {
  const roomsSnap = useCollectionSnap<RoomDocument>("rooms");
  const guestsSnap = useCollectionSnap<Guest>("guests");


  const [role, setRole] = useState<Role | null>(null);

  const { roomsKpi, guestKpi, recentCheckouts } = useMemo(() => {
    const rooms = roomsSnap.data;
    const guests = guestsSnap.data;

    const total = rooms.length;
    const countRoom = (status: string) => rooms.filter((r) => r.status === status).length;
    const cleaning = rooms.filter((r) => r.status === "Cleaning" || r.status === "Housekeeping").length;
    const occupied = rooms.filter((r) => r.assignedGuestId != null).length;
    const occupancyRate = total ? Math.round((occupied / total) * 100) : 0;

    const activeGuests = guests.filter((g) => g.checkedOut === false);
    const checkedInNow = guests.filter((g) => g.checkedIn && !g.checkedOut).length;
    const arrivalsToday = guests.filter((g) => isToday(g.checkInDate as any) && !g.checkedOut).length;
    const departuresToday = guests.filter((g) => isToday(g.expectedCheckOut) && !g.checkedOut).length;
    const checkedOutToday = guests.filter((g) => isToday(g.checkedOutAt)).length;
    const overdue = guests.filter((g) => !g.checkedOut && (g.overdueSince != null || g.status === "overdue-check-out")).length;

    const outstandingBalance = activeGuests.reduce((sum, g) => sum + (Number(g.balance) || 0), 0);

    const recent = guests
      .filter((g) => g.checkedOutAt)
      .sort((a, b) => b.checkedOutAt!.toMillis() - a.checkedOutAt!.toMillis())
      .slice(0, 5);

    return {
      roomsKpi: {
        total,
        available: countRoom("Available"),
        reserved: countRoom("Reserved"),
        cleaning,
        occupied,
        occupancyRate,
      },
      guestKpi: {
        arrivalsToday,
        departuresToday,
        checkedOutToday,
        overdue,
        checkedInNow,
        activeGuests: activeGuests.length,
        outstandingBalance,
      },
      recentCheckouts: recent,
    };
  }, [roomsSnap.data, guestsSnap.data]);

  const loading = roomsSnap.loading || guestsSnap.loading;
  const permissionDenied = roomsSnap.err === "permission-denied" || guestsSnap.err === "permission-denied";

  const mobile = useIsMobile(1200);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);

    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;

    if (!mobile) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [mobile]);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole(null);
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      setRole((snap.data()?.role as Role) ?? null);
    });

    return () => unsub();
  }, []);

  return (
    <div
  className={`
    ${mobile ? "min-h-screen overflow-y-auto" : "h-screen overflow-hidden"}
    overscroll-none bg-gray-50 dark:bg-transparent lg:ml-64 max-w-4xl
  `}
>
      <div className="h-full mx-auto w-full max-w-screen-xl px-4 md:px-6 py-4">
        <div className="h-full flex flex-col min-h-0 gap-4">

          <div className="shrink-0">
            <div className="mb-3 text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                Hotel Management Dashboard
              </h1>
              <p className="mt-1 text-gray-500 text-sm md:text-base">
                Manage check-ins, check-outs, rooms, and guests efficiently.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-3 ">
              <DashboardCard title="Check-In" link="/checkin" icon={<FiCheckCircle size={22} />} disabled={!canAccess(role, "checkin")} />
              <DashboardCard title="Guest List" link="/guests" icon={<FiUsers size={22} />} disabled={!canAccess(role, "guests")} />
              <DashboardCard title="Room Status" link="/rooms" icon={<FiHome size={22} />} disabled={!canAccess(role, "rooms")} />
            </div>

            {(loading || permissionDenied) && (
              <div
                className={`mb-3 rounded-2xl border p-3 text-center
              ${permissionDenied
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200 bg-white dark:bg-slate-700 dark:border-slate-600"
                  }`}
              >
                <div className={`font-semibold ${permissionDenied ? "text-red-700" : "text-gray-700 dark:text-white"}`}>
                  {permissionDenied ? "Access denied (permission-denied)" : "Loading live data…"}
                </div>
                <div className={`text-xs ${permissionDenied ? "text-red-600" : "text-gray-500 dark:text-gray-200"}`}>
                  {permissionDenied
                    ? "Your account may be inactive or not allowed to view rooms/guests."
                    : "Rooms and guests are syncing."}
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              <KPI label="Total" value={roomsKpi.total} />
              <KPI label="Available" value={roomsKpi.available} />
              <KPI label="Reserved" value={roomsKpi.reserved} />
              <KPI label="Housekeeping" value={roomsKpi.cleaning} />
              <KPI label="Occupied" value={roomsKpi.occupied} />
              <KPI label="Occupancy" value={roomsKpi.occupancyRate} suffix="%" />
            </div>
          </div>

          <div className={`
  flex-1 min-h-0
  ${mobile ? "overflow-visible" : "overflow-y-auto"}
`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
              <Panel title="Recent Check-outs" className="lg:col-span-2 h-full min-h-0">
                {recentCheckouts.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-200">No recent check-outs yet.</div>
                ) : (
                  <div className="h-full overscroll-none space-y-2 pr-1">
                    {recentCheckouts.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-600 px-3 py-2"
                      >
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">{g.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-200">Room {g.roomNumber}</div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-200">
                          {g.checkedOutAt?.toDate().toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
                <Panel title="Finance" className="shrink-0">
                  <StatRow label="Active guests" value={guestKpi.activeGuests} />
                  <StatRow label="Outstanding" value={guestKpi.outstandingBalance} prefix="₱" />
                </Panel>

                <Panel title="Front Desk Today" className="flex-1 min-h-0">
                  <StatRow label="Arrivals" value={guestKpi.arrivalsToday} />
                  <StatRow label="Departures" value={guestKpi.departuresToday} />
                  <StatRow label="Checked out" value={guestKpi.checkedOutToday} />
                  <StatRow label="Overdue" value={guestKpi.overdue} danger={guestKpi.overdue > 0} />
                  <StatRow label="Checked-in now" value={guestKpi.checkedInNow} />
                </Panel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** --- tiny UI helpers --- */
function KPI({ label, value, prefix, suffix }: { label: string; value: number; prefix?: string; suffix?: string }) {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 px-4 py-2 text-center shadow-sm min-w-[120px]">
      <div className="text-[11px] text-gray-500 dark:text-gray-200">{label}</div>
      <div className="text-lg font-extrabold text-gray-900 dark:text-white">
        {prefix}{value}{suffix}
      </div>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 p-4 shadow-sm ${className}`}>
      <div className="font-bold text-gray-900 dark:text-white mb-2">{title}</div>
      {children}
    </div>
  );
}

function StatRow({ label, value, prefix, danger }: { label: string; value: number; prefix?: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-600 last:border-b-0">
      <div className="text-sm text-gray-600 dark:text-gray-200">{label}</div>
      <div className={`font-semibold ${danger ? "text-red-600" : "text-gray-900 dark:text-white"}`}>
        {prefix}{value}
      </div>
    </div>
  );
}