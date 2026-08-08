import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { authClient } from "../lib/auth-client";
import "./styles/Admin.css";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import DashboardHome from "./pages/DashboardHome";
import AdminProducts from "./pages/Products";
import AdminCategories from "./pages/Categories";
import AdminOrders from "./pages/Orders";
import AdminCustomers from "./pages/Customers";
import AdminWishlist from "./pages/Wishlist";
import AdminBanner from "./pages/Banner";
import AdminAnalytics from "./pages/Analytics";
import AdminSettings from "./pages/Settings";
import AdminSupport from "./pages/Support";
import AdminStaff from "./pages/Staff";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = sessionStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND}/api/users/logout-success`, {}, { withCredentials: true });
    } catch (e) {
      console.error("Logout status record failed:", e);
    } finally {
      await authClient.signOut({
        fetchOptions: {
          credentials: "omit"
        }
      });
      sessionStorage.removeItem("isAdmin");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("sessionToken");
      navigate("/admin-login");
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar backdrop */}
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar 
        logout={handleLogout} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      <div className="admin-main" style={{ minWidth: 0 }}>
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} logout={handleLogout} />

        <div className="admin-content-area" style={{ padding: "0 32px 32px 32px", width: "100%", boxSizing: "border-box" }}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="wishlist" element={<AdminWishlist />} />
            <Route path="banner" element={<AdminBanner />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="staff" element={<AdminStaff />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}