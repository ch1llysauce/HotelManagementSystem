import { Link } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  link: string;
  color?: string;
  icon?: React.ReactNode;
}

export default function DashboardCard({
  title,
  link,
  color = "from-gray-400 to-gray-600",
  icon,
}: DashboardCardProps) {
  return (
    <Link to={link}>
      <div className="
        relative flex flex-col items-center justify-center
        px-5 py-4
        bg-white dark:bg-slate-800
        rounded-2xl
        border border-gray-200 dark:border-slate-700
        shadow-sm hover:shadow-md
        transition-all duration-200
        cursor-pointer text-center
        w-36 h-28
        md:w-40 md:h-32
      ">
        {/* Soft Gradient Tint */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color} opacity-5`}
        />

        {/* Icon */}
        {icon && (
          <div className="mb-2 text-gray-700 dark:text-gray-200">
            {icon}
          </div>
        )}

        {/* Title */}
        <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>

        {/* Hover Glow */}
        <div className="
          absolute inset-0 rounded-2xl
          bg-gradient-to-r opacity-0 hover:opacity-10
          transition-opacity duration-200
        " />
      </div>
    </Link>
  );
}