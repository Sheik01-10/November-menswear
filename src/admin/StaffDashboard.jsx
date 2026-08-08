import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { authClient } from "../lib/auth-client";
import "./styles/Admin.css";

import StaffSidebar from "./components/StaffSidebar";
import Topbar from "./components/Topbar";
import StaffDashboardHome from "./pages/StaffDashboardHome";
import StaffOrders from "./pages/StaffOrders";
import StaffCustomers from "./pages/StaffCustomers";
import StaffAnalytics from "./pages/StaffAnalytics";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isStaff = localStorage.getItem("isStaff") === "true";

  useEffect(() => {
    if (!isStaff) return;

    // Send heartbeat immediately on load
    const sendHeartbeat = async () => {
      try {
        await axios.post(`${BACKEND}/api/staff/heartbeat`, {}, { withCredentials: true });
      } catch (err) {
        console.error("Failed to send staff heartbeat:", err);
      }
    };

    sendHeartbeat();

    // Heartbeat every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, [isStaff]);

  if (!isStaff) {
    return <Navigate to="/admin-login" replace />;
  }

  const handleLogout = async () => {
    try {
      // Record logout status in backend
      await axios.post(`${BACKEND}/api/users/logout-success`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Error logging out from backend:", err);
    } finally {
      // Complete client sign-out
      await authClient.signOut();
      localStorage.removeItem("isStaff");
      localStorage.removeItem("role");
      navigate("/admin-login");
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar backdrop */}
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <StaffSidebar 
        logout={handleLogout} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      <div className="admin-main" style={{ minWidth: 0 }}>
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} logout={handleLogout} />

        <div className="admin-content-area" style={{ padding: "0 32px 32px 32px", width: "100%", boxSizing: "border-box" }}>
          <Routes>
            <Route path="/" element={<StaffDashboardHome />} />
            <Route path="orders" element={<StaffOrders />} />
            <Route path="customers" element={<StaffCustomers />} />
            <Route path="analytics" element={<StaffAnalytics />} />
            {/* Fallback to dashboard home */}
            <Route path="*" element={<Navigate to="" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
