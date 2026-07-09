import { useState, useEffect } from "react";
import axios from "axios";
import { Search, X, ChevronDown, Eye } from "lucide-react";
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

const STATUSES = ["All", "Pending", "Processing", "Shipped", "Completed", "Cancelled"];

export default function AdminOrders() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
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
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    axios.get(`${BACKEND}/api/orders`).then(r => setOrders(r.data)).catch(console.error).finally(() => setLoading(false));
    const socket = io(BACKEND);
    socket.on("order_changed", ({ action, data }) => {
      setOrders(prev => {
        if (action === "create") return [data, ...prev];
        if (action === "update") return prev.map(o => o._id === data._id ? data : o);
        if (action === "delete") return prev.filter(o => o._id !== data._id);
        return prev;
      });
    });
    return () => socket.disconnect();
  }, []);

  const getStatusClass = (s) =>
    ({ Completed: "completed", Processing: "processing", Shipped: "shipped", Pending: "pending", Cancelled: "cancelled" }[s] || "pending");

  const getPaymentMethodClass = (m) => {
    if (m === "Online Payment") return "pay-online";
    return "pay-cod";
  };

  const getPaymentStatusClass = (s) => {
    if (s === "Paid") return "paid";
    if (s === "Pending") return "pending";
    return "unpaid";
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await axios.put(`${BACKEND}/api/orders/${orderId}`, { status: newStatus });
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (e) { alert("Failed to update status."); }
    finally { setUpdating(false); }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    setUpdating(true);
    try {
      await axios.put(`${BACKEND}/api/orders/${orderId}`, { paymentStatus: newPaymentStatus });
      setSelectedOrder(prev => prev ? { ...prev, paymentStatus: newPaymentStatus } : null);
    } catch (e) { alert("Failed to update payment status."); }
    finally { setUpdating(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this order?")) return;
    try { await axios.delete(`${BACKEND}/api/orders/${id}`); setSelectedOrder(null); }
    catch { alert("Failed to delete."); }
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p>{orders.length} total orders</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              height: 38, padding: "0 18px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: statusFilter === s ? "#111" : "#ececec",
              background: statusFilter === s ? "#111" : "#fff",
              color: statusFilter === s ? "#fff" : "#555",
              fontSize: 13, fontWeight: 500, cursor: "pointer", transition: ".2s"
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
            <input placeholder="Search by order ID or customer..." value={search} onChange={handleLocalSearchChange} />
          </div>
          <span style={{ color: "#888", fontSize: 13 }}>{filtered.length} orders</span>
        </div>

        {loading ? (
          <div className="loading-state"><p>Loading orders...</p></div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Payment Status</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o._id} style={{ cursor: "pointer" }} onClick={() => setSelectedOrder(o)}>
                    <td style={{ fontWeight: 600 }}>{o.orderId}</td>
                    <td>
                      <div className="customer-cell">
                        <img
                          src={o.customerPhoto || `https://i.pravatar.cc/60?u=${o.customerEmail}`}
                          alt={o.customerName}
                          onError={e => { e.target.src = `https://i.pravatar.cc/60?u=${o.customerEmail}`; }}
                        />
                        {o.customerName}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{Number(o.amount).toLocaleString("en-IN")}</td>
                    <td>
                      <span className={`status-badge ${getPaymentMethodClass(o.paymentMethod || "Cash on Delivery")}`}>
                        {o.paymentMethod || "Cash on Delivery"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getPaymentStatusClass(o.paymentStatus || "Unpaid")}`}>
                        {o.paymentStatus || "Unpaid"}
                      </span>
                    </td>
                    <td><span className={`status-badge ${getStatusClass(o.status)}`}>{o.status}</span></td>
                    <td style={{ color: "#888" }}>
                      {new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="table-actions">
                        <button 
                          className="btn-secondary" 
                          onClick={() => setSelectedOrder(o)}
                          style={{ height: 28, padding: "0 12px", borderRadius: 8, fontSize: 12, display: "inline-flex", alignItems: "center" }}
                        >
                          <Eye size={12} style={{ marginRight: 4 }} />
                          View Details
                        </button>
                        <select
                          value={o.status}
                          onChange={e => handleUpdateStatus(o._id, e.target.value)}
                          disabled={updating}
                          style={{
                            border: "1px solid #ececec", borderRadius: 8, padding: "4px 8px",
                            fontSize: 12, cursor: "pointer", background: "#fff", height: 28
                          }}
                        >
                          {["Pending","Processing","Shipped","Completed","Cancelled"].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button className="btn-danger" onClick={() => handleDelete(o._id)} style={{ height: 28, padding: "0 8px", display: "inline-flex", alignItems: "center" }}>
                          <X size={14} />
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order {selectedOrder.orderId}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Customer</p>
                <div className="customer-cell">
                  <img src={selectedOrder.customerPhoto || `https://i.pravatar.cc/60?u=${selectedOrder.customerEmail}`} alt="" style={{ width: 40, height: 40 }} />
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600 }}>{selectedOrder.customerName}</h4>
                    <span style={{ fontSize: 12, color: "#888" }}>{selectedOrder.customerEmail}</span>
                  </div>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Status</p>
                <select
                  value={selectedOrder.status}
                  onChange={e => handleUpdateStatus(selectedOrder._id, e.target.value)}
                  style={{ border: "1px solid #ececec", borderRadius: 10, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}
                >
                  {["Pending","Processing","Shipped","Completed","Cancelled"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shipping Details */}
            {selectedOrder.address && (
              <div style={{ borderTop: "1px solid #ececec", paddingTop: 20, marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: "#888", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Shipping Details</p>
                <p style={{ fontSize: 13, margin: "0 0 6px 0", color: "#333" }}><strong>Phone:</strong> {selectedOrder.phone}</p>
                <p style={{ fontSize: 13, margin: "0 0 6px 0", color: "#333" }}><strong>Address:</strong> {selectedOrder.address}</p>
                <p style={{ fontSize: 13, margin: "0 0 6px 0", color: "#333" }}><strong>City/State/Pincode:</strong> {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
                {selectedOrder.landmark && <p style={{ fontSize: 13, margin: "0 0 6px 0", color: "#333" }}><strong>Landmark:</strong> {selectedOrder.landmark}</p>}
              </div>
            )}

            {/* Payment Details */}
            <div style={{ borderTop: "1px solid #ececec", paddingTop: 20, marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Payment Details</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <div>
                  <p style={{ fontSize: 13, margin: "0 0 6px 0", color: "#333" }}>
                    <strong>Method:</strong>{" "}
                    <span className={`status-badge ${getPaymentMethodClass(selectedOrder.paymentMethod || "Cash on Delivery")}`}>
                      {selectedOrder.paymentMethod || "Cash on Delivery"}
                    </span>
                  </p>
                  <p style={{ fontSize: 13, margin: 0, color: "#333" }}>
                    <strong>Status:</strong>{" "}
                    <span className={`status-badge ${getPaymentStatusClass(selectedOrder.paymentStatus || "Unpaid")}`}>
                      {selectedOrder.paymentStatus || "Unpaid"}
                    </span>
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Update Payment Status</p>
                  <select
                    value={selectedOrder.paymentStatus || "Unpaid"}
                    onChange={e => handleUpdatePaymentStatus(selectedOrder._id, e.target.value)}
                    disabled={updating}
                    style={{
                      border: "1px solid #ececec",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 12,
                      cursor: "pointer",
                      background: "#fff"
                    }}
                  >
                    {["Paid", "Unpaid", "Pending"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ borderTop: "1px solid #ececec", paddingTop: 20, marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Items</p>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                  <img src={item.front} alt={item.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", border: "1px solid #ececec" }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</h4>
                    <p style={{ fontSize: 12, color: "#888" }}>Qty: {item.quantity}</p>
                  </div>
                  <span style={{ fontWeight: 700 }}>{item.price}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 16, borderTop: "1px solid #ececec" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666" }}>
                <span>Subtotal:</span>
                <span>₹{Number(selectedOrder.amount - (selectedOrder.shippingCharge || 0)).toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666" }}>
                <span>Shipping Charge:</span>
                <span>{selectedOrder.shippingCharge > 0 ? `₹${Number(selectedOrder.shippingCharge).toLocaleString("en-IN")}` : "FREE"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: 10 }}>
                <span style={{ fontSize: 13, color: "#888" }}>
                  {new Date(selectedOrder.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                <span style={{ fontSize: 20, fontWeight: 800 }}>
                  ₹{Number(selectedOrder.amount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
