import { Link } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  link: string;
  color?: string;
  icon?: React.ReactNode;
}

export default function DashboardCard({
  title,
  link,
  color = 'from-gray-400 to-gray-600',
  icon,
}: DashboardCardProps) {
  return (
    <Link to={link}>
      <div className="relative flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer text-center">
        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${color} opacity-10`}
        ></div>

        {/* Icon */}
        {icon && <div className="mb-4 text-gray-800">{icon}</div>}

        {/* Title */}
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h2>

        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
      </div>
    </Link>
  );
}
