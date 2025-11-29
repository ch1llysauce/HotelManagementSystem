import SidebarItem from "./SidebarItem";

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function Sidebar({ visible, onClose }: SidebarProps) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 h-screen w-64 bg-sky-300 p-5 text-black shadow-lg
        transition-all duration-500 ease-in-out

        ${visible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
      `}
    >

      <button
        onClick={onClose}
        className="
    absolute top-4 right-4 p-2 md:hidden 
    bg-white text-gray-800 rounded-full shadow-md 
    hover:bg-red-500 hover:text-white 
    transition-all duration-300 
    focus:ring-red-400
  "
        aria-label="Close sidebar"
      >
        ✕
      </button>


      <img src="/logo.png" className="w-24 mx-auto mb-4" />

      <p className="text-center font-semibold text-black">Good day, John!</p>
      <p className="text-center text-sm mb-6 text-black">Admin</p>

      <nav className="space-y-2">
        <SidebarItem label="Dashboard" to="/" />
        <SidebarItem label="Check In" to="/checkin" />
        <SidebarItem label="Check Out" to="/checkout" />
        <SidebarItem label="Guests" to="/guests" />
        <SidebarItem label="Rooms" to="/rooms" />
      </nav>

      <button className="mt-8 bg-black w-full py-2 rounded text-white">Logout</button>
    </aside>
  );
}
