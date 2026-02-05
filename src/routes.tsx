import { Route, Routes } from 'react-router-dom';
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CheckIn from "./pages/CheckIn";
import RoomsPage from "./pages/Rooms";
import Guests from "./pages/Guests";
import ArchivedGuests from './pages/ArchivedGuests';
import HousekeepingPage from './pages/HousekeepingPage';
import Settings from './pages/Settings';
export default function AppRoutes() {
  return (
    <Layout>
    <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/archived-guests" element={<ArchivedGuests />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/housekeeping" element={<HousekeepingPage />} />
        <Route path = "/settings" element={<Settings />} />
    </Routes>
    </Layout>
    );
}