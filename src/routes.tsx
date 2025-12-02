import { Route, Routes } from 'react-router-dom';
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CheckIn from "./pages/CheckIn";
import Rooms from "./pages/Rooms";
import Guests from "./pages/Guests";
import ArchivedGuests from './pages/ArchivedGuests';

export default function AppRoutes() {
  return (
    <Layout>
    <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/archived-guests" element={<ArchivedGuests />} />
        <Route path="/rooms" element={<Rooms />} />
    </Routes>
    </Layout>
    );
}