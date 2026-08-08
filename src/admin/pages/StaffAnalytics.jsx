import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin, ShoppingBag, Search } from "lucide-react";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#111", color: "#fff", padding: "10px 16px",
        borderRadius: "12px", fontSize: "13px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        border: "1px solid #333"
      }}>
        <p style={{ fontWeight: 700, margin: 0 }}>{label}</p>
        <p style={{ margin: "4px 0 0 0", color: "#888" }}>
          Orders: <strong style={{ color: "#fff" }}>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

export default function StaffAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDistrictAnalytics = async () => {
      try {
        const res = await axios.get(`${BACKEND}/api/staff/analytics/districts`, { withCredentials: true });
        setData(res.data);
      } catch (err) {
        console.error("Error fetching district analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDistrictAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div style={{ fontSize: 32 }}>⏳</div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  const districts = data?.districts || [];
  const filteredDistricts = districts.filter(d => 
    d.district.toLowerCase().includes(search.toLowerCase())
  );

  // Prepare chart data for top 8 districts
  const chartData = districts.slice(0, 8).map(d => ({
    name: d.district,
    orders: d.ordersCount
  }));

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1>District Analytics</h1>
          <p>Orders and customer density by delivery district</p>
        </div>
      </div>

      {/* Stats Summary Tiles */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div className="stat-card">
          <div className="stat-top">
            <span>Total Districts Served</span>
            <div className="stat-icon"><MapPin size={22} /></div>
          </div>
          <h2>{data?.totalDistricts || 0}</h2>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
            Unique shipping destinations
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Total Orders Analyzed</span>
            <div className="stat-icon"><ShoppingBag size={22} /></div>
          </div>
          <h2>{data?.totalOrders || 0}</h2>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
            Dynamically fetched from shipping addresses
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "32px", alignItems: "start" }} className="analytics-layout">
        
        {/* Left Side: Ranked Table */}
        <div className="admin-card-panel" style={{ height: "100%" }}>
          <div className="card-header" style={{ marginBottom: "16px" }}>
            <h3>Top Ordering Districts</h3>
          </div>

          <div className="table-toolbar" style={{ borderBottom: "none", padding: 0, marginBottom: "16px" }}>
            <div className="table-search" style={{ width: "100%" }}>
              <Search size={15} color="#888" />
              <input
                type="text"
                placeholder="Search districts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>Rank</th>
                  <th>District</th>
                  <th style={{ textAlign: "right" }}>Orders Count</th>
                </tr>
              </thead>
              <tbody>
                {filteredDistricts.map((item, index) => (
                  <tr key={item.district}>
                    <td style={{ fontWeight: 600, color: "#888" }}>#{index + 1}</td>
                    <td style={{ fontWeight: 600 }}>{item.district}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{item.ordersCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Recharts Bar Chart */}
        <div className="admin-card-panel" style={{ minHeight: "500px" }}>
          <div className="card-header" style={{ marginBottom: "24px" }}>
            <h3>Orders Breakdown (Top Destinations)</h3>
            <span style={{ fontSize: "12px", color: "#888" }}>Visualizing order counts by district</span>
          </div>

          <div style={{ width: "100%", height: "380px" }}>
            {chartData.length === 0 ? (
              <div className="empty-state" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p>No orders data available for charting</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#666", fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#666" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                  <Bar
                    dataKey="orders"
                    fill="#111111"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
