import SidebarItem from "./SidebarItem";

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function Sidebar({ visible, onClose }: SidebarProps) {
  return (
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

      <img src="/logo.png" className="w-24 mx-auto mb-4" />

      <p className="text-center font-semibold text-gray-900 dark:text-gray-100">
        Good day, John!
      </p>
      <p className="text-center text-sm mb-6 text-gray-700 dark:text-gray-300">
        Admin
      </p>

      <nav className="space-y-2">
        <SidebarItem label="Dashboard" to="/" />
        <SidebarItem label="Check In" to="/checkin" />
        <SidebarItem label="Guests" to="/guests" />
        <SidebarItem label="Rooms" to="/rooms" />
        <SidebarItem label="Archived Guests" to="/archived-guests" />
        <SidebarItem label="Housekeeping" to="/housekeeping" />
        <SidebarItem label="Settings" to="/settings" />
      </nav>

      <button
        className="
          mt-8 w-full py-2 rounded-xl font-semibold
          bg-gray-900 text-white hover:bg-gray-800
          dark:bg-gray-800 dark:hover:bg-gray-700
          transition
        "
      >
        Logout
      </button>
    </aside>
  );
}

