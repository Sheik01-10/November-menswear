import { useState, useEffect } from "react";
import axios from "axios";
import { Users, UserPlus, Clock, ToggleLeft, ToggleRight, Trash2, Mail, Shield, CheckCircle, XCircle } from "lucide-react";
import { io } from "socket.io-client";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export default function AdminStaff() {
  const [activeTab, setActiveTab] = useState("accounts"); // accounts or activity
  const [staffList, setStaffList] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, activityRes] = await Promise.all([
        axios.get(`${BACKEND}/api/users/staff`, { withCredentials: true }),
        axios.get(`${BACKEND}/api/users/staff/activity`, { withCredentials: true })
      ]);
      setStaffList(staffRes.data);
      setActivityLog(activityRes.data);
    } catch (err) {
      console.error("Error fetching staff data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = io(BACKEND);
    socket.on("staff_changed", () => {
      fetchData();
    });

    return () => socket.disconnect();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setSubmitting(true);

    try {
      await axios.post(`${BACKEND}/api/users/staff`, {
        name,
        email,
        password
      }, { withCredentials: true });

      setShowModal(false);
      setName("");
      setEmail("");
      setPassword("");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create staff account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.put(`${BACKEND}/api/users/staff/${id}/toggle`, {}, { withCredentials: true });
      fetchData();
    } catch (err) {
      alert("Failed to toggle status");
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!confirm("Are you sure you want to delete this staff account?")) return;
    try {
      await axios.delete(`${BACKEND}/api/users/staff/${id}`, { withCredentials: true });
      fetchData();
    } catch (err) {
      alert("Failed to delete staff account");
    }
  };

  return (
    <div className="admin-page-content">
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1>Staff Management</h1>
          <p>Configure staff roles, access privileges, and monitor login activity logs.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "8px", background: "#000", color: "#fff", border: "none", cursor: "pointer", fontWeight: "600" }}>
          <UserPlus size={16} /> Add Staff Account
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-group" style={{ display: "flex", gap: "16px", borderBottom: "1px solid #eee", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("accounts")}
          style={{
            padding: "12px 16px",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            color: activeTab === "accounts" ? "#000" : "#888",
            borderBottom: activeTab === "accounts" ? "2px solid #000" : "2px solid transparent"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={16} /> Staff Accounts
          </div>
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          style={{
            padding: "12px 16px",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            color: activeTab === "activity" ? "#000" : "#888",
            borderBottom: activeTab === "activity" ? "2px solid #000" : "2px solid transparent"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Clock size={16} /> Staff Login Activity
          </div>
        </button>
      </div>

      {/* Main Panel */}
      <div className="table-panel">
        {loading ? (
          <div className="loading-state"><p>Loading staff details...</p></div>
        ) : activeTab === "accounts" ? (
          /* Accounts Tab */
          staffList.length === 0 ? (
            <div className="empty-state">
              <h3>No staff accounts registered</h3>
              <p>Add staff accounts to grant them restricted portal privileges.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Online Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map(staff => (
                    <tr key={staff._id}>
                      <td style={{ fontWeight: 600 }}>{staff.name}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Mail size={13} color="#888" />
                          {staff.email}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", textTransform: "capitalize", fontWeight: 500 }}>
                          <Shield size={13} color="#888" />
                          {staff.role}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(staff._id)}
                          style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}
                          title={staff.isActive ? "Deactivate" : "Activate"}
                        >
                          {staff.isActive ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "green" }}>
                              <CheckCircle size={16} />
                              <span style={{ fontSize: "12px", fontWeight: "600" }}>Active</span>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "red" }}>
                              <XCircle size={16} />
                              <span style={{ fontSize: "12px", fontWeight: "600" }}>Inactive</span>
                            </div>
                          )}
                        </button>
                      </td>
                      <td style={{ color: "#888" }}>
                        {staff.lastLoginAt ? (
                          new Date(staff.lastLoginAt).toLocaleString("en-IN")
                        ) : (
                          <span style={{ color: "#aaa" }}>Never Logged In</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${staff.onlineStatus === "online" ? "completed" : "pending"}`} style={{ fontSize: "11px" }}>
                          {staff.onlineStatus === "online" ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td>
                        <button className="btn-danger" onClick={() => handleDeleteStaff(staff._id)} title="Delete Staff Account" style={{ border: "none", background: "rgba(220, 53, 69, 0.1)", color: "#dc3545", padding: "6px", borderRadius: "4px", cursor: "pointer" }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Activity Log Tab */
          activityLog.length === 0 ? (
            <div className="empty-state">
              <h3>No activity history found</h3>
              <p>Staff login history details appear here.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Email</th>
                    <th>Login Time</th>
                    <th>Logout Time</th>
                    <th>Session Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLog.map(log => (
                    <tr key={log._id}>
                      <td style={{ fontWeight: 600 }}>{log.name}</td>
                      <td style={{ color: "#555" }}>{log.email}</td>
                      <td>{new Date(log.loginAt).toLocaleString("en-IN")}</td>
                      <td style={{ color: log.logoutAt ? "#555" : "#aaa" }}>
                        {log.logoutAt ? (
                          new Date(log.logoutAt).toLocaleString("en-IN")
                        ) : (
                          "Online session / Abandoned"
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${log.status === "online" ? "completed" : "pending"}`} style={{ fontSize: "11px" }}>
                          {log.status === "online" ? "Online" : "Offline"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            padding: "32px",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 12px 36px rgba(0,0,0,0.15)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Create Staff Account</h2>
              <button onClick={() => setShowModal(false)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "18px" }}>✕</button>
            </div>

            <form onSubmit={handleCreateStaff} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#666" }}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#666" }}>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. john@thenovember.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#666" }}>Credentials Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", outline: "none" }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: "8px",
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  fontWeight: "600",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
