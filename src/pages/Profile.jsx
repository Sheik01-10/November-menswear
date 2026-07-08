import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import {
  User,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  LogOut,
  Clock,
  Plus,
  Edit,
  Trash2,
  Camera,
  HelpCircle,
  Send,
  Check
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import "./Profile.css";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

function FaqAccordionItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`faq-accordion-item ${isOpen ? "open" : ""}`}>
      <button className="faq-question-btn" type="button" onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="faq-answer-panel">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Tab State
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "profile";
  });

  // Sync tab with URL search parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["profile", "orders", "addresses", "support"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Profile Form State
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address List & Form States
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "Tamil Nadu",
    pincode: "",
    landmark: "",
    isDefault: false
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Help & Support inquiry State
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    subject: "",
    message: ""
  });

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Sync local storage user
        const userData = {
          uid: user.uid,
          name: user.displayName || "Valued Client",
          email: user.email,
          photo: user.photoURL || "/default-avatar.png",
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setCurrentUser(userData);
        fetchUserProfile(user.uid);
        fetchUserOrders(user.email);
      } else {
        localStorage.removeItem("user");
        setCurrentUser(null);
        setAuthLoading(false);
        navigate("/login?redirect=profile");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch complete profile info from backend
  const fetchUserProfile = async (uid) => {
    try {
      const res = await axios.get(`${BACKEND}/api/users/profile/${uid}`);
      setProfileName(res.data.name || "");
      setProfilePhone(res.data.phone || "");
      setProfilePhoto(res.data.photo || "");
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error("Error fetching database profile:", err);
    }
  };

  // Fetch User Orders from Backend
  const fetchUserOrders = async (email) => {
    try {
      setLoadingOrders(true);
      const res = await axios.get(`${BACKEND}/api/orders/user/${email}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching user orders:", err);
    } finally {
      setLoadingOrders(false);
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusClass = (status) => {
    return {
      Completed: "status-completed",
      Processing: "status-processing",
      Shipped: "status-shipped",
      Pending: "status-pending",
      Cancelled: "status-cancelled",
    }[status] || "status-pending";
  };

  // Profile Settings Actions
  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      setIsSavingProfile(true);
      const res = await axios.put(`${BACKEND}/api/users/profile/${currentUser.uid}`, {
        name: profileName,
        phone: profilePhone,
        photo: profilePhoto
      });
      // Sync local storage user
      const updatedLocal = {
        ...currentUser,
        name: res.data.name,
        photo: res.data.photo,
        phone: res.data.phone
      };
      localStorage.setItem("user", JSON.stringify(updatedLocal));
      setCurrentUser(updatedLocal);
      toast.success("Profile details updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile details");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const uploadToast = toast.loading("Uploading photo...");
    try {
      const uploadRes = await axios.post(`${BACKEND}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const imageUrl = uploadRes.data.url;
      setProfilePhoto(imageUrl);

      // Auto update in database
      const res = await axios.put(`${BACKEND}/api/users/profile/${currentUser.uid}`, {
        photo: imageUrl
      });

      // Sync local storage user
      const updatedLocal = {
        ...currentUser,
        photo: imageUrl
      };
      localStorage.setItem("user", JSON.stringify(updatedLocal));
      setCurrentUser(updatedLocal);

      toast.success("Avatar image updated!", { id: uploadToast });
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload avatar", { id: uploadToast });
    }
  };

  // Address Actions
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (
      !addressForm.name.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.street.trim() ||
      !addressForm.city.trim() ||
      !addressForm.pincode.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (addressForm.phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (addressForm.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    try {
      setIsSavingAddress(true);
      let updatedAddresses = [];
      if (editingAddressId) {
        const res = await axios.put(
          `${BACKEND}/api/users/profile/${currentUser.uid}/address/${editingAddressId}`,
          addressForm
        );
        updatedAddresses = res.data;
        toast.success("Address updated successfully");
      } else {
        const res = await axios.post(
          `${BACKEND}/api/users/profile/${currentUser.uid}/address`,
          addressForm
        );
        updatedAddresses = res.data;
        toast.success("Address added successfully");
      }
      setAddresses(updatedAddresses);
      closeAddressForm();
    } catch (err) {
      console.error("Error saving address:", err);
      toast.error("Failed to save address details");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const openAddressFormForEdit = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state || "Tamil Nadu",
      pincode: addr.pincode,
      landmark: addr.landmark || "",
      isDefault: addr.isDefault
    });
    setShowAddressForm(true);
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm({
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "Tamil Nadu",
      pincode: "",
      landmark: "",
      isDefault: false
    });
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await axios.delete(
        `${BACKEND}/api/users/profile/${currentUser.uid}/address/${addressId}`
      );
      setAddresses(res.data);
      toast.success("Address removed");
    } catch (err) {
      console.error("Error deleting address:", err);
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await axios.put(
        `${BACKEND}/api/users/profile/${currentUser.uid}/address/${addressId}/default`
      );
      setAddresses(res.data);
      toast.success("Default address updated");
    } catch (err) {
      console.error("Error setting default address:", err);
      toast.error("Failed to update default address");
    }
  };

  // Inquiry Submission Action
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryForm.subject.trim() || !inquiryForm.message.trim()) {
      toast.error("Please enter a subject and message");
      return;
    }
    setInquiryLoading(true);
    try {
      await axios.post(`${BACKEND}/api/support`, {
        name: profileName || currentUser?.name || "Bespoke Client",
        email: currentUser?.email || "unknown@november.com",
        subject: inquiryForm.subject,
        message: inquiryForm.message
      });
      setInquirySubmitted(true);
      setInquiryForm({ subject: "", message: "" });
      toast.success("Inquiry submitted. We will contact you soon.");
    } catch (err) {
      console.error("Error submitting support inquiry:", err);
      toast.error("Failed to submit support request. Please try again.");
    } finally {
      setInquiryLoading(false);
    }
  };

  if (authLoading) {
    return (
      <>
        <Header />
        <div className="profile-loading-container">
          <div className="profile-spinner"></div>
          <p>Verifying Credentials...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <BackButton />
      </div>
      <Header />
      <div className="profile-page-wrapper">
        <div className="profile-container">
          {/* Left Column: Account Navigation Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar-section">
                <div className="profile-avatar-ring">
                  <img
                    src={profilePhoto || currentUser?.photo || "/default-avatar.png"}
                    alt={currentUser?.name}
                    className="profile-display-photo"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                </div>
                <h2>{profileName || currentUser?.name}</h2>
                <span className="client-tier-badge">November Patron</span>
              </div>

              {/* Navigation Menu */}
              <div className="profile-nav-menu">
                <button
                  type="button"
                  className={`nav-menu-item ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("profile");
                    closeAddressForm();
                  }}
                >
                  <User size={16} />
                  <span>Profile Settings</span>
                </button>
                <button
                  type="button"
                  className={`nav-menu-item ${activeTab === "orders" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("orders");
                    closeAddressForm();
                  }}
                >
                  <ShoppingBag size={16} />
                  <span>Order History</span>
                </button>
                <button
                  type="button"
                  className={`nav-menu-item ${activeTab === "addresses" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("addresses");
                    closeAddressForm();
                  }}
                >
                  <MapPin size={16} />
                  <span>Saved Addresses</span>
                </button>
                <button
                  type="button"
                  className={`nav-menu-item ${activeTab === "support" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("support");
                    closeAddressForm();
                  }}
                >
                  <HelpCircle size={16} />
                  <span>Help & Support</span>
                </button>
              </div>

              <button className="profile-logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right Column: Active Content Tab */}
          <div className="profile-main-content">
            
            {/* PROFILE SETTINGS TAB */}
            {activeTab === "profile" && (
              <div className="profile-settings-section">
                <div className="section-header">
                  <h1>Profile Settings</h1>
                  <p>Manage your account details and profile picture</p>
                </div>

                <div className="settings-card">
                  <div className="settings-avatar-edit-box">
                    <div className="settings-avatar-wrapper">
                      <img
                        src={profilePhoto || "/default-avatar.png"}
                        alt="Profile Avatar"
                        className="settings-display-photo"
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                      <label htmlFor="avatar-file-input" className="avatar-upload-trigger" title="Upload New Photo">
                        <Camera size={14} />
                        <input
                          type="file"
                          id="avatar-file-input"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                    <div className="avatar-info">
                      <h3>Your Profile Avatar</h3>
                      <p>Accepts PNG, JPG or JPEG. Max size 5MB.</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfileSubmit} className="settings-form">
                    <div className="settings-form-group">
                      <label htmlFor="settings-name">Full Name</label>
                      <input
                        type="text"
                        id="settings-name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="E.g. Abbas"
                        required
                      />
                    </div>

                    <div className="settings-form-row">
                      <div className="settings-form-group">
                        <label htmlFor="settings-email">Email Address</label>
                        <input
                          type="email"
                          id="settings-email"
                          value={currentUser?.email || ""}
                          disabled
                          placeholder="Your email address"
                        />
                        <span className="field-hint">Email address cannot be changed.</span>
                      </div>

                      <div className="settings-form-group">
                        <label htmlFor="settings-phone">Phone Number</label>
                        <input
                          type="tel"
                          id="settings-phone"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="E.g. 7604801743"
                          maxLength={10}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="settings-save-btn"
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? "Saving Changes..." : "Save Profile Details"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ORDER HISTORY TAB */}
            {activeTab === "orders" && (
              <>
                <div className="order-history-header">
                  <h1>Order History</h1>
                  <p>View and track your bespoke November menswear selections</p>
                </div>

                {loadingOrders ? (
                  <div className="orders-loading">
                    <div className="orders-spinner"></div>
                    <p>Retrieving your order history...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="empty-orders-view">
                    <ShoppingBag size={48} strokeWidth={1.2} />
                    <h3>No Orders Placed Yet</h3>
                    <p>Explore our latest luxury menswear collection and place your first order.</p>
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
                          {/* Order Header / Summary Info */}
                          <div className="order-card-header" onClick={() => toggleOrderExpand(order._id)}>
                            <div className="order-header-main">
                              <div className="order-id-date">
                                <span className="order-number">{order.orderId}</span>
                                <span className="order-date-text">Placed on {orderDate}</span>
                              </div>
                              <span className={`order-status-pill ${getStatusClass(order.status)}`}>
                                {order.status}
                              </span>
                            </div>

                            <div className="order-header-totals">
                              <div className="order-amount-summary">
                                <span className="amount-label">Total</span>
                                <span className="amount-val">₹{Number(order.amount).toLocaleString("en-IN")}</span>
                              </div>
                              <button className="expand-toggle-icon" type="button">
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </button>
                            </div>
                          </div>

                          {/* Expandable Order Details Block */}
                          {isExpanded && (
                            <div className="order-card-details">
                              <div className="details-grid">
                                {/* Shipping Details */}
                                <div className="details-shipping-box">
                                  <h4>Shipping Address</h4>
                                  <div className="shipping-info-details">
                                    <p className="recipient-name"><strong>{order.customerName}</strong></p>
                                    <p>{order.address}</p>
                                    <p>{order.city}, {order.state} - {order.pincode}</p>
                                    {order.landmark && <p className="landmark-text">Landmark: {order.landmark}</p>}
                                    <p className="phone-text">Phone: {order.phone}</p>
                                  </div>
                                </div>

                                {/* Payment Summary */}
                                <div className="details-payment-box">
                                  <h4>Payment Information</h4>
                                  <div className="payment-receipt-summary">
                                    <div className="payment-receipt-row">
                                      <span>Subtotal</span>
                                      <span>₹{Number(order.amount).toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="payment-receipt-row">
                                      <span>Shipping</span>
                                      <span className="free-badge">FREE</span>
                                    </div>
                                    <div className="payment-receipt-row grand-total-row">
                                      <span>Total Paid</span>
                                      <span>₹{Number(order.amount).toLocaleString("en-IN")}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Ordered Items List */}
                              <div className="details-items-section">
                                <h4>Ordered Items ({order.items?.length})</h4>
                                <div className="details-items-list">
                                  {order.items?.map((item, idx) => (
                                    <div className="details-item-row" key={idx}>
                                      <img
                                        src={item.front}
                                        alt={item.name}
                                        className="details-item-img"
                                        onError={(e) => {
                                          e.target.src = "/default-avatar.png";
                                        }}
                                      />
                                      <div className="details-item-main">
                                        <h5>{item.name}</h5>
                                        <span>Quantity: {item.quantity} {item.size ? `| Size: ${item.size}` : ""}</span>
                                      </div>
                                      <div className="details-item-price">
                                        ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* SAVED ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="profile-addresses-section">
                <div className="section-header-row">
                  <div className="section-header">
                    <h1>My Address Book</h1>
                    <p>Manage shipping locations for a seamless checkout experience</p>
                  </div>
                  {!showAddressForm && (
                    <button
                      type="button"
                      className="add-address-trigger-btn"
                      onClick={() => {
                        setEditingAddressId(null);
                        setShowAddressForm(true);
                      }}
                    >
                      <Plus size={16} />
                      <span>Add New Address</span>
                    </button>
                  )}
                </div>

                {showAddressForm ? (
                  <div className="address-form-container">
                    <h3>{editingAddressId ? "Modify Address" : "Add New Address"}</h3>
                    <form onSubmit={handleAddressSubmit} className="address-form">
                      <div className="address-form-row">
                        <div className="address-form-group">
                          <label>Recipient Name *</label>
                          <input
                            type="text"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                            placeholder="Full name of recipient"
                            required
                          />
                        </div>
                        <div className="address-form-group">
                          <label>Contact Number *</label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, "") })}
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            required
                          />
                        </div>
                      </div>

                      <div className="address-form-group">
                        <label>Street Address *</label>
                        <input
                          type="text"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          placeholder="Flat, House no., Building, Company, Apartment, Street"
                          required
                        />
                      </div>

                      <div className="address-form-row">
                        <div className="address-form-group">
                          <label>City / District *</label>
                          <select
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            required
                          >
                            <option value="" disabled>Select District</option>
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
                        </div>
                        <div className="address-form-group">
                          <label>State</label>
                          <input
                            type="text"
                            value={addressForm.state}
                            readOnly
                            style={{ color: "#666", background: "#f9f9f9" }}
                          />
                        </div>
                      </div>

                      <div className="address-form-row">
                        <div className="address-form-group">
                          <label>Pincode *</label>
                          <input
                            type="text"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "") })}
                            placeholder="6-digit pincode"
                            maxLength={6}
                            required
                          />
                        </div>
                        <div className="address-form-group">
                          <label>Landmark (Optional)</label>
                          <input
                            type="text"
                            value={addressForm.landmark}
                            onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                            placeholder="Nearby landmark"
                          />
                        </div>
                      </div>

                      <div className="address-form-checkbox-row">
                        <label className="checkbox-container">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          />
                          <span className="checkmark"></span>
                          <span>Set as default shipping address</span>
                        </label>
                      </div>

                      <div className="address-form-actions">
                        <button
                          type="button"
                          className="address-cancel-btn"
                          onClick={closeAddressForm}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="address-save-btn"
                          disabled={isSavingAddress}
                        >
                          {isSavingAddress ? "Saving..." : "Save Address"}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="empty-addresses-view">
                    <MapPin size={48} strokeWidth={1.2} />
                    <h3>No Saved Addresses</h3>
                    <p>Save shipping addresses to speed up your checkout process next time.</p>
                    <button
                      type="button"
                      className="add-address-btn"
                      onClick={() => setShowAddressForm(true)}
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="addresses-list-grid">
                    {addresses.map((addr) => (
                      <div key={addr._id} className={`address-card ${addr.isDefault ? "default-address" : ""}`}>
                        {addr.isDefault && (
                          <span className="default-badge">
                            <Check size={10} style={{ marginRight: 4 }} />
                            Default
                          </span>
                        )}
                        <div className="address-card-header">
                          <h4>{addr.name}</h4>
                        </div>
                        <div className="address-card-body">
                          <p className="address-text">{addr.street}</p>
                          <p className="address-city-state">{addr.city}, {addr.state} - {addr.pincode}</p>
                          {addr.landmark && <p className="address-landmark">Landmark: {addr.landmark}</p>}
                          <p className="address-phone"><Phone size={12} style={{ marginRight: 6 }} />{addr.phone}</p>
                        </div>
                        <div className="address-card-footer">
                          {!addr.isDefault ? (
                            <button
                              type="button"
                              className="set-default-btn"
                              onClick={() => handleSetDefaultAddress(addr._id)}
                            >
                              Set Default
                            </button>
                          ) : (
                            <span className="default-indicator-text">Active Shipping Address</span>
                          )}
                          <div className="address-action-buttons">
                            <button
                              type="button"
                              className="address-edit-btn"
                              onClick={() => openAddressFormForEdit(addr)}
                              title="Edit Address"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              className="address-delete-btn"
                              onClick={() => handleDeleteAddress(addr._id)}
                              title="Delete Address"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* HELP & SUPPORT TAB */}
            {activeTab === "support" && (
              <div className="profile-support-section">
                <div className="section-header">
                  <h1>Help & Support</h1>
                  <p>Get in touch with November support or browse frequently asked questions</p>
                </div>

                <div className="support-grid">
                  {/* FAQs Accordion */}
                  <div className="support-faqs">
                    <h3>Frequently Asked Questions</h3>
                    <div className="faqs-accordion-list">
                      <FaqAccordionItem
                        question="How do I track my order?"
                        answer="You can view your order status and details directly in the 'Order History' tab of your profile. A unique reference ID is generated for every order, and status is updated from Processing to Delivered."
                      />
                      <FaqAccordionItem
                        question="What is the shipping policy?"
                        answer="We offer complimentary premium delivery for all orders across Tamil Nadu. Your bespoke selections are dispatched within 24-48 hours and generally reach your address in 3-5 business days."
                      />
                      <FaqAccordionItem
                        question="Do you support customization or resizing?"
                        answer="Yes, November offers bespoke fitting and alterations at our boutique in Erode. You can visit us with your order details for a complimentary adjustment."
                      />
                      <FaqAccordionItem
                        question="What payment options do you support?"
                        answer="We support all major online payment methods (UPI, cards, net banking) via our secure gateway, and Cash on Delivery (COD)."
                      />
                    </div>
                  </div>

                  {/* Boutique Info and Contact Form */}
                  <div className="support-contact-side">
                    <div className="boutique-info-card">
                      <h4>November</h4>
                      <p className="boutique-address">
                        291, Gandhiji Road, <br />
                        Surampattivalasu, Erode, <br />
                        Tamil Nadu - 638001
                      </p>
                      <div className="boutique-contact-details">
                        <p><Phone size={14} /> +91 76048 01743</p>
                        <p><Mail size={14} /> www.novemberxix@gmail.com</p>
                        <p><Clock size={14} /> Mon - Sun: 10:00 AM - 9:00 PM</p>
                      </div>
                    </div>

                    <div className="support-message-card">
                      <h4>Send us a Message</h4>
                      {inquirySubmitted ? (
                        <div className="inquiry-success-view">
                          <Check size={32} className="success-check-icon" />
                          <h5>Message Sent</h5>
                          <p>Thank you for reaching out. A November representative will get back to you shortly.</p>
                          <button
                            type="button"
                            className="reset-inquiry-btn"
                            onClick={() => setInquirySubmitted(false)}
                          >
                            Send another message
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleInquirySubmit} className="inquiry-form">
                          <div className="inquiry-form-group">
                            <label htmlFor="support-subject">Subject</label>
                            <input
                              type="text"
                              id="support-subject"
                              value={inquiryForm.subject}
                              onChange={(e) => setInquiryForm({ ...inquiryForm, subject: e.target.value })}
                              placeholder="E.g. Bespoke fitting request, Delivery issue"
                              required
                            />
                          </div>
                          <div className="inquiry-form-group">
                            <label htmlFor="support-message">Message</label>
                            <textarea
                              id="support-message"
                              value={inquiryForm.message}
                              onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                              placeholder="Describe your inquiry in detail..."
                              rows={4}
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            className="submit-inquiry-btn"
                            disabled={inquiryLoading}
                          >
                            {inquiryLoading ? "Sending Message..." : "Submit Message"}
                            <Send size={12} style={{ marginLeft: 6 }} />
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
