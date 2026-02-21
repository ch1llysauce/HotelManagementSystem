import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import CheckIn from "./pages/CheckIn";
import RoomsPage from "./pages/Rooms";
import Guests from "./pages/Guests";
import ArchivedGuests from "./pages/ArchivedGuests";
import HousekeepingPage from "./pages/HousekeepingPage";
import Settings from "./pages/Settings";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pending from "./pages/Pending";
import AdminApprovals from "./pages/AdminApprovals";

import { RequireAuth, RequireActive, RequireRole } from "./auth/AuthGate";

export default function AppRoutes() {
  return (
    <Routes>
      {/* public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* signed-in but may be pending */}
      <Route
        path="/pending"
        element={
          <RequireAuth>
            <Pending />
          </RequireAuth>
        }
      />

      {/* active users only */}
      <Route
        element={
          <RequireActive>
            <Layout />
          </RequireActive>
        }
      >
        <Route index element={<Dashboard />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/archived-guests" element={<ArchivedGuests />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/housekeeping" element={<HousekeepingPage />} />
        <Route path="/settings" element={<Settings />} />

        <Route
          path="/admin/approvals"
          element={
            <RequireRole role="admin">
              <AdminApprovals />
            </RequireRole>
          }
        />
      </Route>
    </Routes>
  );
}
