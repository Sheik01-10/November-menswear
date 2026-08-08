import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  IndianRupee, ShoppingBag, Users, Percent, ArrowUpRight,
  Monitor, Smartphone, Tablet, Clock, Eye, Activity, MapPin,
  Globe, Search, RefreshCw, ChevronDown, ChevronUp, AlertCircle
} from "lucide-react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

function KPIAnalyticsCard({ title, value, sub, icon, color, subColor = "#22c55e", pulse = false }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24,
      boxShadow: "0 4px 16px rgba(0,0,0,0.03)", flex: 1, minWidth: 200, position: "relative"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{title}</span>
        <div style={{
          background: `${color}15`, color: color, padding: 8, borderRadius: 12, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          {icon}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>{value}</h2>
        {pulse && (
          <span style={{ display: "flex", height: 10, width: 10, position: "relative", marginLeft: 4 }}>
            <span style={{
              animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
              position: "absolute", display: "inline-flex", height: "100%", width: "100%",
              borderRadius: "50%", background: "#22c55e", opacity: 0.75
            }} />
            <span style={{
              position: "relative", display: "inline-flex", borderRadius: "50%",
              height: 10, width: 10, background: "#22c55e"
            }} />
          </span>
        )}
      </div>
      <p style={{
        fontSize: 12, color: subColor, margin: "8px 0 0 0", fontWeight: 500,
        display: "flex", alignItems: "center", gap: 4
      }}>
        {sub}
      </p>
    </div>
  );
}

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState("sales");
  const [salesData, setSalesData] = useState(null);
  const [visitorData, setVisitorData] = useState(null); // Used to store district insights data
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingVisitor, setLoadingVisitor] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // District analytics specific state
  const [dateRange, setDateRange] = useState("all");
  
  const socketRef = useRef(null);

  const fetchSalesData = (showLoader = false) => {
    if (showLoader) setLoadingSales(true);
    axios.get(`${BACKEND}/api/analytics/dashboard`)
      .then(res => setSalesData(res.data))
      .catch(err => console.error("Sales data fetch error:", err))
      .finally(() => setLoadingSales(false));
  };

  const fetchVisitorData = (showLoader = false, range = dateRange) => {
    if (showLoader) setLoadingVisitor(true);
    axios.get(`${BACKEND}/api/analytics/visitors?range=${range}`)
      .then(res => {
        setVisitorData(res.data);
      })
      .catch(err => console.error("District data fetch error:", err))
      .finally(() => {
        setLoadingVisitor(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchSalesData(true);
    fetchVisitorData(true);

    // Setup Socket Connection for Live Updates
    socketRef.current = io(BACKEND);
    
    socketRef.current.on("connect", () => {
      setSocketConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      setSocketConnected(false);
    });

    socketRef.current.on("order_changed", () => {
      fetchSalesData(false);
      fetchVisitorData(false);
    });

    // Auto-refresh stats every 2 minutes
    const autoRefreshInterval = setInterval(() => {
      fetchVisitorData(false);
    }, 120000);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      clearInterval(autoRefreshInterval);
    };
  }, []);

  const formatINR = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

  const tabButtonStyle = (isActive) => ({
    border: "none",
    background: isActive ? "#111" : "transparent",
    color: isActive ? "#fff" : "#555",
    fontWeight: isActive ? 600 : 500,
    padding: "10px 24px",
    borderRadius: 14,
    fontSize: 13,
    cursor: "pointer",
    transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.15)" : "none"
  });

  return (
    <div className="admin-page-content" style={{ paddingBottom: 60 }}>
      {/* HEADER SECTION */}
      <div className="admin-page-header" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16, borderBottom: "1px solid #ececec", paddingBottom: 20, marginBottom: 12
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 28, letterSpacing: "-0.5px", margin: 0 }}>
              Analytics & Reports
            </h1>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 20,
              background: socketConnected ? "#dcfce7" : "#fee2e2",
              color: socketConnected ? "#15803d" : "#b91c1c",
              border: `1px solid ${socketConnected ? "#bbf7d0" : "#fecaca"}`,
              transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease"
            }}>
              <span style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: socketConnected ? "#22c55e" : "#ef4444",
                animation: socketConnected ? "pulse 1.5s infinite" : "none"
              }} />
              {socketConnected ? "Live Connected" : "Live Disconnected"}
            </span>
          </div>
          <p style={{ color: "#666", fontSize: 14, margin: "6px 0 0 0" }}>Real-time shop sales & customer order location intelligence dashboard</p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {refreshing && <span style={{ fontSize: 12, color: "#888" }} className="live-pulse">Updating...</span>}
          
          {/* TAB SELECTOR */}
          <div style={{ display: "flex", background: "#f1f1f1", padding: 4, borderRadius: 18 }}>
            <button
              onClick={() => setActiveTab("sales")}
              style={tabButtonStyle(activeTab === "sales")}
            >
              <IndianRupee size={15} />
              Sales Performance
            </button>
            <button
              onClick={() => setActiveTab("visitors")}
              style={tabButtonStyle(activeTab === "visitors")}
            >
              <MapPin size={15} />
              District Insights
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SALES PERFORMANCE */}
      {/* ========================================================================= */}
      {activeTab === "sales" && (
        <>
          {loadingSales ? (
            <div className="loading-state" style={{ minHeight: 400, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <p style={{ color: "#888" }}>Calculating gross sales performance...</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
                <KPIAnalyticsCard
                  title="Total Gross Revenue"
                  value={formatINR(salesData?.stats?.totalRevenue)}
                  sub="+14.2% since last week"
                  icon={<IndianRupee size={18} />}
                  color="#a38144"
                />
                <KPIAnalyticsCard
                  title="E-commerce Orders"
                  value={salesData?.stats?.totalOrders}
                  sub="+8.6% since yesterday"
                  icon={<ShoppingBag size={18} />}
                  color="#000"
                />
                <KPIAnalyticsCard
                  title="Average Basket Size"
                  value={formatINR(salesData?.stats?.avgOrderValue)}
                  sub="Stable average ticket size"
                  icon={<Percent size={18} />}
                  color="#2563eb"
                />
                <KPIAnalyticsCard
                  title="Conversion Rate"
                  value={`${salesData?.stats?.conversionRate}%`}
                  sub="+1.1% vs industry avg"
                  icon={<Users size={18} />}
                  color="#059669"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
                {/* Sales Trend Line Chart */}
                <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Monthly Sales Revenue</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData?.salesData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a38144" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#a38144" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#888" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#888" }} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />
                      <Tooltip formatter={(value) => [formatINR(value), "Sales"]} />
                      <Area type="monotone" dataKey="sales" stroke="#a38144" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Sales Volume Bar Chart */}
                <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Sales Distribution Volume</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData?.salesData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#888" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#888" }} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value) => [formatINR(value), "Sales"]} />
                      <Bar dataKey="sales" fill="#111" radius={[8, 8, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </>
      )}      {/* ========================================================================= */}
      {/* TAB 2: CUSTOMER ORDER DISTRICT INSIGHTS */}
      {/* ========================================================================= */}
      {activeTab === "visitors" && (
        <>
          {loadingVisitor ? (
            <div className="loading-state" style={{ minHeight: 400, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <p style={{ color: "#888" }}>Calculating customer district insights...</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              
              {/* Date Filter & Title */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexWrap: "wrap", gap: 16, background: "#fff", border: "1px solid #ececec",
                borderRadius: 24, padding: "20px 24px", boxShadow: "0 4px 16px rgba(0,0,0,0.03)"
              }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: "var(--font-sans)", letterSpacing: "-0.5px" }}>
                    Customer Order District Insights
                  </h3>
                  <p style={{ color: "#666", fontSize: 13, margin: "4px 0 0 0" }}>
                    Geographic distribution of actual customer orders based on shipping address
                  </p>
                </div>
                
                <div style={{ display: "flex", background: "#f1f1f1", padding: 3, borderRadius: 12 }}>
                  {[
                    { value: "today", label: "Today" },
                    { value: "7days", label: "Last 7 Days" },
                    { value: "30days", label: "Last 30 Days" },
                    { value: "year", label: "This Year" },
                    { value: "all", label: "All Time" }
                  ].map((r) => (
                    <button
                      key={r.value}
                      onClick={() => {
                        setDateRange(r.value);
                        fetchVisitorData(true, r.value);
                      }}
                      style={{
                        border: "none",
                        background: dateRange === r.value ? "#111" : "transparent",
                        color: dateRange === r.value ? "#fff" : "#666",
                        fontWeight: 600,
                        padding: "8px 16px",
                        borderRadius: 10,
                        fontSize: 12,
                        cursor: "pointer",
                        transition: "background-color 0.2s, color 0.2s"
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* KPIs */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <KPIAnalyticsCard
                  title="Total Orders"
                  value={visitorData?.totalOrders || 0}
                  sub="Count of all valid orders"
                  icon={<ShoppingBag size={18} />}
                  color="#111"
                  subColor="#888"
                />
                <KPIAnalyticsCard
                  title="Districts Covered"
                  value={visitorData?.districtsCovered || 0}
                  sub="Unique delivery locations"
                  icon={<MapPin size={18} />}
                  color="#c5a880"
                  subColor="#888"
                />
                <KPIAnalyticsCard
                  title="Top District"
                  value={visitorData?.topDistrict || "N/A"}
                  sub="District with highest orders"
                  icon={<Globe size={18} />}
                  color="#2563eb"
                  subColor="#888"
                />
                <KPIAnalyticsCard
                  title="Top District Orders"
                  value={visitorData?.topDistrictOrders || 0}
                  sub={`Total orders in ${visitorData?.topDistrict || "top district"}`}
                  icon={<Activity size={18} />}
                  color="#059669"
                  subColor="#888"
                />
              </div>
 
              {/* Chart and Distribution Table */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, alignItems: "start" }}>
                
                {/* Horizontal Bar Chart: District -> Orders */}
                <div style={{
                  background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", minHeight: 380
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>District vs Number of Orders</h3>
                  
                  {(!visitorData?.distribution || visitorData.distribution.length === 0) ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: 14 }}>
                      No orders found for the selected date range.
                    </div>
                  ) : (
                    <div style={{ width: "100%", overflowX: "auto" }}>
                      <ResponsiveContainer width="100%" height={Math.max(300, visitorData.distribution.length * 40)}>
                        <BarChart
                          data={visitorData.distribution}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11, fill: "#888" }} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="district" tick={{ fontSize: 12, fill: "#111", fontWeight: 500 }} tickLine={false} axisLine={false} width={120} />
                          <Tooltip formatter={(value) => [value, "Orders"]} />
                          <Bar dataKey="orders" fill="#111" radius={[0, 6, 6, 0]} barSize={16}>
                            {visitorData.distribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? "#a38144" : "#111"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
 
                {/* Percentage Distribution Table */}
                <div style={{
                  background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", minHeight: 380
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>District Order Distribution</h3>
                  
                  {(!visitorData?.distribution || visitorData.distribution.length === 0) ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: 14 }}>
                      No orders found for the selected date range.
                    </div>
                  ) : (
                    <div style={{ overflowY: "auto", maxHeight: 450 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid #f0f0f0", color: "#888", textAlign: "left" }}>
                            <th style={{ padding: "8px 12px 12px 12px", fontWeight: 600 }}>District</th>
                            <th style={{ padding: "8px 12px 12px 12px", fontWeight: 600, textAlign: "right" }}>Orders</th>
                            <th style={{ padding: "8px 12px 12px 12px", fontWeight: 600, textAlign: "right" }}>Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visitorData.distribution.map((item, idx) => (
                            <tr key={`${item.district}-${idx}`} style={{ borderBottom: "1px solid #f9f9f9" }}>
                              <td style={{ padding: "12px", fontWeight: 600, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
                                <MapPin size={14} style={{ color: idx === 0 ? "#a38144" : "#888" }} />
                                {item.district}
                              </td>
                              <td style={{ padding: "12px", fontWeight: 700, color: "#111", textAlign: "right" }}>
                                {item.orders} {item.orders === 1 ? "order" : "orders"}
                              </td>
                              <td style={{ padding: "12px", fontWeight: 500, color: "#666", textAlign: "right" }}>
                                <span style={{
                                  background: idx === 0 ? "#a3814415" : "#f5f5f5",
                                  color: idx === 0 ? "#a38144" : "#555",
                                  padding: "4px 8px",
                                  borderRadius: 8,
                                  fontWeight: 600,
                                  fontSize: 11
                                }}>
                                  {item.percentage}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
 
              </div>
 
            </div>
          )}
        </>
      )}

    </div>
  );
}
