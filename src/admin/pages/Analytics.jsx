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
  const [visitorData, setVisitorData] = useState(null);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingVisitor, setLoadingVisitor] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Visitor-specific state
  const [trendMode, setTrendMode] = useState("daily"); // daily or hourly
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [liveTicker, setLiveTicker] = useState([]);
  
  const socketRef = useRef(null);

  const fetchSalesData = (showLoader = false) => {
    if (showLoader) setLoadingSales(true);
    axios.get(`${BACKEND}/api/analytics/dashboard`)
      .then(res => setSalesData(res.data))
      .catch(err => console.error("Sales data fetch error:", err))
      .finally(() => setLoadingSales(false));
  };

  const fetchVisitorData = (showLoader = false) => {
    if (showLoader) setLoadingVisitor(true);
    axios.get(`${BACKEND}/api/analytics/visitors`)
      .then(res => {
        setVisitorData(res.data);
        // Pre-populate live ticker with recent page actions if empty
        if (liveTicker.length === 0 && res.data.sessions) {
          const recentActions = res.data.sessions
            .slice(0, 5)
            .map(s => ({
              sessionId: s.sessionId,
              district: s.district,
              state: s.state,
              deviceType: s.deviceType,
              gender: s.gender,
              lastAction: s.lastAction,
              updatedAt: s.updatedAt
            }));
          setLiveTicker(recentActions);
        }
      })
      .catch(err => console.error("Visitor data fetch error:", err))
      .finally(() => {
        setLoadingVisitor(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchSalesData(true);
    fetchVisitorData(true);

    // Setup Socket Connection for Live Traffic Updates
    socketRef.current = io(BACKEND);
    
    socketRef.current.on("connect", () => {
      setSocketConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      setSocketConnected(false);
    });

    socketRef.current.on("order_changed", () => {
      fetchSalesData(false);
    });

    socketRef.current.on("visitor_activity", (session) => {
      // Prepend the activity to the live ticker
      setLiveTicker(prev => {
        const filtered = prev.filter(x => x.sessionId !== session.sessionId);
        return [
          {
            sessionId: session.sessionId,
            district: session.district,
            state: session.state,
            deviceType: session.deviceType,
            gender: session.gender,
            lastAction: session.lastAction,
            updatedAt: session.updatedAt
          },
          ...filtered
        ].slice(0, 8); // Keep last 8 actions
      });

      // Fetch fresh aggregated traffic stats in the background to update charts, KPIs, and logs in real-time
      fetchVisitorData(false);
    });

    // Auto-refresh traffic stats every 2 minutes
    const autoRefreshInterval = setInterval(() => {
      fetchVisitorData(false);
    }, 120000);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      clearInterval(autoRefreshInterval);
    };
  }, []);

  const triggerReseed = async () => {
    setRefreshing(true);
    try {
      const res = await axios.post(`${BACKEND}/api/analytics/seed-visitors`);
      if (res.data.success) {
        toast.success("Visitor data reseeded successfully!");
        fetchVisitorData(true);
      }
    } catch (err) {
      toast.error("Failed to seed visitor data.");
      console.error(err);
      setRefreshing(false);
    }
  };

  const triggerClear = async () => {
    if (!window.confirm("Are you sure you want to reset all traffic analytics to 0? This cannot be undone.")) return;
    setRefreshing(true);
    try {
      const res = await axios.post(`${BACKEND}/api/analytics/clear-visitors`);
      if (res.data.success) {
        toast.success("Visitor data cleared! Starting from 0.");
        setLiveTicker([]);
        fetchVisitorData(true);
      }
    } catch (err) {
      toast.error("Failed to clear visitor data.");
      console.error(err);
      setRefreshing(false);
    }
  };


  const formatINR = (v) => `₹${Number(v).toLocaleString("en-IN")}`;
  
  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "Mobile": return <Smartphone size={16} />;
      case "Tablet": return <Tablet size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  const tabButtonStyle = (isActive) => ({
    border: "none",
    background: isActive ? "#111" : "transparent",
    color: isActive ? "#fff" : "#555",
    fontWeight: isActive ? 600 : 500,
    padding: "10px 24px",
    borderRadius: 14,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.15)" : "none"
  });

  const getRelativeTime = (timeStr) => {
    const d = new Date(timeStr);
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return `${h}h ago`;
  };

  // Filtered Sessions
  const filteredSessions = visitorData?.sessions.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.ip?.toLowerCase().includes(q) ||
      s.state?.toLowerCase().includes(q) ||
      s.district?.toLowerCase().includes(q) ||
      s.lastAction?.toLowerCase().includes(q)
    );
  }) || [];

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
              transition: "all 0.3s ease"
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
          <p style={{ color: "#666", fontSize: 14, margin: "6px 0 0 0" }}>Real-time shop sales & website traffic intelligence dashboard</p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {refreshing && <span style={{ fontSize: 12, color: "#888" }} className="live-pulse">Updating...</span>}
          
          <button
            onClick={triggerClear}
            className="btn-danger"
            style={{
              height: 44, padding: "0 18px", borderRadius: 14, fontSize: 13, display: "flex",
              alignItems: "center", gap: 8, fontWeight: 600, border: "1px solid #fee2e2"
            }}
            disabled={refreshing}
            title="Clear all traffic data and start from 0"
          >
            <AlertCircle size={14} />
            Reset to 0
          </button>

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
              <Globe size={15} />
              Traffic Insights
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VISITOR TRAFFIC INSIGHTS */}
      {/* ========================================================================= */}
      {activeTab === "visitors" && (
        <>
          {loadingVisitor ? (
            <div className="loading-state" style={{ minHeight: 400, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <p style={{ color: "#888" }}>Aggregating site traffic metrics...</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              
              {/* Visitor KPIs */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <KPIAnalyticsCard
                  title="Unique Visitors (30d)"
                  value={visitorData?.kpis?.uniqueVisitors?.toLocaleString("en-IN")}
                  sub="Unique device instances logged"
                  icon={<Users size={18} />}
                  color="#111"
                  subColor="#888"
                />
                <KPIAnalyticsCard
                  title="Total Pageviews"
                  value={visitorData?.kpis?.totalPageviews?.toLocaleString("en-IN")}
                  sub={`${(visitorData?.kpis?.totalPageviews / (visitorData?.kpis?.uniqueVisitors || 1)).toFixed(1)} pages per session avg`}
                  icon={<Eye size={18} />}
                  color="#c5a880"
                  subColor="#888"
                />
                <KPIAnalyticsCard
                  title="Active Online Now"
                  value={visitorData?.kpis?.activeOnline}
                  sub="Active users in last 5 mins"
                  icon={<Activity size={18} />}
                  color="#22c55e"
                  subColor="#22c55e"
                  pulse={true}
                />
                <KPIAnalyticsCard
                  title="Avg. Session Time"
                  value={formatDuration(visitorData?.kpis?.avgDuration)}
                  sub="Time spent exploring shop"
                  icon={<Clock size={18} />}
                  color="#3b82f6"
                  subColor="#888"
                />
                <KPIAnalyticsCard
                  title="Bounce Rate"
                  value={`${visitorData?.kpis?.bounceRate}%`}
                  sub="Left after viewing 1 page"
                  icon={<Percent size={18} />}
                  color="#ef4444"
                  subColor="#ef4444"
                />
              </div>

              {/* 2. REAL-TIME ACTIVITY FEED & TREND CHART */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "stretch" }}>
                
                {/* Traffic Trend Chart */}
                <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Traffic Volume Trend</h3>
                    <div style={{ display: "flex", background: "#f5f5f5", padding: 3, borderRadius: 10 }}>
                      <button
                        onClick={() => setTrendMode("daily")}
                        style={{
                          border: "none", background: trendMode === "daily" ? "#fff" : "transparent",
                          color: trendMode === "daily" ? "#111" : "#777", fontWeight: 600,
                          padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", transition: "0.2s"
                        }}
                      >
                        Daily (30d)
                      </button>
                      <button
                        onClick={() => setTrendMode("hourly")}
                        style={{
                          border: "none", background: trendMode === "hourly" ? "#fff" : "transparent",
                          color: trendMode === "hourly" ? "#111" : "#777", fontWeight: 600,
                          padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", transition: "0.2s"
                        }}
                      >
                        Hourly (24h)
                      </button>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart
                      data={trendMode === "daily" ? visitorData?.trends?.daily : visitorData?.trends?.hourly}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c5a880" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#c5a880" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#111111" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#111111" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#888" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#888" }} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, marginTop: 10 }} />
                      <Area name="Total Pageviews" type="monotone" dataKey="pageviews" stroke="#c5a880" strokeWidth={2} fillOpacity={1} fill="url(#colorPageviews)" />
                      <Area name="Unique Visitors" type="monotone" dataKey="visitors" stroke="#111111" strokeWidth={2} fillOpacity={1} fill="url(#colorUnique)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Real-time Activity Feed */}
                <div style={{
                  background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Live Activity Feed</h3>
                    <span style={{ fontSize: 11, background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: 20, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 1.2s infinite" }} />
                      Live Feed
                    </span>
                  </div>

                  {/* Scrollable Live Ticker */}
                  <div className="activity-scroll-feed" style={{
                    flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12,
                    maxHeight: 275, paddingRight: 4
                  }}>
                    {liveTicker.length === 0 ? (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 13 }}>
                        Waiting for user activity...
                      </div>
                    ) : (
                      liveTicker.map((item, idx) => (
                        <div
                          key={`${item.sessionId}-${idx}`}
                          style={{
                            borderBottom: idx === liveTicker.length - 1 ? "none" : "1px solid #f9f9f9",
                            paddingBottom: 10, display: "flex", gap: 10, alignItems: "flex-start",
                            animation: idx === 0 ? "fadeInDown 0.4s ease" : "none"
                          }}
                        >
                          <div style={{
                            background: item.gender === "Female" ? "#fce7f3" : "#f1f1f1",
                            color: item.gender === "Female" ? "#db2777" : "#111",
                            padding: 6, borderRadius: 10, fontSize: 10, fontWeight: 700,
                            width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center"
                          }}>
                            {item.gender === "Female" ? "F" : "M"}
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontWeight: 600, fontSize: 12, color: "#111" }}>
                                {item.district}, {item.state}
                              </span>
                              <span style={{ fontSize: 10, color: "#aaa" }}>
                                {getRelativeTime(item.updatedAt)}
                              </span>
                            </div>
                            <p style={{ fontSize: 11, color: "#555", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.lastAction}
                            </p>
                            <span style={{ fontSize: 9, color: "#999", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                              {getDeviceIcon(item.deviceType)} {item.deviceType}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* 3. DEMOGRAPHICS & TRAFFIC SOURCES & DEVICE SPLIT */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
                
                {/* Gender Breakdown (Doughnut) */}
                <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Gender Demographics</h3>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 180 }}>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={visitorData?.demographics}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          <Cell fill="#111111" /> {/* Male */}
                          <Cell fill="#c5a880" /> {/* Female */}
                        </Pie>
                        <Tooltip formatter={(v) => [`${((v / (visitorData?.kpis?.uniqueVisitors || 1)) * 100).toFixed(0)}%`, "Visitors"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Stats Text */}
                    <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 22, fontWeight: 800 }}>
                        {((visitorData?.demographics?.[0]?.value / (visitorData?.kpis?.uniqueVisitors || 1)) * 100).toFixed(0)}%
                      </span>
                      <span style={{ fontSize: 10, color: "#888", fontWeight: 500 }}>MALE</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#111" }} />
                      <span>Male ({visitorData?.demographics?.[0]?.value})</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#c5a880" }} />
                      <span>Female ({visitorData?.demographics?.[1]?.value})</span>
                    </div>
                  </div>
                </div>

                {/* Traffic Sources */}
                <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Traffic Acquisition</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, justifyContent: "center", flex: 1 }}>
                    {visitorData?.sources?.map((item) => {
                      const percentage = Math.round((item.value / (visitorData?.kpis?.uniqueVisitors || 1)) * 100);
                      let barColor = "#111";
                      if (item.name === "Organic Search") barColor = "#c5a880";
                      else if (item.name === "Social Media") barColor = "#3b82f6";
                      else if (item.name === "Referral") barColor = "#888";

                      return (
                        <div key={item.name}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
                            <span>{item.name}</span>
                            <span style={{ color: "#888" }}>{item.value} ({percentage}%)</span>
                          </div>
                          <div style={{ height: 6, width: "100%", background: "#f0f0f0", borderRadius: 10, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${percentage}%`, background: barColor, borderRadius: 10 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Device Breakdown */}
                <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Device Distribution</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "center", flex: 1 }}>
                    {visitorData?.devices?.map((item) => {
                      const pct = Math.round((item.value / (visitorData?.kpis?.uniqueVisitors || 1)) * 100);
                      return (
                        <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            background: "#f8f8f8", border: "1px solid #ececec", width: 36, height: 36,
                            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#111"
                          }}>
                            {getDeviceIcon(item.name)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 500 }}>
                              <span>{item.name}</span>
                              <span style={{ color: "#888" }}>{pct}%</span>
                            </div>
                            <div style={{ height: 4, width: "100%", background: "#f0f0f0", borderRadius: 10, overflow: "hidden", marginTop: 4 }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: "#111", borderRadius: 10 }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* 4. GEOGRAPHIC DISTRIBUTION (STATES & DISTRICTS) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                
                {/* States Chart */}
                <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Visitor Traffic by State</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={visitorData?.locations?.states}
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#888" }} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#111", fontWeight: 500 }} tickLine={false} axisLine={false} width={80} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#111" radius={[0, 6, 6, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Districts Table */}
                <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Top District/City Locations</h3>
                  <div style={{ overflowY: "auto", flex: 1, maxHeight: 240 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #f0f0f0", color: "#888", textAlign: "left" }}>
                          <th style={{ padding: "8px 12px 12px 12px", fontWeight: 600 }}>District/City</th>
                          <th style={{ padding: "8px 12px 12px 12px", fontWeight: 600 }}>State</th>
                          <th style={{ padding: "8px 12px 12px 12px", fontWeight: 600, textAlign: "right" }}>Sessions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitorData?.locations?.districts?.map((loc, idx) => (
                          <tr key={`${loc.district}-${idx}`} style={{ borderBottom: "1px solid #f9f9f9" }}>
                            <td style={{ padding: "10px 12px", fontWeight: 600, color: "#111", display: "flex", alignItems: "center", gap: 6 }}>
                              <MapPin size={12} style={{ color: "#a38144" }} />
                              {loc.district}
                            </td>
                            <td style={{ padding: "10px 12px", color: "#666" }}>{loc.state}</td>
                            <td style={{ padding: "10px 12px", fontWeight: 700, color: "#111", textAlign: "right" }}>{loc.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* 5. VISITOR SESSION EXPLORER */}
              <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Visitor Sessions Explorer</h3>
                    <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0 0" }}>Review detailed user activity log, locations and browser states</p>
                  </div>

                  {/* Search Bar */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, background: "#f8f8f8",
                    border: "1px solid #ececec", borderRadius: 12, padding: "0 14px", width: "100%", maxWidth: 300, height: 40
                  }}>
                    <Search size={15} style={{ color: "#888" }} />
                    <input
                      type="text"
                      placeholder="Search state, city, IP or action..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ border: "none", background: "none", outline: "none", fontSize: 12, width: "100%", height: "100%" }}
                    />
                  </div>
                </div>

                {/* Session Explorer Table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #ececec", color: "#888", textAlign: "left", background: "#fbfbfb" }}>
                        <th style={{ padding: "14px 16px", fontWeight: 600 }}>Visitor IP</th>
                        <th style={{ padding: "14px 16px", fontWeight: 600 }}>Location</th>
                        <th style={{ padding: "14px 16px", fontWeight: 600 }}>Gender</th>
                        <th style={{ padding: "14px 16px", fontWeight: 600 }}>Device</th>
                        <th style={{ padding: "14px 16px", fontWeight: 600 }}>Last Action</th>
                        <th style={{ padding: "14px 16px", fontWeight: 600 }}>Duration</th>
                        <th style={{ padding: "14px 16px", fontWeight: 600 }}>Last Active</th>
                        <th style={{ padding: "14px 16px", fontWeight: 600 }}>Pages</th>
                        <th style={{ padding: "14px 16px", width: 50 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSessions.length === 0 ? (
                        <tr>
                          <td colSpan="9" style={{ padding: 40, textAlign: "center", color: "#888" }}>
                            No visitor sessions found matching "{searchQuery}"
                          </td>
                        </tr>
                      ) : (
                        filteredSessions.map((session) => {
                          const isExpanded = expandedSessionId === session.sessionId;
                          
                          // Determine status
                          const isSessionActive = new Date(session.updatedAt).getTime() > Date.now() - 5 * 60 * 1000;

                          return (
                            <>
                              <tr
                                key={session.sessionId}
                                style={{
                                  borderBottom: "1px solid #f5f5f5", cursor: "pointer",
                                  background: isExpanded ? "#fafafa" : "transparent"
                                }}
                                onClick={() => setExpandedSessionId(isExpanded ? null : session.sessionId)}
                              >
                                <td style={{ padding: "16px 16px", fontWeight: 600, color: "#111" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{
                                      width: 8, height: 8, borderRadius: "50%",
                                      background: isSessionActive ? "#22c55e" : "#cbd5e1"
                                    }} title={isSessionActive ? "Active" : "Idle"} />
                                    {session.ip || "Guest IP"}
                                  </div>
                                </td>
                                <td style={{ padding: "16px 16px", color: "#111" }}>
                                  <strong>{session.district}</strong>, {session.state}
                                </td>
                                <td style={{ padding: "16px 16px" }}>
                                  <span style={{
                                    fontSize: 11, background: session.gender === "Female" ? "#fce7f3" : "#f1f5f9",
                                    color: session.gender === "Female" ? "#db2777" : "#334155",
                                    padding: "3px 8px", borderRadius: 8, fontWeight: 600
                                  }}>
                                    {session.gender}
                                  </span>
                                </td>
                                <td style={{ padding: "16px 16px", color: "#555" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {getDeviceIcon(session.deviceType)}
                                    <span style={{ fontSize: 12 }}>{session.deviceType}</span>
                                  </div>
                                </td>
                                <td style={{ padding: "16px 16px", color: "#111", fontWeight: 500 }}>
                                  {session.lastAction}
                                </td>
                                <td style={{ padding: "16px 16px", color: "#666" }}>
                                  {formatDuration(session.duration)}
                                </td>
                                <td style={{ padding: "16px 16px", color: "#888" }}>
                                  {getRelativeTime(session.updatedAt)}
                                </td>
                                <td style={{ padding: "16px 16px", fontWeight: 700, color: "#111" }}>
                                  {session.pagesVisited?.length || 1}
                                </td>
                                <td style={{ padding: "16px 16px", textAlign: "right" }}>
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </td>
                              </tr>

                              {/* Expanded Rows showing Navigation History */}
                              {isExpanded && (
                                <tr key={`${session.sessionId}-expanded`} style={{ background: "#fbfbfb", borderBottom: "1px solid #ececec" }}>
                                  <td colSpan="9" style={{ padding: "16px 24px" }}>
                                    <div style={{ borderLeft: "2px solid #c5a880", paddingLeft: 16, marginLeft: 10 }}>
                                      <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: 0.5, marginBottom: 12 }}>
                                        User Navigation Path Traversal
                                      </h4>
                                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {session.pagesVisited?.map((page, pidx) => (
                                          <div key={pidx} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>
                                            <span style={{
                                              color: "#c5a880", background: "#f9f6f0", width: 20, height: 20,
                                              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                              fontWeight: 700, fontSize: 10
                                            }}>
                                              {pidx + 1}
                                            </span>
                                            <span style={{ fontWeight: 600, color: "#111", fontFamily: "monospace", background: "#f0f0f0", padding: "2px 6px", borderRadius: 4 }}>
                                              {page.path}
                                            </span>
                                            <span style={{ color: "#888" }}>
                                              at {new Date(page.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
}
