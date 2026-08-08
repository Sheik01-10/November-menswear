import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Mail, Phone, MapPin, Calendar, ShoppingBag } from "lucide-react";
import { io } from "socket.io-client";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export default function StaffCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/staff/customers`, { withCredentials: true });
      setCustomers(res.data);
    } catch (e) {
      console.error("Error fetching staff customers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();

    const socket = io(BACKEND);
    socket.on("user_changed", () => {
      fetchCustomers();
    });

    return () => socket.disconnect();
  }, []);

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.district?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1>Customers</h1>
          <p>{customers.length} registered customers</p>
        </div>
      </div>

      <div className="table-panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={15} color="#888" />
            <input
              type="text"
              placeholder="Search customers by name, email, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span style={{ color: "#888", fontSize: 13 }}>{filtered.length} customers found</span>
        </div>

        {loading ? (
          <div className="loading-state"><p>Loading customers list...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No customers found</h3>
            <p>Customers will appear here when they register or place an order.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>District</th>
                  <th>Orders Count</th>
                  <th>Last Order Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div className="customer-cell">
                        <img
                          src={`https://i.pravatar.cc/100?u=${c.email}`}
                          alt={c.name}
                          onError={e => { e.target.src = `https://i.pravatar.cc/100?u=${c.email}`; }}
                        />
                        <div>
                          <h4 style={{ fontWeight: 600 }}>{c.name}</h4>
                          <span style={{ fontSize: 10, color: "#888" }}>
                            Joined {new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "#555" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Mail size={13} color="#888" />
                        {c.email}
                      </div>
                    </td>
                    <td style={{ color: "#555" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Phone size={13} color="#888" />
                        {c.phone || "—"}
                      </div>
                    </td>
                    <td style={{ color: "#555", fontWeight: 500 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={13} color="#888" />
                        {c.district}
                      </div>
                    </td>
                    <td style={{ color: "#333", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: "10px" }}>
                        <ShoppingBag size={13} color="#888" />
                        {c.ordersCount}
                      </div>
                    </td>
                    <td style={{ color: "#888" }}>
                      {c.lastOrderDate ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Calendar size={13} color="#888" />
                          {new Date(c.lastOrderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      ) : "—"}
                    </td>
                    <td>
                      <span className={`status-badge ${c.isActive === "Active" ? "completed" : "cancelled"}`} style={{ fontSize: 11 }}>
                        {c.isActive}
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
  );
}
