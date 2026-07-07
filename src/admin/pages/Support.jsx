import { useState, useEffect } from "react";
import axios from "axios";
import { Search, X, Check, Trash2, Mail, User, Clock, MessageSquare } from "lucide-react";
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";

const BACKEND = `http://${window.location.hostname}:5000`;
const STATUSES = ["All", "Unread", "Read"];

export default function AdminSupport() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });

  const [statusFilter, setStatusFilter] = useState("All");

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

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/support`);
      setMessages(res.data);
    } catch (e) {
      console.error("Error fetching support messages:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const socket = io(BACKEND);
    socket.on("support_message", ({ action, data }) => {
      setMessages((prev) => {
        if (action === "create") return [data, ...prev];
        if (action === "update") return prev.map((m) => (m._id === data._id ? data : m));
        if (action === "delete") return prev.filter((m) => m._id !== data._id);
        return prev;
      });
      
      // Update selected message if it is updated/deleted
      setSelectedMessage((prev) => {
        if (!prev) return null;
        if (action === "update" && prev._id === data._id) return data;
        if (action === "delete" && prev._id === data._id) return null;
        return prev;
      });
    });

    return () => socket.disconnect();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    setUpdating(true);
    try {
      await axios.put(`${BACKEND}/api/support/${id}/read`);
    } catch (err) {
      console.error("Failed to mark message as read:", err);
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await axios.delete(`${BACKEND}/api/support/${id}`);
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message.");
    }
  };

  const getStatusClass = (s) => (s === "Unread" ? "pending" : "completed");

  const filtered = messages.filter((m) => {
    const matchSearch =
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase()) ||
      m.message?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1>Support Messages</h1>
          <p>{messages.filter(m => m.status === "Unread").length} unread support inquiries</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              height: 38,
              padding: "0 18px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: statusFilter === s ? "#111" : "#ececec",
              background: statusFilter === s ? "#111" : "#fff",
              color: statusFilter === s ? "#fff" : "#555",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: ".2s"
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="table-panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={15} color="#888" />
            <input
              placeholder="Search messages by sender, subject or inquiry text..."
              value={search}
              onChange={handleLocalSearchChange}
            />
          </div>
          <span style={{ color: "#888", fontSize: 13 }}>{filtered.length} messages</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading messages...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No messages found</h3>
            <p>Customer help requests will appear here when submitted.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Message Snippet</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m._id} style={{ cursor: "pointer" }} onClick={() => setSelectedMessage(m)}>
                    <td>
                      <div className="customer-cell">
                        <img
                          src={`https://i.pravatar.cc/60?u=${m.email}`}
                          alt={m.name}
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                          style={{ width: 32, height: 32, borderRadius: "50%" }}
                        />
                        <div>
                          <h4 style={{ fontWeight: 600 }}>{m.name}</h4>
                          <span style={{ fontSize: 11, color: "#888" }}>{m.email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: "#333" }}>{m.subject}</td>
                    <td style={{ color: "#666", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.message}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ color: "#888", fontSize: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span>
                          {new Date(m.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                        <span style={{ opacity: 0.7 }}>
                          {new Date(m.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="table-actions" style={{ display: "flex", gap: 8 }}>
                        {m.status === "Unread" && (
                          <button
                            className="btn-success"
                            onClick={(e) => handleMarkAsRead(m._id, e)}
                            disabled={updating}
                            title="Mark as Read"
                            style={{
                              border: "none",
                              background: "#e8f5e9",
                              color: "#2e7d32",
                              borderRadius: 8,
                              width: 32,
                              height: 32,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer"
                            }}
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          className="btn-danger"
                          onClick={(e) => handleDelete(m._id, e)}
                          title="Delete message"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <MessageSquare size={18} color="#888" />
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Support Inquiry</h2>
              </div>
              <button className="modal-close" onClick={() => setSelectedMessage(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ padding: "10px 0" }}>
              {/* Subject & Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px 0", color: "#111" }}>
                    {selectedMessage.subject}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#888", fontSize: 12 }}>
                    <Clock size={13} />
                    <span>
                      Submitted on{" "}
                      {new Date(selectedMessage.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>
                <span className={`status-badge ${getStatusClass(selectedMessage.status)}`}>
                  {selectedMessage.status}
                </span>
              </div>

              {/* Sender Details */}
              <div style={{ background: "#f9f9f9", borderRadius: 12, padding: 16, marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img
                    src={`https://i.pravatar.cc/80?u=${selectedMessage.email}`}
                    alt={selectedMessage.name}
                    style={{ width: 44, height: 44, borderRadius: "50%" }}
                  />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#111" }}>
                      <User size={13} color="#888" />
                      <span>{selectedMessage.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#555", marginTop: 4 }}>
                      <Mail size={13} color="#888" />
                      <a href={`mailto:${selectedMessage.email}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {selectedMessage.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div style={{ textAlign: "left", marginBottom: 24 }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "#888", letterSpacing: 1, marginBottom: 10 }}>
                  Message Content
                </h4>
                <div style={{
                  background: "#ffffff",
                  border: "1px solid #ececec",
                  borderRadius: 12,
                  padding: 18,
                  fontSize: 14,
                  color: "#333",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap"
                }}>
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 16, borderTop: "1px solid #ececec" }}>
              {selectedMessage.status === "Unread" && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(selectedMessage._id)}
                  disabled={updating}
                  style={{
                    height: 40,
                    padding: "0 18px",
                    background: "#e8f5e9",
                    color: "#2e7d32",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Check size={14} />
                  <span>Mark as Read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(selectedMessage._id)}
                style={{
                  height: 40,
                  padding: "0 18px",
                  background: "#ffebee",
                  color: "#c62828",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <Trash2 size={14} />
                <span>Delete Message</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedMessage(null)}
                style={{
                  height: 40,
                  padding: "0 18px",
                  border: "1px solid #e0e0e0",
                  background: "#fff",
                  color: "#555",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
