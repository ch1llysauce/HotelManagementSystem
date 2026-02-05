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
        `
        block w-full py-3 px-4 rounded-lg cursor-pointer font-medium
        transition-all duration-200
        ${
          isActive
            ? "bg-sky-950 text-white dark:bg-gray-800 dark:text-white"
            : "text-gray-900 dark:text-gray-100 hover:bg-sky-950/50 hover:text-white dark:hover:bg-white/10"
        }
        `
      }
    >
      {label}
    </NavLink>
  );
}
