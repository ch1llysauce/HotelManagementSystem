import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import ConfirmDialog from "./LogoutConfirmDialog";
import { canAccess, Role } from "../utils/permissions";
import logoHotel from "../assets/logo.png";

interface SidebarProps {
  visible: boolean;
  isMobile: boolean;
  onClose: () => void;
  onItemClick: () => void;
  role: Role;
  userName: string;
}

export default function Sidebar({ visible, isMobile, onItemClick, onClose, role, userName }: SidebarProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const nav = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  async function handleLogout() {
    setShowLogoutConfirm(false);
    onClose();
    await signOut(auth);
    nav("/login", { replace: true });
  }
  return (
    <>
      <aside
        className={`
        fixed inset-y-0 left-0 h-screen w-64
        bg-sky-300 dark:bg-gray-950
        p-5
        text-gray-900 dark:text-gray-100
        shadow-lg
        transition-all duration-500 ease-in-out
        z-50
        ${visible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
      `}
      >
        <button
          onClick={onClose}
          className="
          absolute top-4 right-4 p-2 md:hidden
          bg-white dark:bg-gray-800
          text-gray-800 dark:text-gray-100
          rounded-full shadow-md
          hover:bg-red-500 hover:text-white
          transition-all duration-300
          focus:ring-red-400
        "
          aria-label="Close sidebar"
        >
          ✕
        </button>

        <img src={logoHotel} className="w-20 mx-auto mb-4" />

        <p className="text-center font-semibold">
          Good day, {userName}!
        </p>

        <p className="text-center text-sm mb-6">
          {role.toUpperCase()}
        </p>

        <nav className="space-y-2">
          {canAccess(role, "dashboard") && (
            <SidebarItem label="Dashboard" to="/" onClick={isMobile ? onItemClick : undefined} />
          )}

          {canAccess(role, "checkin") && (
            <SidebarItem label="Check In (Reservation)" to="/checkin" onClick={isMobile ? onItemClick : undefined} />
          )}

          {canAccess(role, "guests") && (
            <SidebarItem label="Guests" to="/guests" onClick={isMobile ? onItemClick : undefined} />
          )}

          {canAccess(role, "rooms") && (
            <SidebarItem label="Rooms" to="/rooms" onClick={isMobile ? onItemClick : undefined} />
          )}

          {canAccess(role, "archivedGuests") && (
            <SidebarItem label="Archived Guests" to="/archived-guests" onClick={isMobile ? onItemClick : undefined} />
          )}

          {canAccess(role, "housekeeping") && (
            <SidebarItem label="Housekeeping" to="/housekeeping" onClick={isMobile ? onItemClick : undefined} />
          )}

          {canAccess(role, "settings") && (
            <SidebarItem label="Settings" to="/settings" onClick={isMobile ? onItemClick : undefined} />
          )}
        </nav>

        <button
          type="button"
          onClick={() => setDarkMode((v) => !v)}
          className="
    mt-16 w-full py-2 rounded-xl font-semibold
    bg-white text-gray-900 hover:bg-gray-100
    dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700
    transition
  "
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="
          mt-4 w-full py-2 rounded-xl font-semibold
          bg-red-800 text-white hover:bg-red-600
        
          transition
        "
        >
          Logout
        </button>
      </aside>
      {/* confirm dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmText="Logout"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
