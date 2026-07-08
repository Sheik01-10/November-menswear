import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck, Truck, CreditCard, Package, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import Header from "../components/Header";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import toast from "react-hot-toast";
import "./Checkout.css";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

// Helper function to load Razorpay Script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Tamil Nadu",
    pincode: "",
    landmark: "",
  });

  const [customerPhoto, setCustomerPhoto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null); // Stores successful order data
  const [paymentMethod, setPaymentMethod] = useState("online");

  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // Guard route for authenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !orderSuccess) {
      toast.error("Please log in first to proceed to checkout.");
      navigate("/login?redirect=checkout");
    }
  }, [authLoading, isAuthenticated, orderSuccess, navigate]);

  // Load user data if logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCustomerPhoto(user.photoURL || "");
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || user.displayName || "",
          email: prev.email || user.email || "",
        }));

        // Fetch DB user profile for saved addresses and phone number
        axios.get(`${BACKEND}/api/users/profile/${user.uid}`)
          .then((res) => {
            const dbUser = res.data;
            if (dbUser) {
              setSavedAddresses(dbUser.addresses || []);
              const defaultAddr = dbUser.addresses?.find((addr) => addr.isDefault);
              if (defaultAddr) {
                setSelectedAddressId(defaultAddr._id);
                setFormData({
                  fullName: defaultAddr.name || user.displayName || "",
                  email: user.email || "",
                  phone: defaultAddr.phone || "",
                  address: defaultAddr.street || "",
                  city: defaultAddr.city || "",
                  state: defaultAddr.state || "Tamil Nadu",
                  pincode: defaultAddr.pincode || "",
                  landmark: defaultAddr.landmark || "",
                });
              } else {
                setFormData((prev) => ({
                  ...prev,
                  fullName: dbUser.name || user.displayName || prev.fullName,
                  phone: dbUser.phone || prev.phone,
                }));
              }
            }
          })
          .catch((err) => {
            console.error("Failed to fetch user profile at checkout:", err);
          })
          .finally(() => {
            setAuthLoading(false);
          });
      } else {
        setIsAuthenticated(false);
        setSavedAddresses([]);
        setSelectedAddressId("");
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Redirect to cart if cart is empty and not in success state
  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      navigate("/cart");
    }
  }, [cart, orderSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (name === "pincode" || name === "phone")
        ? value.replace(/\D/g, "")
        : value
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return "Full Name is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) return "Valid Email is required";
    if (!formData.phone.trim() || formData.phone.length < 10) return "Valid 10-digit Phone number is required";
    if (!formData.address.trim()) return "Shipping Address is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state.trim()) return "State is required";
    if (!formData.pincode.trim() || formData.pincode.length !== 6) return "Valid 6-digit Pincode is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser || JSON.parse(localStorage.getItem("user") || "null");
    if (!currentUser) {
      toast.error("Please log in first to place your order.");
      navigate("/login?redirect=checkout");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    // 1. Handle Cash on Delivery (COD) Route
    if (paymentMethod === "cod") {
      try {
        const orderItems = cart.map((item) => {
          const priceVal = Number(String(item.price).replace(/[^\d]/g, ""));
          return {
            front: item.front || "",
            name: item.name || "Luxury Menswear Item",
            quantity: item.quantity || 1,
            price: priceVal || 0,
            size: item.selectedSize || "",
          };
        });

        const codPayload = {
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhoto: customerPhoto,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark,
          amount: totalPrice,
          items: orderItems,
          status: "Pending", // COD order starts as Pending
          paymentMethod: "Cash on Delivery",
          paymentStatus: "Unpaid"
        };

        const response = await axios.post(`${BACKEND}/api/orders`, codPayload);
        if (response.status === 201 || response.status === 200) {
          setOrderSuccess(response.data);
          clearCart();
        } else {
          setError("Failed to place Cash on Delivery order. Please try again.");
        }
      } catch (err) {
        console.error("COD Order Placement Error:", err);
        setError(err.response?.data?.message || err.message || "Failed to place order.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Handle Online Payment (Razorpay) Route
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError("Failed to load payment gateway SDK. Please check your internet connection.");
      setLoading(false);
      return;
    }

    // Map items to match calculate total format
    const paymentItems = cart.map((item) => ({
      id: item.productId || item._id,
      quantity: item.quantity || 1,
      name: item.name
    }));

    try {
      // 1. Create order on backend to get Razorpay Order ID (calculated securely)
      const orderRes = await axios.post(`${BACKEND}/api/payments/create-order`, {
        items: paymentItems,
        email: formData.email
      });

      const { id: rzpOrderId, amount: rzpAmount, currency, keyId } = orderRes.data;

      // 2. Prepare items mapped for Order Model saving
      const orderItems = cart.map((item) => {
        const priceVal = Number(String(item.price).replace(/[^\d]/g, ""));
        return {
          front: item.front || "",
          name: item.name || "Luxury Menswear Item",
          quantity: item.quantity || 1,
          price: priceVal || 0,
          size: item.selectedSize || "",
        };
      });

      // 3. Setup Razorpay options
      const options = {
        key: keyId,
        amount: rzpAmount,
        currency: currency,
        name: "NOVEMBER Menswear",
        description: "Premium Luxury Clothing",
        image: "https://november-menswear.web.app/logo.png", // or local fallback
        order_id: rzpOrderId,
        handler: async function (response) {
          setLoading(true);
          setError("");
          try {
            // Verify payment on backend
            const verifyPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                customerName: formData.fullName,
                customerEmail: formData.email,
                customerPhoto: customerPhoto,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                landmark: formData.landmark,
                items: orderItems,
                amount: totalPrice
              }
            };

            const verificationRes = await axios.post(`${BACKEND}/api/payments/verify`, verifyPayload);
            if (verificationRes.status === 201 || verificationRes.status === 200) {
              const createdOrder = verificationRes.data.order;
              setOrderSuccess(createdOrder);
              clearCart();
            } else {
              setError("Payment verification failed. Please contact customer support.");
            }
          } catch (err) {
            console.error("Payment Verification Error:", err);
            setError(err.response?.data?.message || err.message || "Failed to verify transaction.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#111111", // Luxe brand primary color
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError("Payment cancelled. You can retry when you are ready.");
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", function (response) {
        console.error("Razorpay Payment Failed:", response.error);
        setError(`Payment Failed: ${response.error.description}`);
        setLoading(false);
      });
      rzpInstance.open();
    } catch (err) {
      console.error("Order Creation Error:", err);
      setError(err.response?.data?.message || err.message || "Could not initiate payment. Please try again.");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="checkout-loading" style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#fcfaf7",
        color: "#111",
        letterSpacing: "2px",
        fontWeight: "500",
        fontFamily: "Jost, sans-serif"
      }}>
        <p>AUTHENTICATING...</p>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <>
        <Header />
        <div className="checkout-success-container">
          <div className="success-card">
            <div className="success-icon-wrap">
              <div className="success-glow-effect">
                <CheckCircle2 className="success-icon" size={72} strokeWidth={1.5} />
              </div>
            </div>
            
            <span className="success-subtitle">THANK YOU FOR YOUR PATRONAGE</span>
            <h1 className="success-title">Order Confirmed</h1>
            
            <p className="order-number-text">
              Reference ID: <span className="order-id">{orderSuccess.orderId}</span>
            </p>
            
            <p className="success-message">
              A confirmation email has been dispatched to <strong>{orderSuccess.customerEmail}</strong>. 
              Your bespoke November menswear selections are currently being packaged and will reach your address in 3-5 business days.
            </p>

            {/* Premium Delivery Timeline */}
            <div className="delivery-timeline-container">
              <h4 className="timeline-title">Delivery Status</h4>
              <div className="timeline-steps">
                <div className={`timeline-step ${orderSuccess.status !== "Pending" ? "active" : ""}`}>
                  <div className="step-bullet"></div>
                  <span className="step-label">
                    {orderSuccess.status === "Pending" ? "Pay on Delivery" : "Payment Done"}
                  </span>
                </div>
                <div className="timeline-step active">
                  <div className="step-bullet"></div>
                  <span className="step-label">Order Placed</span>
                </div>
                <div className="timeline-step current">
                  <div className="step-bullet"></div>
                  <span className="step-label">Processing</span>
                </div>
                <div className="timeline-step">
                  <div className="step-bullet"></div>
                  <span className="step-label">Shipped</span>
                </div>
                <div className="timeline-step">
                  <div className="step-bullet"></div>
                  <span className="step-label">Delivered</span>
                </div>
              </div>
            </div>

            {/* Receipt Summary */}
            <div className="success-details-box">
              <h3>Shipment Details</h3>
              <div className="receipt-row">
                <span className="receipt-label">Recipient:</span>
                <span className="receipt-value">{orderSuccess.customerName}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Phone:</span>
                <span className="receipt-value">{orderSuccess.phone}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Shipping To:</span>
                <span className="receipt-value">
                  {orderSuccess.address}, {orderSuccess.city}, {orderSuccess.state} - {orderSuccess.pincode}
                  {orderSuccess.landmark && ` (Landmark: ${orderSuccess.landmark})`}
                </span>
              </div>
              
              <div className="receipt-divider"></div>
              
              <h3>Bespoke Items</h3>
              <div className="receipt-items-list">
                {orderSuccess.items?.map((item, idx) => (
                  <div className="receipt-item-row" key={idx}>
                    <img src={item.front} alt={item.name} className="receipt-item-img" />
                    <div className="receipt-item-details">
                      <span className="receipt-item-name">{item.name}</span>
                      <span className="receipt-item-qty">Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ""}</span>
                    </div>
                    <span className="receipt-item-price">₹{Number(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              
              <div className="receipt-divider"></div>
              
              <div className="receipt-row total-paid-row">
                <span className="receipt-label-bold">Total Paid:</span>
                <span className="receipt-value-bold">₹{Number(orderSuccess.amount).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <Link to="/products" className="continue-shopping-btn">
              Continue Shopping
              <Sparkles size={16} style={{ marginLeft: 8 }} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="checkout-page">
        <div className="checkout-back-nav">
          <Link to="/cart" className="back-to-cart-link">
            <ArrowLeft size={16} />
            <span>Return to Bag</span>
          </Link>
        </div>

        <div className="checkout-grid">
          {/* Left: Shipping Form */}
          <div className="checkout-form-section">
            <div className="section-header">
              <h2>Shipping Details</h2>
              <p>Please enter your delivery information below</p>
            </div>

            {!isAuthenticated && (
              <div className="checkout-login-banner" style={{
                background: "rgba(200, 169, 106, 0.08)",
                border: "1px solid rgba(200, 169, 106, 0.2)",
                borderRadius: "16px",
                padding: "16px 20px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                color: "#111"
              }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Already have an account?</span>{" "}
                  <span style={{ color: "#555" }}>Log in for a faster checkout and order tracking.</span>
                </div>
                <Link to="/login?redirect=checkout" style={{
                  color: "#c8a96a",
                  fontWeight: 600,
                  textDecoration: "none",
                  letterSpacing: "1px",
                  fontSize: "13px",
                  textTransform: "uppercase",
                  transition: "color 0.2s"
                }}>
                  Log In &rarr;
                </Link>
              </div>
            )}

            {error && <div className="checkout-error-banner">{error}</div>}

            <form onSubmit={handleSubmit} className="premium-form">
              {/* SAVED ADDRESS SELECTOR */}
              {isAuthenticated && savedAddresses.length > 0 && (
                <div className="saved-address-selector-group" style={{
                  marginBottom: "28px",
                  background: "#fbfbf9",
                  border: "1px solid #ececec",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  textAlign: "left"
                }}>
                  <label htmlFor="checkout-saved-address" style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#888",
                    display: "block",
                    marginBottom: "8px"
                  }}>
                    Ship to Saved Address
                  </label>
                  <select
                    id="checkout-saved-address"
                    value={selectedAddressId}
                    onChange={(e) => {
                      const addrId = e.target.value;
                      setSelectedAddressId(addrId);
                      if (addrId === "new") {
                        setFormData({
                          fullName: auth.currentUser?.displayName || "",
                          email: auth.currentUser?.email || "",
                          phone: "",
                          address: "",
                          city: "",
                          state: "Tamil Nadu",
                          pincode: "",
                          landmark: "",
                        });
                      } else {
                        const selectedAddr = savedAddresses.find(a => a._id === addrId);
                        if (selectedAddr) {
                          setFormData({
                            fullName: selectedAddr.name,
                            email: auth.currentUser?.email || "",
                            phone: selectedAddr.phone,
                            address: selectedAddr.street,
                            city: selectedAddr.city,
                            state: selectedAddr.state || "Tamil Nadu",
                            pincode: selectedAddr.pincode,
                            landmark: selectedAddr.landmark || "",
                          });
                        }
                      }
                    }}
                    style={{
                      width: "100%",
                      height: "44px",
                      border: "1px solid #ececec",
                      borderRadius: "10px",
                      background: "#ffffff",
                      fontFamily: '"Jost", sans-serif',
                      fontSize: "14.5px",
                      color: "#111",
                      padding: "0 12px",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="new">-- Ship to a New Address --</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr._id} value={addr._id}>
                        {addr.name} - {addr.street}, {addr.city} {addr.isDefault ? "(Default)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="checkout-form-group">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder=" "
                  required
                />
                <label htmlFor="fullName">Full Name</label>
              </div>

              <div className="form-row-2">
                <div className="checkout-form-group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="email">Email Address</label>
                </div>
                <div className="checkout-form-group">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder=" "
                    maxLength={10}
                    required
                  />
                  <label htmlFor="phone">Phone Number</label>
                </div>
              </div>

              <div className="checkout-form-group">
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder=" "
                  required
                />
                <label htmlFor="address">Address (Flat, House No, Building, Street)</label>
              </div>

              <div className="form-row-2">
                <div className="checkout-form-group">
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      height: "52px",
                      border: "none",
                      borderBottom: "1px solid #e5e5e5",
                      background: "transparent",
                      fontFamily: '"Jost", sans-serif',
                      fontSize: "15px",
                      color: "#111",
                      padding: "20px 0 4px 0",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="" disabled style={{ color: "#888" }}>Select District / City</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Tiruchirappalli">Tiruchirappalli</option>
                    <option value="Salem">Salem</option>
                    <option value="Tirunelveli">Tirunelveli</option>
                    <option value="Vellore">Vellore</option>
                    <option value="Erode">Erode</option>
                    <option value="Thoothukudi">Thoothukudi</option>
                    <option value="Thanjavur">Thanjavur</option>
                  </select>
                  {/* Floating label simulation for select */}
                  {formData.city && (
                    <span style={{
                      position: "absolute",
                      left: "0px",
                      top: "0px",
                      fontSize: "11px",
                      fontWeight: "500",
                      color: "#111",
                      textTransform: "uppercase",
                      letterSpacing: "1.5px"
                    }}>
                      City / District
                    </span>
                  )}
                </div>
                <div className="checkout-form-group">
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder=" "
                    required
                    readOnly
                    style={{ color: "#666" }}
                  />
                  <label htmlFor="state">State (Tamil Nadu Only)</label>
                </div>
              </div>

              <div className="form-row-2">
                <div className="checkout-form-group">
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder=" "
                    maxLength={6}
                    required
                  />
                  <label htmlFor="pincode">Pincode (6 digits)</label>
                </div>
                <div className="checkout-form-group">
                  <input
                    type="text"
                    id="landmark"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    placeholder=" "
                  />
                  <label htmlFor="landmark">Landmark (Optional)</label>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="payment-method-selector" style={{ margin: "32px 0" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "#111", letterSpacing: "2px" }}>PAYMENT METHOD</h3>
                <div className="payment-options-grid" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div 
                    className={`payment-option-card ${paymentMethod === "online" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("online")}
                    style={{
                      border: "1px solid",
                      borderColor: paymentMethod === "online" ? "#111" : "#ececec",
                      borderRadius: 16,
                      padding: 18,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      background: paymentMethod === "online" ? "#fbfbfa" : "#fff"
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", border: "2px solid",
                      borderColor: paymentMethod === "online" ? "#111" : "#b0b0b0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s"
                    }}>
                      {paymentMethod === "online" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#111" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#111", fontFamily: "var(--font-sans)" }}>Online Payment (UPI, Cards, Net Banking)</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2, fontFamily: "var(--font-sans)" }}>Pay securely via our Razorpay payment gateway</div>
                    </div>
                    <CreditCard size={18} style={{ color: paymentMethod === "online" ? "#111" : "#888" }} />
                  </div>

                  <div 
                    className={`payment-option-card ${paymentMethod === "cod" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("cod")}
                    style={{
                      border: "1px solid",
                      borderColor: paymentMethod === "cod" ? "#111" : "#ececec",
                      borderRadius: 16,
                      padding: 18,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      background: paymentMethod === "cod" ? "#fbfbfa" : "#fff"
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", border: "2px solid",
                      borderColor: paymentMethod === "cod" ? "#111" : "#b0b0b0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s"
                    }}>
                      {paymentMethod === "cod" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#111" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#111", fontFamily: "var(--font-sans)" }}>Cash on Delivery (COD)</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2, fontFamily: "var(--font-sans)" }}>Pay with cash or UPI scanner upon home delivery</div>
                    </div>
                    <Package size={18} style={{ color: paymentMethod === "cod" ? "#111" : "#888" }} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="payment-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-text">Processing Order...</span>
                ) : (
                  <>
                    <span>{paymentMethod === "online" ? "Continue to Payment" : "Place Order (COD)"}</span>
                    <Lock size={16} />
                  </>
                )}
              </button>

              <div className="security-badges">
                <div className="badge-item">
                  <ShieldCheck size={16} />
                  <span>Secure SSL Checkout</span>
                </div>
                <div className="badge-item">
                  <Truck size={16} />
                  <span>Free Insured Delivery</span>
                </div>
              </div>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-summary-section">
            <div className="summary-card">
              <h2>Order Summary</h2>
              
              <div className="summary-items-list">
                {cart.map((item) => (
                  <div className="summary-item-row" key={item.id}>
                    <div className="item-thumbnail-wrap">
                      <img src={item.front} alt={item.name} />
                      <span className="item-qty-badge">{item.quantity}</span>
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="item-collection">
                        NOVEMBER COLLECTION{item.selectedSize ? ` | Size: ${item.selectedSize}` : ""}
                      </p>
                    </div>
                    <div className="item-price">
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals-box">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span className="free-shipping">FREE</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
