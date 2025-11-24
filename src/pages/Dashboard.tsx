import DashboardCard from '../components/DashboardCard';
import { FiUsers, FiHome, FiCheckCircle, FiLogOut } from 'react-icons/fi';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-50 p-8 md:p-12">
            {/* Header */}
            <div className="mb-12 text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                    Hotel Management Dashboard
                </h1>
                <p className="mt-3 text-gray-500 text-lg md:text-xl">
                    Manage check-ins, check-outs, rooms, and guests efficiently.
                </p>
            </div>

            {/* Cards */}
            <div className="flex flex-wrap justify-center gap-8">
                <DashboardCard
                    title="Check-In"
                    link="/checkin"
                    icon={<FiCheckCircle size={28} />}
                    color="from-green-400 to-green-600"
                />
                <DashboardCard
                    title="Check-Out"
                    link="/checkout"
                    icon={<FiLogOut size={28} />}
                    color="from-red-400 to-red-600"
                />
                <DashboardCard
                    title="Room Status"
                    link="/rooms"
                    icon={<FiHome size={28} />}
                    color="from-yellow-400 to-yellow-600"
                />
                <DashboardCard
                    title="Guest List"
                    link="/guests"
                    icon={<FiUsers size={28} />}
                    color="from-blue-400 to-blue-600"
                />
            </div>
        </div>

    );
}
