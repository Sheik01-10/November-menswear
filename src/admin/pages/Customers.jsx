import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Mail, Phone, Calendar, Trash2 } from "lucide-react";
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";

const BACKEND = `http://${window.location.hostname}:5000`;

export default function AdminCustomers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

  const handleLocalSearchChange = (e) => {
    const val = e.target.value;
    const params = new URLSearchParams(location.search);
    if (val) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/users`);
      setCustomers(res.data);
    } catch (e) {
      console.error("Error fetching customers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();

    const socket = io(BACKEND);
    socket.on("user_changed", ({ action, data }) => {
      setCustomers(prev => {
        if (action === "create") return [data, ...prev];
        if (action === "update") return prev.map(c => c._id === data._id ? data : c);
        if (action === "delete") return prev.filter(c => c._id !== data._id);
        return prev;
      });
    });

    return () => socket.disconnect();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer profile?")) return;
    try {
      await axios.delete(`${BACKEND}/api/users/${id}`);
    } catch (e) {
      alert("Failed to delete customer profile");
    }
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
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
              placeholder="Search customers by name or email..."
              value={search}
              onChange={handleLocalSearchChange}
            />
          </div>
          <span style={{ color: "#888", fontSize: 13 }}>{filtered.length} customers found</span>
        </div>

        {loading ? (
          <div className="loading-state"><p>Loading customers list...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No customers found</h3>
            <p>Customer accounts appear here when they register on the storefront.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div className="customer-cell">
                        <img
                          src={c.photo || `https://i.pravatar.cc/100?u=${c.email}`}
                          alt={c.name}
                          onError={e => { e.target.src = `https://i.pravatar.cc/100?u=${c.email}`; }}
                        />
                        <div>
                          <h4 style={{ fontWeight: 600 }}>{c.name}</h4>
                          {c.isAdmin && <span className="status-badge completed" style={{ fontSize: 10, padding: "2px 6px" }}>Admin</span>}
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
                    <td style={{ color: "#888" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={13} color="#888" />
                        {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td>
                      <button className="btn-danger" onClick={() => handleDelete(c._id)} title="Delete customer profile">
                        <Trash2 size={14} />
                      </button>
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
