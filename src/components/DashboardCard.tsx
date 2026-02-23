import { Link } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  link: string;
  color?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export default function DashboardCard({
  title,
  link,
  color = "from-gray-400 to-gray-600",
  icon,
  disabled = false,
}: DashboardCardProps) {

  const baseStyles = `
    relative flex flex-col items-center justify-center
    px-5 py-4
    rounded-2xl
    border
    shadow-sm
    transition-all duration-200
    text-center
    w-36 h-28
    md:w-40 md:h-32
  `;

  const enabledStyles = `
    bg-white dark:bg-slate-800
    border-gray-200 dark:border-slate-700
    hover:shadow-md
    cursor-pointer
  `;

  const disabledStyles = `
    bg-gray-100 dark:bg-slate-900
    border-gray-200 dark:border-slate-800
    opacity-60
    saturate-50
    cursor-not-allowed
    pointer-events-none
  `;

  const cardContent = (
    <div
      title={disabled ? "Not allowed for your role" : ""}
      className={`${baseStyles} ${disabled ? disabledStyles : enabledStyles}`}
    >
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

      {/* Hover Glow (only when enabled) */}
      {!disabled && (
        <div className="
          absolute inset-0 rounded-2xl
          bg-gradient-to-r opacity-0 hover:opacity-10
          transition-opacity duration-200 bg-slate-800 dark:bg-slate-100
        " />
      )}
    </div>
  );

  if (disabled) return cardContent;

  return <Link to={link}>{cardContent}</Link>;
}