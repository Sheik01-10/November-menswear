import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";
import { useProducts } from "../context/ProductContext";
import axios from "axios";
import toast from "react-hot-toast";

import "./Cart.css";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export default function Cart() {
  const navigate = useNavigate();
  const { settings } = useProducts();

  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    totalItems,
    totalPrice,
    shippingTotal,
    grandTotal,
  } = useCart();

  const [currentUser, setCurrentUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Order Cancellation States
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReasonOption, setCancelReasonOption] = useState("Order placed by mistake");
  const [cancelReasonText, setCancelReasonText] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fetch User Orders from Backend
  const fetchUserOrders = useCallback(async (email) => {
    try {
      setLoadingOrders(true);
      const res = await axios.get(`${BACKEND}/api/orders/user/${email}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching user orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          name: user.displayName || "Valued Client",
          email: user.email,
          photo: user.photoURL || "/default-avatar.svg",
        };
        setCurrentUser(userData);
        fetchUserOrders(user.email);
      } else {
        setCurrentUser(null);
        setOrders([]);
        setLoadingOrders(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserOrders]);

  const toggleOrderExpand = useCallback((orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  }, []);

  const handleInitiateCancel = useCallback((order) => {
    setCancellingOrder(order);
    setCancelReasonOption("Order placed by mistake");
    setCancelReasonText("");
    setShowCancelModal(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!cancellingOrder) return;
    const finalReason = cancelReasonOption === "Other" ? cancelReasonText.trim() : cancelReasonOption;
    if (cancelReasonOption === "Other" && !finalReason) {
      toast.error("Please enter a reason for cancellation.");
      return;
    }

    try {
      const res = await axios.put(`${BACKEND}/api/orders/${cancellingOrder._id}`, {
        status: "Cancelled",
        cancellationReason: finalReason
      });

      setOrders(prev => prev.map(o => o._id === cancellingOrder._id ? res.data : o));
      setShowCancelModal(false);
      setCancellingOrder(null);
      setCancelReasonText("");
      toast.success(`Order ${cancellingOrder.orderId} cancelled successfully.`);
    } catch (err) {
      console.error("Error cancelling order:", err);
      toast.error("Failed to cancel the order. Please try again.");
    }
  }, [cancellingOrder, cancelReasonOption, cancelReasonText]);

  const getStatusClass = useCallback((status) => {
    return {
      Completed: "status-completed",
      Processing: "status-processing",
      Shipped: "status-shipped",
      Pending: "status-pending",
      Cancelled: "status-cancelled",
    }[status] || "";
  }, []);

  const handleCheckoutClick = useCallback((e) => {
    e.preventDefault();
    const currentUser = auth.currentUser || JSON.parse(localStorage.getItem("user") || "null");
    if (!currentUser) {
      toast.error("Please log in first to proceed to checkout.");
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  }, [navigate]);

  return (
    <>
      <Header />

      <div className="cart-page">
        <div className="cart-page-split-container">
          <div className="cart-page-main-side">
            <div className="cart-header">
              <span>SHOPPING BAG</span>
              <h1>Your Cart</h1>
              <p>{totalItems} Item{totalItems !== 1 && "s"}</p>
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <h2>Your Bag is Empty</h2>
                <p>Discover timeless luxury pieces.</p>
                <Link to="/products" className="continue-btn">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="cart-wrapper">
                <div className="cart-products">
                  {cart.map((item) => (
                    <div className="cart-card" key={item.id}>
                      <img
                        src={getOptimizedImageUrl(item.front, 200)}
                        alt={item.name}
                        loading="lazy"
                      />

                      <div className="cart-info">
                        <span className="category">THE NOVEMBER COLLECTION</span>
                        <h3>{item.name}</h3>
                        {item.selectedSize && (
                          <span className="cart-item-size" style={{ fontSize: "13px", color: "#888888", display: "block", marginTop: "4px" }}>
                            Size: {item.selectedSize}
                          </span>
                        )}
                        <p>{item.price}</p>

                        <div className="qty-box">
                          <button onClick={() => decreaseQty(item.id)}>
                            <Minus size={16} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => increaseQty(item.id)}>
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <button className="delete-btn" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="summary">
                  <h2>Order Summary</h2>
                  <div className="summary-row">
                    <span>Items</span>
                    <span>{totalItems}</span>
                  </div>

                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{shippingTotal > 0 ? `₹${shippingTotal.toLocaleString("en-IN")}` : "FREE"}</span>
                  </div>

                  <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>

                  {(() => {
                    const threshold = settings && settings.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : 999;
                    const activeThreshold = threshold === 5000 ? 999 : threshold;
                    const isFree = totalPrice >= activeThreshold;
                    return (
                      <div className="shipping-promo-message" style={{
                        textAlign: "center",
                        margin: "15px 0",
                        fontSize: "13px",
                        fontWeight: "500",
                        color: isFree ? "#22c55e" : "#888888",
                        letterSpacing: "0.5px"
                      }}>
                        {isFree 
                          ? "Free Shipping Applied!" 
                          : `Add ₹${(activeThreshold - totalPrice).toLocaleString("en-IN")} more to unlock FREE Shipping.`}
                      </div>
                    );
                  })()}

                  <button onClick={handleCheckoutClick} className="checkout-btn" style={{ textDecoration: "none" }}>
                    Checkout
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="cart-page-history-side">
            <div className="order-history-header">
              <h2>Order History</h2>
              <p>Track your November Orders</p>
            </div>

            {!currentUser ? (
              <div className="empty-orders-view guest-state">
                <ShoppingBag size={40} strokeWidth={1.2} />
                <h3>Sign In to View Orders</h3>
                <p>Log in to your November Client Account to see your previous purchase history and status.</p>
                <Link to="/login?redirect=cart" className="shop-collection-btn">
                  Sign In
                </Link>
              </div>
            ) : loadingOrders ? (
              <div className="orders-loading">
                <div className="orders-spinner"></div>
                <p>Retrieving your order history...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-orders-view">
                <ShoppingBag size={40} strokeWidth={1.2} />
                <h3>No Orders Placed Yet</h3>
                <p>Explore our latest luxury collection and place your first order.</p>
                <Link to="/products" className="shop-collection-btn">
                  Discover Collection
                </Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order._id;
                  const orderDate = new Date(order.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });

                  return (
                    <div className={`order-card-item ${isExpanded ? "expanded" : ""}`} key={order._id}>
                      <div className="order-card-header" onClick={() => toggleOrderExpand(order._id)}>
                        <div className="order-header-main">
                          <div className="order-id-date">
                            <span className="order-number">{order.orderId}</span>
                            <span className="order-date-text">{orderDate}</span>
                          </div>
                          <span className={`order-status-pill ${getStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="order-header-totals">
                          <div className="order-amount-summary">
                            <span className="amount-val">₹{Number(order.amount).toLocaleString("en-IN")}</span>
                          </div>
                          <button className="expand-toggle-icon" type="button">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="order-card-details">
                          <div className="details-grid">
                            <div className="details-shipping-box">
                              <h4>Shipping</h4>
                              <div className="shipping-info-details">
                                <p className="recipient-name"><strong>{order.customerName}</strong></p>
                                <p>{order.address}</p>
                                <p>{order.city}, {order.state} - {order.pincode}</p>
                                {order.landmark && <p className="landmark-text">Landmark: {order.landmark}</p>}
                                <p className="phone-text">Phone: {order.phone}</p>
                              </div>
                            </div>

                            <div className="details-payment-box">
                              <h4>Payment</h4>
                              <div className="payment-receipt-summary">
                                <div className="payment-receipt-row">
                                  <span>Subtotal</span>
                                  <span>₹{Number(order.amount - (order.shippingCharge || 0)).toLocaleString("en-IN")}</span>
                                </div>
                                <div className="payment-receipt-row">
                                  <span>Shipping</span>
                                  {order.shippingCharge > 0 ? (
                                    <span>₹{Number(order.shippingCharge).toLocaleString("en-IN")}</span>
                                  ) : (
                                    <span className="free-badge">FREE</span>
                                  )}
                                </div>
                                <div className="payment-receipt-row grand-total-row">
                                  <span>Total Paid</span>
                                  <span>₹{Number(order.amount).toLocaleString("en-IN")}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="details-items-section">
                            <h4>Items ({order.items?.length})</h4>
                            <div className="details-items-list">
                              {order.items?.map((item, idx) => (
                                <div className="details-item-row" key={item.id || item.productId || idx}>
                                  <img
                                    src={getOptimizedImageUrl(item.front, 200)}
                                    alt={item.name}
                                    className="details-item-img"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.src = "/default-avatar.svg";
                                    }}
                                  />
                                  <div className="details-item-main">
                                    <h5>{item.name}</h5>
                                    <span>Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ""}</span>
                                  </div>
                                  <div className="details-item-price">
                                    ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {(order.status === "Pending" || order.status === "Processing") && (
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, paddingTop: 12, borderTop: "1px solid #eaeaea" }}>
                              <button
                                type="button"
                                onClick={() => handleInitiateCancel(order)}
                                style={{
                                  background: "transparent",
                                  border: "1px solid #b91c1c",
                                  color: "#b91c1c",
                                  padding: "6px 14px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  letterSpacing: "0.5px",
                                  textTransform: "uppercase",
                                  transition: "background-color 0.2s, color 0.2s"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#b91c1c";
                                  e.currentTarget.style.color = "#fff";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                  e.currentTarget.style.color = "#b91c1c";
                                }}
                              >
                                Cancel Order
                              </button>
                            </div>
                          )}

                          {order.status === "Cancelled" && order.cancellationReason && (
                            <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid #eaeaea" }}>
                              <h4 style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", color: "#888", margin: "0 0 8px 0" }}>Cancellation Reason</h4>
                              <p style={{ fontSize: "12.5px", color: "#b91c1c", fontStyle: "italic", margin: 0 }}>
                                "{order.cancellationReason}"
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCancelModal && cancellingOrder && (
        <div 
          className="modal-overlay" 
          onClick={() => {
            setShowCancelModal(false);
            setCancellingOrder(null);
            setCancelReasonText("");
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999
          }}
        >
          <div 
            className="modal-box"
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "20px",
              width: "90%",
              maxWidth: "460px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
              color: "#000"
            }}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px", fontFamily: "'Inter', sans-serif", color: "#111" }}>
              Cancel Order {cancellingOrder.orderId}
            </h3>
            <p style={{ fontSize: "13.5px", color: "#666", marginBottom: "20px" }}>
              Please select a reason for cancelling this order. This action cannot be undone.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {[
                "Order placed by mistake",
                "Incorrect shipping address",
                "Changed my mind",
                "Found a better price elsewhere",
                "Other"
              ].map((reason) => (
                <label 
                  key={reason} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    fontSize: "14px", 
                    color: "#333", 
                    cursor: "pointer" 
                  }}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReasonOption === reason}
                    onChange={(e) => setCancelReasonOption(e.target.value)}
                    style={{ accentColor: "#111" }}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {cancelReasonOption === "Other" && (
              <textarea
                placeholder="Please enter your reason for cancellation..."
                value={cancelReasonText}
                onChange={(e) => setCancelReasonText(e.target.value)}
                style={{
                  width: "100%",
                  height: "80px",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  resize: "none",
                  marginBottom: "20px",
                  boxSizing: "border-box"
                }}
              />
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellingOrder(null);
                  setCancelReasonText("");
                }}
                style={{
                  background: "transparent",
                  border: "1px solid #ddd",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#555",
                  transition: "background-color 0.2s"
                }}
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                style={{
                  background: "#b91c1c",
                  border: "none",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  transition: "background-color 0.2s"
                }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}