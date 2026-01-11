import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  label: string;
  to: string;
}

export default function SidebarItem({ label, to }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block w-full py-3 px-4 rounded-lg cursor-pointer font-medium
         transition-all duration-200 
         ${isActive ? "bg-sky-950 text-white" : " text-black hover:bg-sky-950/50 hover:text-white"}`
      }
    >
      {label}
    </NavLink>
  );
}
