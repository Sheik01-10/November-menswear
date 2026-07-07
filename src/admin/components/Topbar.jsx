import { useState, useEffect, useRef } from "react";
import { Bell, Search, ChevronDown, X, Menu } from "lucide-react";
import { io } from "socket.io-client";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useProducts } from "../../context/ProductContext";

const BACKEND = `http://${window.location.hostname}:5000`;

export default function Topbar({ toggleSidebar, logout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const dropdownRef = useRef(null);

  // States & refs for profile dropdown and global search
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const searchParams = new URLSearchParams(location.search);
  const searchVal = searchParams.get("search") || "";
  const [localSearchVal, setLocalSearchVal] = useState(searchVal);

  useEffect(() => {
    setLocalSearchVal(searchVal);
  }, [searchVal]);

  const [searchData, setSearchData] = useState({ products: [], orders: [], customers: [] });
  const [isSearching, setIsSearching] = useState(false);

  const fetchSearchData = async () => {
    try {
      const [prodRes, orderRes, userRes] = await Promise.all([
        axios.get(`${BACKEND}/api/products`),
        axios.get(`${BACKEND}/api/orders`),
        axios.get(`${BACKEND}/api/users`)
      ]);
      setSearchData({
        products: prodRes.data || [],
        orders: orderRes.data || [],
        customers: userRes.data || []
      });
    } catch (e) {
      console.error("Error fetching admin search data:", e);
    }
  };

  const handleItemClick = (type, value) => {
    setIsSearching(false);
    navigate({
      pathname: `/admin-dashboard/${type}`,
      search: `?search=${encodeURIComponent(value)}`
    });
  };

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifs = localStorage.getItem("admin_notifications");
    const savedUnread = localStorage.getItem("admin_unread_count");
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    }
    if (savedUnread) {
      setUnreadCount(Number(savedUnread));
    }
  }, []);

  // Sync notifications to localStorage
  const updateNotificationsState = (newNotifs, newUnread) => {
    setNotifications(newNotifs);
    setUnreadCount(newUnread);
    localStorage.setItem("admin_notifications", JSON.stringify(newNotifs));
    localStorage.setItem("admin_unread_count", newUnread.toString());
  };

  // Web Audio API dual-tone notification chime
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      // Note 1: E5
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      // Note 2: A5 (offset by 0.08s)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.00, now + 0.08);
      gain2.gain.setValueAtTime(0.12, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.6);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.7);
    } catch (e) {
      console.warn("Sound autoplay prevented or not supported:", e);
    }
  };

  // Socket connection
  useEffect(() => {
    const socket = io(BACKEND);

    socket.on("order_changed", ({ action, data }) => {
      if (action === "create") {
        // Play chime sound
        playChime();

        // Create new notification object
        const newNotif = {
          _id: data._id || Date.now().toString(),
          orderId: data.orderId,
          customerName: data.customerName,
          amount: data.amount,
          date: new Date(),
          read: false
        };

        // Update notifications list
        setNotifications(prev => {
          const updated = [newNotif, ...prev].slice(0, 50); // limit to 50
          localStorage.setItem("admin_notifications", JSON.stringify(updated));
          return updated;
        });

        // Increment unread count
        setUnreadCount(prev => {
          const updated = prev + 1;
          localStorage.setItem("admin_unread_count", updated.toString());
          return updated;
        });

        // Show Toast popup
        setActiveToast(newNotif);
      }
    });

    // Close dropdowns on click outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearching(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      socket.disconnect();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K to focus search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchChange = (e) => {
    setLocalSearchVal(e.target.value);
    setIsSearching(true);
  };

  const handleClearSearch = (e) => {
    e.stopPropagation();
    setLocalSearchVal("");
    setIsSearching(false);
    const currentParams = new URLSearchParams(location.search);
    currentParams.delete("search");
    navigate({ pathname: location.pathname, search: currentParams.toString() });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = localSearchVal.trim();
      const currentParams = new URLSearchParams(location.search);
      
      let targetPath = location.pathname;
      if (!["/admin-dashboard/products", "/admin-dashboard/orders", "/admin-dashboard/customers"].includes(location.pathname)) {
        targetPath = "/admin-dashboard/products";
      }

      if (value) {
        currentParams.set("search", value);
      } else {
        currentParams.delete("search");
      }

      setIsSearching(false);
      navigate({
        pathname: targetPath,
        search: currentParams.toString()
      });
    }
  };

  const handleLogoutClick = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("isAdmin");
      navigate("/admin-login");
    }
  };

  // Auto-hide toast after 6 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        const toastElement = document.querySelector(".order-notification-toast");
        if (toastElement) {
          toastElement.classList.add("fade-out");
          setTimeout(() => setActiveToast(null), 300); // match animation
        } else {
          setActiveToast(null);
        }
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const handleNotificationClick = (notif) => {
    // Mark as read
    const updatedNotifs = notifications.map(n => 
      n._id === notif._id ? { ...n, read: true } : n
    );
    const unreadCountDiff = notif.read ? 0 : 1;
    updateNotificationsState(updatedNotifs, Math.max(0, unreadCount - unreadCountDiff));
    
    setDropdownOpen(false);
    setActiveToast(null);
    navigate("/admin-dashboard/orders");
  };

  const markAllAsRead = () => {
    const updatedNotifs = notifications.map(n => ({ ...n, read: true }));
    updateNotificationsState(updatedNotifs, 0);
  };

  const clearAllNotifications = () => {
    updateNotificationsState([], 0);
  };

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    } catch (e) {
      return "";
    }
  };

  const filteredProducts = (searchData.products || []).filter(p =>
    p.name.toLowerCase().includes(localSearchVal.toLowerCase()) ||
    p.category.toLowerCase().includes(localSearchVal.toLowerCase())
  );

  const filteredOrders = (searchData.orders || []).filter(o =>
    o.orderId?.toLowerCase().includes(localSearchVal.toLowerCase()) ||
    o.customerName?.toLowerCase().includes(localSearchVal.toLowerCase())
  );

  const filteredCustomers = (searchData.customers || []).filter(c =>
    c.name?.toLowerCase().includes(localSearchVal.toLowerCase()) ||
    c.email?.toLowerCase().includes(localSearchVal.toLowerCase())
  );

  return (
    <header className="topbar">
      <div className="topbar-left" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button className="topbar-menu-btn" onClick={toggleSidebar} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <h2>Welcome back, Admin 👋</h2>
      </div>

      <div className="topbar-right">
        <div className="search-box-container" ref={searchContainerRef} style={{ position: "relative" }}>
          <div className="search-box" onClick={() => searchInputRef.current?.focus()} style={{ cursor: "text" }}>
            <Search size={16} color="#888" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for products, orders, customers..."
              value={localSearchVal}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                setIsSearching(true);
                fetchSearchData();
              }}
            />
            {localSearchVal && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", marginRight: "8px", padding: 0 }}
              >
                <X size={14} color="#888" />
              </button>
            )}
            <span className="shortcut">⌘ K</span>
          </div>

          {isSearching && localSearchVal && (
            <div className="admin-search-dropdown">
              <div className="asd-header">
                <span>Search results for "{localSearchVal}"</span>
                <button className="asd-close-btn" onClick={() => setIsSearching(false)}>Close</button>
              </div>
              
              <div className="asd-body">
                {/* PRODUCTS SECTION */}
                {filteredProducts.length > 0 && (
                  <div className="asd-section">
                    <div className="asd-section-title">Products</div>
                    {filteredProducts.slice(0, 3).map(p => (
                      <div key={p._id} className="asd-item" onClick={() => handleItemClick("products", p.name)}>
                        <img src={p.front} alt={p.name} className="asd-item-img" />
                        <div className="asd-item-info">
                          <span className="asd-item-title">{p.name}</span>
                          <span className="asd-item-subtitle">{p.category} • ₹{Number(p.price).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ORDERS SECTION */}
                {filteredOrders.length > 0 && (
                  <div className="asd-section">
                    <div className="asd-section-title">Orders</div>
                    {filteredOrders.slice(0, 3).map(o => (
                      <div key={o._id} className="asd-item" onClick={() => handleItemClick("orders", o.orderId)}>
                        <div className="asd-item-icon">🛍️</div>
                        <div className="asd-item-info">
                          <span className="asd-item-title">Order {o.orderId}</span>
                          <span className="asd-item-subtitle">
                            {o.customerName} • ₹{Number(o.amount).toLocaleString("en-IN")} • <span className={`status-badge-inline ${o.status.toLowerCase()}`}>{o.status}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CUSTOMERS SECTION */}
                {filteredCustomers.length > 0 && (
                  <div className="asd-section">
                    <div className="asd-section-title">Customers</div>
                    {filteredCustomers.slice(0, 3).map(c => (
                      <div key={c._id} className="asd-item" onClick={() => handleItemClick("customers", c.name)}>
                        <img src={c.photo || `https://i.pravatar.cc/100?u=${c.email}`} alt={c.name} className="asd-item-img rounded" />
                        <div className="asd-item-info">
                          <span className="asd-item-title">{c.name}</span>
                          <span className="asd-item-subtitle">{c.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredProducts.length === 0 && filteredOrders.length === 0 && filteredCustomers.length === 0 && (
                  <div className="asd-empty">No matching products, orders, or customers found.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="notification-btn-container" ref={dropdownRef}>
          <button className="notification-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          {dropdownOpen && (
            <div className="notifications-dropdown">
              <div className="nd-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="nd-action-btn">Mark all as read</button>
                )}
              </div>
              <div className="nd-list">
                {notifications.length === 0 ? (
                  <div className="nd-empty">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n._id} 
                      className={`nd-item ${!n.read ? "unread" : ""}`} 
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="nd-icon">🛍️</div>
                      <div className="nd-content">
                        <div className="nd-title">
                          <strong>New Order {n.orderId}</strong>
                          <span className="nd-time">{formatTime(n.date)}</span>
                        </div>
                        <p className="nd-desc">
                          {n.customerName} placed an order for ₹{Number(n.amount).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="nd-footer">
                  <button onClick={clearAllNotifications} className="nd-clear-btn">Clear all</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="profile-dropdown-menu-container" ref={profileDropdownRef}>
          <div className="profile-box" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} style={{ cursor: "pointer", userSelect: "none" }}>
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="Admin"
            />
            <div>
              <h4>Admin</h4>
              <span>Super Admin</span>
            </div>
            <ChevronDown size={16} color="#888" style={{ transform: profileDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </div>

          {profileDropdownOpen && (
            <div className="profile-dropdown-menu">
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f5f5f5", display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>Super Admin</span>
                <span style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>admin@novemberxix.com</span>
              </div>
              <button 
                onClick={() => { setProfileDropdownOpen(false); navigate("/admin-dashboard/settings"); }}
                className="profile-dropdown-item"
              >
                ⚙️ Settings
              </button>
              <button 
                onClick={() => { setProfileDropdownOpen(false); handleLogoutClick(); }}
                className="profile-dropdown-item logout"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slide-in Toast Notification */}
      {activeToast && (
        <div className="order-notification-toast" onClick={() => handleNotificationClick(activeToast)}>
          <button 
            className="toast-close-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setActiveToast(null);
            }}
          >
            <X size={14} />
          </button>
          <div className="toast-icon">🛍️</div>
          <div className="toast-body">
            <span className="toast-tag">New Order Received</span>
            <h4 className="toast-title">Order {activeToast.orderId}</h4>
            <p className="toast-desc">
              {activeToast.customerName} has placed a new order of ₹{Number(activeToast.amount).toLocaleString("en-IN")}.
            </p>
            <span className="toast-footer">Click to view orders list</span>
          </div>
        </div>
      )}
    </header>
  );
}