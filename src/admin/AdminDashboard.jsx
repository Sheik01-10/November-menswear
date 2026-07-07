import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = localStorage.getItem("isAdmin");

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/admin-login");
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
          </Routes>
        </div>
      </div>
    </div>
  );
}