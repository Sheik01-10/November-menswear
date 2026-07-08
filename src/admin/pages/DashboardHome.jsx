import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  IndianRupee, ShoppingCart, Package, Users,
  TrendingUp, ArrowRight, Plus
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#111", color: "#fff", padding: "10px 16px",
        borderRadius: "12px", fontSize: "13px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
      }}>
        <p style={{ color: "#aaa", marginBottom: "4px" }}>{label}</p>
        <p style={{ fontWeight: 700, fontSize: "16px" }}>
          ₹{Number(payload[0].value).toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        axios.get(`${BACKEND}/api/analytics/dashboard`),
        axios.get(`${BACKEND}/api/orders`)
      ]);
      setStats(analyticsRes.data.stats);
      setSalesData(analyticsRes.data.salesData);
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
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

  const formatINR = (num) =>
    num !== undefined ? `₹${Number(num).toLocaleString("en-IN")}` : "₹0";

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
          <h1>Welcome back, Admin 👋</h1>
          <p>Here's what's happening with your store today.</p>
        </div>
        <div className="live-indicator">
          <span className="live-pulse"></span>
          Live Feed Connected
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={formatINR(stats?.totalRevenue)}
          icon={<IndianRupee size={22} />}
          growth={12.5}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders?.toLocaleString("en-IN") || "0"}
          icon={<ShoppingCart size={22} />}
          growth={8.3}
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts?.toLocaleString("en-IN") || "0"}
          icon={<Package size={22} />}
          growth={5.1}
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers?.toLocaleString("en-IN") || "0"}
          icon={<Users size={22} />}
          growth={11.7}
        />
      </div>

      {/* CHART + QUICK ACTIONS */}
      <div className="dashboard-grid">
        {/* Sales Chart */}
        <div className="admin-card-panel">
          <div className="card-header">
            <h3>Sales Overview</h3>
            <a href="#" onClick={e => { e.preventDefault(); navigate("/admin-dashboard/analytics"); }}>
              View Report <ArrowRight size={14} />
            </a>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={salesData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#888" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#888" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#111"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#111", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#111" }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Chart Footer Stats */}
          <div className="chart-footer">
            <div className="chart-footer-item highlight">
              <div className="cf-label">Total Revenue</div>
              <div className="cf-value">{formatINR(stats?.totalRevenue)}</div>
            </div>
            <div className="chart-footer-item">
              <div className="cf-label">Total Orders</div>
              <div className="cf-value">{stats?.totalOrders}</div>
            </div>
            <div className="chart-footer-item">
              <div className="cf-label">Avg. Order Value</div>
              <div className="cf-value">{formatINR(stats?.avgOrderValue)}</div>
            </div>
            <div className="chart-footer-item">
              <div className="cf-label">Conversion Rate</div>
              <div className="cf-value">{stats?.conversionRate}%</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card-panel">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <button className="quick-btn" onClick={() => navigate("/admin-dashboard/products")}>
              <Plus size={16} /> Add Product
            </button>
            <button className="quick-btn" onClick={() => navigate("/admin-dashboard/categories")}>
              <Plus size={16} /> Add Category
            </button>
            <button className="quick-btn" onClick={() => navigate("/admin-dashboard/banner")}>
              <Plus size={16} /> Upload Banner
            </button>
            <button className="quick-btn" onClick={() => navigate("/admin-dashboard/orders")}>
              View Orders
            </button>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="admin-card-panel">
        <div className="card-header">
          <h3>Recent Orders</h3>
          <a href="#" onClick={e => { e.preventDefault(); navigate("/admin-dashboard/orders"); }}>
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 600 }}>{order.orderId}</td>
                  <td>
                    <div className="customer-cell">
                      <img
                        src={order.customerPhoto || `https://i.pravatar.cc/100?u=${order.customerEmail}`}
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
                  <td>
                    <button className="table-actions-btn" title="More actions">···</button>
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