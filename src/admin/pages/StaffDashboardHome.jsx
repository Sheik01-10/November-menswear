import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShoppingCart, Package, Users, TrendingUp, ArrowRight
} from "lucide-react";
import { io } from "socket.io-client";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

function StatCard({ title, value, icon, growth, label = "vs last month" }) {
  const isUp = parseFloat(growth) > 0;
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <h2>{value}</h2>
      <div className={`stat-growth ${isUp ? "up" : "down"}`}>
        <TrendingUp size={14} />
        <span>{Math.abs(parseFloat(growth))}%</span>
        <span className="label">{label}</span>
      </div>
    </div>
  );
}

export default function StaffDashboardHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${BACKEND}/api/staff/dashboard-stats`, { withCredentials: true }),
        axios.get(`${BACKEND}/api/staff/orders`, { withCredentials: true })
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch (err) {
      console.error("Staff dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);

    const socket = io(BACKEND);
    socket.on("order_changed", () => {
      fetchDashboardData(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getStatusClass = (status) =>
    ({ Completed: "completed", Processing: "processing", Shipped: "shipped", Pending: "pending", Cancelled: "cancelled" }[status] || "pending");

  if (loading) {
    return (
      <div className="loading-state">
        <div style={{ fontSize: 32 }}>⏳</div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      {/* Header */}
      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>Staff Portal 👋</h1>
          <p>Here's what's happening with orders and customers today.</p>
        </div>
        <div className="live-indicator">
          <span className="live-pulse"></span>
          Live Feed Connected
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="stats-grid">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders?.toLocaleString("en-IN") || "0"}
          icon={<ShoppingCart size={22} />}
          growth={8.3}
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders?.toLocaleString("en-IN") || "0"}
          icon={<Package size={22} />}
          growth={-5.2}
        />
        <StatCard
          title="Processing Orders"
          value={stats?.processingOrders?.toLocaleString("en-IN") || "0"}
          icon={<Package size={22} />}
          growth={4.1}
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers?.toLocaleString("en-IN") || "0"}
          icon={<Users size={22} />}
          growth={11.7}
        />
      </div>

      {/* RECENT ORDERS */}
      <div className="admin-card-panel" style={{ marginTop: "24px" }}>
        <div className="card-header">
          <h3>Recent Orders</h3>
          <a href="#" onClick={e => { e.preventDefault(); navigate("/staff-dashboard/orders"); }}>
            View All Orders <ArrowRight size={14} />
          </a>
        </div>
        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 600 }}>{order.orderId}</td>
                  <td>
                    <div className="customer-cell">
                      <img
                        src={`https://i.pravatar.cc/100?u=${order.customerEmail}`}
                        alt={order.customerName}
                        onError={e => { e.target.src = `https://i.pravatar.cc/100?u=${order.customerEmail}`; }}
                      />
                      {order.customerName}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{Number(order.amount).toLocaleString("en-IN")}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: "#888" }}>
                    {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
