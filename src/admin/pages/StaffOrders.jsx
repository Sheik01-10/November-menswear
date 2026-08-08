import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Eye, X, MapPin, Mail, Phone, Calendar, Info } from "lucide-react";
import { io } from "socket.io-client";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export default function StaffOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/staff/orders`, { withCredentials: true });
      setOrders(res.data);
    } catch (e) {
      console.error("Error fetching staff orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = io(BACKEND);
    socket.on("order_changed", () => {
      fetchOrders();
    });

    return () => socket.disconnect();
  }, []);

  const getStatusClass = (status) =>
    ({ Completed: "completed", Processing: "processing", Shipped: "shipped", Pending: "pending", Cancelled: "cancelled" }[status] || "pending");

  const filtered = orders.filter(o => {
    const matchesSearch = o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page-content" style={{ display: "flex", gap: "24px", position: "relative" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="admin-page-header">
          <div>
            <h1>Orders</h1>
            <p>{orders.length} total orders recorded</p>
          </div>
        </div>

        <div className="table-panel">
          <div className="table-toolbar" style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between" }}>
            <div className="table-search" style={{ flex: "1 1 300px" }}>
              <Search size={15} color="#888" />
              <input
                type="text"
                placeholder="Search by Order ID or Customer Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="filter-group" style={{ display: "flex", gap: "8px" }}>
              {["All", "Pending", "Processing", "Shipped", "Completed", "Cancelled"].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`btn-secondary ${statusFilter === st ? "active" : ""}`}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    background: statusFilter === st ? "#000" : "transparent",
                    color: statusFilter === st ? "#fff" : "#555",
                    border: "1px solid #ddd"
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading-state"><p>Loading orders list...</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <h3>No orders found</h3>
              <p>Try refining your search filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600 }}>{order.orderId}</td>
                      <td>
                        <div className="customer-cell">
                          <img
                            src={`https://i.pravatar.cc/100?u=${order.customerEmail}`}
                            alt={order.customerName}
                            onError={e => { e.target.src = `https://i.pravatar.cc/100?u=${order.customerEmail}`; }}
                          />
                          <div>
                            <h4 style={{ fontWeight: 600 }}>{order.customerName}</h4>
                            <span style={{ fontSize: "11px", color: "#888" }}>{order.customerEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{Number(order.amount).toLocaleString("en-IN")}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${order.paymentStatus === "Paid" ? "completed" : "pending"}`} style={{ fontSize: "11px" }}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td style={{ color: "#555" }}>
                        {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        <button className="table-actions-btn" onClick={() => setSelectedOrder(order)} title="View Details">
                          <Eye size={15} />
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

      {/* Details Side Panel */}
      {selectedOrder && (
        <div className="detail-panel" style={{
          width: "400px",
          background: "#ffffff",
          borderLeft: "1px solid #eaeaea",
          padding: "24px",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.05)",
          position: "sticky",
          top: "0",
          height: "calc(100vh - 120px)",
          overflowY: "auto",
          zIndex: 10
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3>Order Details</h3>
            <button onClick={() => setSelectedOrder(null)} style={{ border: "none", background: "none", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>

          <div className="detail-section" style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "16px", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 4px 0" }}>{selectedOrder.orderId}</h2>
            <span style={{ fontSize: "12px", color: "#888" }}>
              Placed on {new Date(selectedOrder.date).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="detail-section" style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "16px", marginBottom: "16px" }}>
            <h4 style={{ margin: "0 0 10px 0", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px", color: "#888" }}>Customer Details</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <Users size={14} color="#888" />
                <strong>{selectedOrder.customerName}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <Mail size={14} color="#888" />
                <span>{selectedOrder.customerEmail}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <Phone size={14} color="#888" />
                <span>{selectedOrder.phone || "—"}</span>
              </div>
            </div>
          </div>

          <div className="detail-section" style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "16px", marginBottom: "16px" }}>
            <h4 style={{ margin: "0 0 10px 0", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px", color: "#888" }}>Shipping Address</h4>
            <div style={{ display: "flex", gap: "8px", fontSize: "13px" }}>
              <MapPin size={16} color="#888" style={{ marginTop: "2px", flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, lineHeight: "1.4" }}>{selectedOrder.address}</p>
                <p style={{ margin: "4px 0 0 0", color: "#555" }}>
                  {selectedOrder.city}, {selectedOrder.district && `${selectedOrder.district}, `}{selectedOrder.state} - {selectedOrder.pincode}
                </p>
              </div>
            </div>
          </div>

          <div className="detail-section" style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "16px", marginBottom: "16px" }}>
            <h4 style={{ margin: "0 0 10px 0", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px", color: "#888" }}>Payment Information</h4>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
              <div>
                <p style={{ margin: 0 }}>Method: <strong>{selectedOrder.paymentMethod}</strong></p>
                <p style={{ margin: "4px 0 0 0" }}>Status: <span className={`status-badge ${selectedOrder.paymentStatus === "Paid" ? "completed" : "pending"}`} style={{ fontSize: "11px" }}>{selectedOrder.paymentStatus}</span></p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "#888" }}>Total Paid</span>
                <h3 style={{ margin: 0, fontSize: "18px" }}>₹{Number(selectedOrder.amount).toLocaleString("en-IN")}</h3>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4 style={{ margin: "0 0 10px 0", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px", color: "#888" }}>Items Ordered</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <img
                    src={item.front}
                    alt={item.name}
                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px", background: "#f9f9f9" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ margin: 0, fontSize: "13px", fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{item.name}</h5>
                    <span style={{ fontSize: "11px", color: "#888" }}>Size: {item.size || "—"} | Qty: {item.quantity}</span>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "13px", fontWeight: "600" }}>
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
