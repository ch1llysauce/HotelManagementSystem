import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from "./pages/Dashboard";
import CheckIn from "./pages/CheckIn";
import CheckOut from "./pages/CheckOut";
import Rooms from "./pages/Rooms";
import Guests from "./pages/Guests";

export default function AppRoutes() {
  return (
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/guests" element={<Guests />} />
    </Routes>
    </BrowserRouter>
    );
}