import { useState, useEffect } from "react";
import axios from "axios";
import {
  Boxes, RefreshCw, Download, Search, Filter, ArrowUpDown,
  Plus, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  History, LayoutGrid, DollarSign, Layers, ArrowRightLeft, X, Edit, Trash2
} from "lucide-react";
import { io } from "socket.io-client";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export default function StockDetails() {
  // Tab states: "inventory" or "movements"
  const [activeTab, setActiveTab] = useState("inventory");

  // Summary states
  const [summary, setSummary] = useState({
    totalStock: 0,
    stockAdded: 0,
    totalSold: 0,
    availableBalance: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalStockValue: 0
  });

  // Inventory Table states
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  
  // Search / Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Movements History states
  const [movements, setMovements] = useState([]);
  const [totalMovements, setTotalMovements] = useState(0);
  const [movementsPages, setMovementsPages] = useState(1);
  const [movementsPage, setMovementsPage] = useState(1);
  const [movementSearch, setMovementSearch] = useState("");
  const [movementType, setMovementType] = useState("all");

  // Loading & Error States
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Expandable Row State (ProductId)
  const [expandedProductIds, setExpandedProductIds] = useState({});

  // Quick Adjust Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    productId: "",
    productName: "",
    sizes: [],
    size: "",
    quantity: "",
    type: "Stock Added",
    reason: "",
    updatedBy: "Admin"
  });
  const [adjustSaving, setAdjustSaving] = useState(false);

  // Categories list
  const [categories, setCategories] = useState([]);

  // Fetch summary metrics
  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await axios.get(`${BACKEND}/api/stock/summary`);
      setSummary(res.data);
    } catch (e) {
      console.error("Failed to fetch stock summary:", e);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Fetch products inventory
  const fetchInventory = async () => {
    try {
      setLoadingInventory(true);
      const res = await axios.get(`${BACKEND}/api/stock/products`, {
        params: {
          search,
          category,
          status: statusFilter,
          sortBy,
          order: sortOrder,
          page: currentPage,
          limit
        }
      });
      setProducts(res.data.products);
      setTotalProducts(res.data.totalProducts);
      setTotalPages(res.data.totalPages);
    } catch (e) {
      console.error("Failed to fetch inventory:", e);
    } finally {
      setLoadingInventory(false);
    }
  };

  // Fetch stock movements
  const fetchMovements = async () => {
    try {
      setLoadingMovements(true);
      const res = await axios.get(`${BACKEND}/api/stock/movements`, {
        params: {
          search: movementSearch,
          type: movementType,
          page: movementsPage,
          limit: 10
        }
      });
      setMovements(res.data.movements);
      setTotalMovements(res.data.totalMovements);
      setMovementsPages(res.data.totalPages);
    } catch (e) {
      console.error("Failed to fetch movements history:", e);
    } finally {
      setLoadingMovements(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/categories`);
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSummary();
    fetchCategories();
  }, []);

  // Update lists based on search, filters, pagination
  useEffect(() => {
    if (activeTab === "inventory") {
      fetchInventory();
    } else {
      fetchMovements();
    }
  }, [activeTab, search, category, statusFilter, sortBy, sortOrder, currentPage, movementSearch, movementType, movementsPage]);

  // Real-time WebSocket connection
  useEffect(() => {
    const socket = io(BACKEND);
    
    // Listen for product changes to refresh details
    socket.on("product_changed", () => {
      fetchSummary();
      if (activeTab === "inventory") fetchInventory();
    });

    // Listen for manual adjustments
    socket.on("stock_changed", () => {
      fetchSummary();
      if (activeTab === "inventory") fetchInventory();
      if (activeTab === "movements") fetchMovements();
    });

    // Listen for order status changes
    socket.on("order_changed", () => {
      fetchSummary();
      if (activeTab === "inventory") fetchInventory();
      if (activeTab === "movements") fetchMovements();
    });

    return () => socket.disconnect();
  }, [activeTab, currentPage, movementsPage, search, category, statusFilter, sortBy, sortOrder, movementSearch, movementType]);

  // Refresh Inventory Data
  const handleRefreshData = async () => {
    try {
      setRefreshing(true);
      await axios.post(`${BACKEND}/api/stock/refresh`);
      await Promise.all([fetchSummary(), fetchInventory(), fetchMovements()]);
    } catch (e) {
      console.error("Failed to refresh stock calculations:", e);
      alert("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  // Toggle Row Expansion
  const toggleRow = (id) => {
    setExpandedProductIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Open Adjust Modal
  const openAdjust = (prod) => {
    setAdjustForm({
      productId: prod._id,
      productName: prod.name,
      sizes: prod.sizes || [],
      size: prod.sizes && prod.sizes.length > 0 ? prod.sizes[0] : "",
      quantity: "",
      type: "Stock Added",
      reason: "",
      updatedBy: sessionStorage.getItem("staffEmail") || "Admin"
    });
    setAdjustModalOpen(true);
  };

  // Save Adjustment
  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustForm.productId || !adjustForm.quantity) {
      alert("Missing required fields");
      return;
    }
    
    setAdjustSaving(true);
    try {
      await axios.post(`${BACKEND}/api/stock/adjust`, {
        productId: adjustForm.productId,
        size: adjustForm.sizes.length > 0 ? adjustForm.size : "",
        quantity: Number(adjustForm.quantity),
        type: adjustForm.type,
        reason: adjustForm.reason,
        updatedBy: adjustForm.updatedBy
      });
      setAdjustModalOpen(false);
      fetchSummary();
      fetchInventory();
      if (activeTab === "movements") fetchMovements();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to adjust stock");
    } finally {
      setAdjustSaving(false);
    }
  };

  // Delete Stock Movement log entry
  const handleDeleteMovement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock movement log? This will also revert the stock levels for the associated product.")) {
      return;
    }
    
    try {
      await axios.delete(`${BACKEND}/api/stock/movements/${id}`);
      await Promise.all([fetchSummary(), fetchInventory(), fetchMovements()]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete stock movement");
    }
  };

  // Client-Side CSV Exporter
  const handleExportCSV = async () => {
    try {
      // Fetch all products without pagination for the export
      const res = await axios.get(`${BACKEND}/api/stock/products`, {
        params: { limit: 1000 }
      });
      const exportProducts = res.data.products;
      
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Product Name,SKU,Category,Initial Stock,Stock Added,Total Sold,Balance Stock,Price (INR),Stock Value (INR),Stock Status,Last Updated\n";
      
      exportProducts.forEach((p) => {
        const name = `"${p.name.replace(/"/g, '""')}"`;
        const sku = p.sku || "N/A";
        const category = p.category;
        const initial = p.initialStock || 0;
        const added = p.stockAdded || 0;
        const sold = p.totalSold || 0;
        const balance = p.stockQuantity || 0;
        const price = p.price;
        const val = p.stockValue || 0;
        const status = p.stockStatus;
        const updated = new Date(p.updatedAt).toLocaleDateString();
        
        csvContent += `${name},${sku},${category},${initial},${added},${sold},${balance},${price},${val},${status},${updated}\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `November_Stock_Report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("Failed to export report.");
    }
  };

  // Helper colors for status badges
  const getStatusStyle = (status) => {
    if (status === "Out of Stock") {
      return { background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5" };
    }
    if (status === "Low Stock") {
      return { background: "#fef3c7", color: "#d97706", border: "1px solid #fcd34d" };
    }
    return { background: "#dcfce7", color: "#16a34a", border: "1px solid #86efac" };
  };

  // Helper colors for movement types
  const getMovementTypeBadge = (type) => {
    let color = "#555";
    let bg = "#f5f5f5";
    if (type === "Stock Added") { color = "#16a34a"; bg = "#dcfce7"; }
    else if (type === "Stock Sold") { color = "#2563eb"; bg = "#dbeafe"; }
    else if (type === "Stock Adjustment") { color = "#9333ea"; bg = "#f3e8ff"; }
    else if (type === "Stock Cancelled") { color = "#dc2626"; bg = "#fee2e2"; }
    else if (type === "Stock Returned") { color = "#d97706"; bg = "#fef3c7"; }
    return (
      <span style={{
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        background: bg,
        color: color
      }}>
        {type}
      </span>
    );
  };

  return (
    <div className="admin-page-content" style={{ width: "100%", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Header */}
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: "32px", letterSpacing: "-0.5px", color: "var(--black)" }}>Stock Details</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>Real-time inventory statistics, valuation and movements.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            className="btn-secondary" 
            onClick={handleRefreshData} 
            disabled={refreshing}
            style={{ display: "flex", alignItems: "center", gap: "8px", height: "46px", padding: "0 18px", border: "1px solid #111", background: "none", color: "#111", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
          >
            <RefreshCw size={16} className={refreshing ? "spin-animation" : ""} />
            {refreshing ? "Re-syncing..." : "Refresh Inventory"}
          </button>
          <button 
            className="btn-primary" 
            onClick={handleExportCSV}
            style={{ display: "flex", alignItems: "center", gap: "8px", height: "46px", padding: "0 18px", background: "#111", color: "#fff", border: "none", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
          >
            <Download size={16} />
            Export CSV Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "20px", marginBottom: "36px" }}>
        {[
          { label: "Total Stock In", value: summary.totalStock, icon: <Boxes size={20} color="#111" />, bg: "#fff" },
          { label: "Stock Added", value: summary.stockAdded, icon: <Layers size={20} color="#16a34a" />, bg: "#fff" },
          { label: "Total Sold", value: summary.totalSold, icon: <ArrowRightLeft size={20} color="#2563eb" />, bg: "#fff" },
          { label: "Available Balance", value: summary.availableBalance, icon: <CheckCircle2 size={20} color="#111" />, bg: "#fcfaf7", border: "1px solid #e8d197" },
          { label: "Low Stock Items", value: summary.lowStockCount, icon: <AlertTriangle size={20} color="#d97706" />, bg: "#fff" },
          { label: "Out of Stock Items", value: summary.outOfStockCount, icon: <X size={20} color="#dc2626" />, bg: "#fff" },
          { label: "Total Stock Value", value: `₹${(summary.totalStockValue || 0).toLocaleString()}`, icon: <DollarSign size={20} color="#a38144" />, bg: "#111", color: "#fff" },
        ].map((c, i) => (
          <div key={i} style={{ 
            background: c.bg,
            color: c.color || "#111",
            padding: "24px",
            borderRadius: "20px",
            boxShadow: "var(--shadow-sm)",
            border: c.border || "1px solid #ececec",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "140px",
            position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: c.color ? "rgba(255,255,255,0.7)" : "var(--text-secondary)" }}>{c.label}</span>
              <div style={{ padding: "8px", background: c.color ? "rgba(255,255,255,0.1)" : "#f8f8f8", borderRadius: "10px" }}>{c.icon}</div>
            </div>
            {loadingSummary ? (
              <span style={{ fontSize: "14px", fontStyle: "italic", opacity: 0.7 }}>Loading...</span>
            ) : (
              <h2 style={{ fontSize: "28px", fontWeight: 700, margin: 0, fontFamily: "var(--font-sans)", letterSpacing: "-0.5px" }}>{c.value}</h2>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button 
          onClick={() => setActiveTab("inventory")}
          style={{
            padding: "12px 24px",
            border: "none",
            background: "none",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            borderBottom: activeTab === "inventory" ? "2px solid #111" : "2px solid transparent",
            color: activeTab === "inventory" ? "#111" : "var(--text-secondary)",
            transition: "all 0.2s"
          }}
        >
          Inventory Catalog
        </button>
        <button 
          onClick={() => setActiveTab("movements")}
          style={{
            padding: "12px 24px",
            border: "none",
            background: "none",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            borderBottom: activeTab === "movements" ? "2px solid #111" : "2px solid transparent",
            color: activeTab === "movements" ? "#111" : "var(--text-secondary)",
            transition: "all 0.2s"
          }}
        >
          Stock Movements Log
        </button>
      </div>

      {activeTab === "inventory" ? (
        /* Inventory Catalog View */
        <div className="table-panel" style={{ border: "1px solid #ececec", borderRadius: "24px", overflow: "hidden", background: "#fff", boxShadow: "var(--shadow-sm)" }}>
          {/* Toolbar */}
          <div className="table-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #ececec", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "300px", maxWidth: "600px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={16} color="#888" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                <input 
                  type="text" 
                  placeholder="Search products by name or SKU..." 
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  style={{ width: "100%", height: "42px", paddingLeft: "42px", paddingRight: "16px", borderRadius: "10px", border: "1px solid #ddd", outline: "none", fontSize: "14px" }}
                />
              </div>
              
              <select 
                value={category}
                onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
                style={{ height: "42px", padding: "0 12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", background: "#fff", minWidth: "130px" }}
              >
                <option value="all">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat.label.toLowerCase()}>{cat.label}</option>
                ))}
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                style={{ height: "42px", padding: "0 12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", background: "#fff", minWidth: "140px" }}
              >
                <option value="">All Stock Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Sort By:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ height: "38px", padding: "0 10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px" }}
              >
                <option value="name">Product Name</option>
                <option value="stockQuantity">Available Stock</option>
                <option value="sales">Sales (Sold)</option>
                <option value="price">Price</option>
                <option value="initialStock">Initial Stock</option>
                <option value="stockAdded">Stock Added</option>
              </select>
              <button 
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                style={{ height: "38px", width: "38px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ddd", borderRadius: "8px", background: "#fff", cursor: "pointer" }}
                title="Toggle sort direction"
              >
                <ArrowUpDown size={15} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #ececec" }}>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", width: "40px" }}></th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Product</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>SKU</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Category</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "center" }}>Initial</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "center" }}>Added</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "center" }}>Sold</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "center" }}>Balance</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Price</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Stock Value</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Updated</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingInventory ? (
                  <tr>
                    <td colSpan="13" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                      <RefreshCw size={24} className="spin-animation" style={{ display: "inline-block", marginRight: "10px" }} />
                      Loading inventory records...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="13" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                      No inventory matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const isExpanded = !!expandedProductIds[p._id];
                    const isClothing = p.sizes && p.sizes.length > 0;
                    return (
                      <>
                        <tr key={p._id} style={{ borderBottom: "1px solid #f1f1f1", verticalAlign: "middle", transition: "background-color 0.2s" }} className="table-row-hover">
                          <td style={{ padding: "12px 24px", textAlign: "center" }}>
                            {isClothing ? (
                              <button 
                                onClick={() => toggleRow(p._id)}
                                style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}
                              >
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </button>
                            ) : null}
                          </td>
                          <td style={{ padding: "12px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <img 
                                src={p.front} 
                                alt={p.name} 
                                style={{ width: "42px", height: "52px", borderRadius: "6px", objectFit: "cover", border: "1px solid #ececec" }} 
                              />
                              <span style={{ fontWeight: "600", color: "#111" }}>{p.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 24px", fontFamily: "monospace", color: "#555" }}>{p.sku || "N/A"}</td>
                          <td style={{ padding: "12px 24px", textTransform: "capitalize", color: "#666" }}>{p.category}</td>
                          <td style={{ padding: "12px 24px", textAlign: "center", fontWeight: "500" }}>{p.initialStock || 0}</td>
                          <td style={{ padding: "12px 24px", textAlign: "center", color: "#16a34a", fontWeight: "500" }}>{p.stockAdded || 0}</td>
                          <td style={{ padding: "12px 24px", textAlign: "center", color: "#2563eb", fontWeight: "500" }}>{p.totalSold || 0}</td>
                          <td style={{ padding: "12px 24px", textAlign: "center", fontWeight: "700", color: p.stockQuantity === 0 ? "#dc2626" : "#111" }}>{p.stockQuantity}</td>
                          <td style={{ padding: "12px 24px" }}>₹{p.price.toLocaleString()}</td>
                          <td style={{ padding: "12px 24px", fontWeight: "600" }}>₹{(p.stockValue || 0).toLocaleString()}</td>
                          <td style={{ padding: "12px 24px" }}>
                            <span style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "600",
                              ...getStatusStyle(p.stockStatus)
                            }}>
                              {p.stockStatus}
                            </span>
                          </td>
                          <td style={{ padding: "12px 24px", color: "var(--text-muted)", fontSize: "12px" }}>
                            {new Date(p.updatedAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "12px 24px", textAlign: "right" }}>
                            <button 
                              onClick={() => openAdjust(p)}
                              style={{ padding: "6px 12px", background: "#f8f8f8", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#111", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            >
                              <Plus size={14} /> Adjust Stock
                            </button>
                          </td>
                        </tr>
                        {/* Nested Size Row */}
                        {isExpanded && isClothing && (
                          <tr key={`${p._id}-expanded`} style={{ background: "#fafafb" }}>
                            <td colSpan="13" style={{ padding: "16px 40px", borderBottom: "1px solid #ececec" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#111", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <Layers size={14} color="#a38144" />
                                  Size-wise Stock Allocation:
                                </span>
                                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "6px" }}>
                                  {p.sizesStock && p.sizesStock.length > 0 ? (
                                    p.sizesStock.map((ss, idx) => (
                                      <div key={idx} style={{
                                        background: "#fff",
                                        border: "1px solid #ececec",
                                        borderRadius: "12px",
                                        padding: "12px 18px",
                                        minWidth: "110px",
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center"
                                      }}>
                                        <span style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>Size {ss.size}</span>
                                        <span style={{ fontSize: "20px", fontWeight: "800", marginTop: "4px", color: ss.balance === 0 ? "#dc2626" : "#111" }}>{ss.balance}</span>
                                        <span style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>Init: {ss.initial} | Add: {ss.added}</span>
                                      </div>
                                    ))
                                  ) : (
                                    // Fallback if size array exists but sizesStock details are not migrated yet
                                    p.sizes.map((sz, idx) => (
                                      <div key={idx} style={{
                                        background: "#fff",
                                        border: "1px solid #ececec",
                                        borderRadius: "12px",
                                        padding: "12px 18px",
                                        minWidth: "110px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center"
                                      }}>
                                        <span style={{ fontSize: "14px", fontWeight: "700" }}>Size {sz}</span>
                                        <span style={{ fontSize: "20px", fontWeight: "800", marginTop: "4px" }}>N/A</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: "1px solid #ececec" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Showing page {currentPage} of {totalPages} ({totalProducts} total products)
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  style={{ padding: "6px 12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  Previous
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  style={{ padding: "6px 12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Movements Log View */
        <div className="table-panel" style={{ border: "1px solid #ececec", borderRadius: "24px", overflow: "hidden", background: "#fff", boxShadow: "var(--shadow-sm)" }}>
          {/* Toolbar */}
          <div className="table-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #ececec", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "300px", maxWidth: "600px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={16} color="#888" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                <input 
                  type="text" 
                  placeholder="Search by product name, SKU or reason..." 
                  value={movementSearch}
                  onChange={(e) => { setMovementSearch(e.target.value); setMovementsPage(1); }}
                  style={{ width: "100%", height: "42px", paddingLeft: "42px", paddingRight: "16px", borderRadius: "10px", border: "1px solid #ddd", outline: "none", fontSize: "14px" }}
                />
              </div>
              
              <select 
                value={movementType}
                onChange={(e) => { setMovementType(e.target.value); setMovementsPage(1); }}
                style={{ height: "42px", padding: "0 12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", background: "#fff", minWidth: "150px" }}
              >
                <option value="all">All Movement Types</option>
                <option value="Stock Added">Stock Added</option>
                <option value="Stock Sold">Stock Sold</option>
                <option value="Stock Adjustment">Stock Adjustment</option>
                <option value="Stock Returned">Stock Returned</option>
                <option value="Stock Cancelled">Stock Cancelled</option>
              </select>
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              <strong>{totalMovements}</strong> movement transactions logged
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #ececec" }}>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Date</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Product</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>SKU</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Size</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Type</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "center" }}>Qty</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "center" }}>Prev Stock</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "center" }}>Updated Stock</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Reason</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Updated By</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingMovements ? (
                  <tr>
                    <td colSpan="11" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                      <RefreshCw size={24} className="spin-animation" style={{ display: "inline-block", marginRight: "10px" }} />
                      Loading movements history...
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                      No stock movement history found.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m._id} style={{ borderBottom: "1px solid #f1f1f1" }}>
                      <td style={{ padding: "14px 24px", color: "#666" }}>
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: "14px 24px", fontWeight: "600", color: "#111" }}>{m.productName}</td>
                      <td style={{ padding: "14px 24px", fontFamily: "monospace", color: "#555" }}>{m.sku || "N/A"}</td>
                      <td style={{ padding: "14px 24px", textAlign: "center", fontWeight: "600" }}>{m.size || "-"}</td>
                      <td style={{ padding: "14px 24px" }}>{getMovementTypeBadge(m.type)}</td>
                      <td style={{ padding: "14px 24px", textAlign: "center", fontWeight: "700" }}>
                        {m.type === "Stock Sold" || (m.type === "Stock Adjustment" && m.previousStock > m.updatedStock) ? "-" : "+"}
                        {m.quantity}
                      </td>
                      <td style={{ padding: "14px 24px", textAlign: "center", color: "#888" }}>{m.previousStock}</td>
                      <td style={{ padding: "14px 24px", textAlign: "center", fontWeight: "600" }}>{m.updatedStock}</td>
                      <td style={{ padding: "14px 24px", color: "#555" }}>{m.reason || "N/A"}</td>
                      <td style={{ padding: "14px 24px", color: "#111", fontWeight: "500" }}>{m.updatedBy}</td>
                      <td style={{ padding: "14px 24px", textAlign: "right" }}>
                        <button 
                          onClick={() => handleDeleteMovement(m._id)}
                          style={{ padding: "6px 10px", background: "none", border: "none", cursor: "pointer", color: "#dc2626", borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.2s" }}
                          title="Delete movement log and recalculate stock"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {movementsPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: "1px solid #ececec" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Showing page {movementsPage} of {movementsPages} ({totalMovements} total logs)
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  disabled={movementsPage === 1}
                  onClick={() => setMovementsPage(prev => Math.max(1, prev - 1))}
                  style={{ padding: "6px 12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", cursor: movementsPage === 1 ? "not-allowed" : "pointer", opacity: movementsPage === 1 ? 0.5 : 1 }}
                >
                  Previous
                </button>
                <button 
                  disabled={movementsPage === movementsPages}
                  onClick={() => setMovementsPage(prev => Math.min(movementsPages, prev + 1))}
                  style={{ padding: "6px 12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", cursor: movementsPage === movementsPages ? "not-allowed" : "pointer", opacity: movementsPage === movementsPages ? 0.5 : 1 }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Adjust Modal */}
      {adjustModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "500px", padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", border: "1px solid #ececec", animation: "cardReveal 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111" }}>Adjust Stock Quantity</h3>
              <button 
                onClick={() => setAdjustModalOpen(false)}
                style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveAdjustment} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px" }}>Product</label>
                <input 
                  type="text" 
                  value={adjustForm.productName} 
                  disabled 
                  style={{ width: "100%", height: "44px", padding: "0 14px", borderRadius: "8px", border: "1px solid #ddd", background: "#f8f8f8", color: "#555", fontSize: "14px" }}
                />
              </div>

              {adjustForm.sizes && adjustForm.sizes.length > 0 && (
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px" }}>Select Size</label>
                  <select 
                    value={adjustForm.size}
                    onChange={(e) => setAdjustForm({ ...adjustForm, size: e.target.value })}
                    style={{ width: "100%", height: "44px", padding: "0 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", background: "#fff" }}
                  >
                    {adjustForm.sizes.map((sz, idx) => (
                      <option key={idx} value={sz}>Size {sz}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px" }}>Adjustment Type</label>
                  <select 
                    value={adjustForm.type}
                    onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                    style={{ width: "100%", height: "44px", padding: "0 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", background: "#fff" }}
                  >
                    <option value="Stock Added">Stock Added</option>
                    <option value="Stock Adjustment">Stock Adjustment</option>
                    <option value="Stock Returned">Stock Returned</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px" }}>Quantity</label>
                  <input 
                    type="number" 
                    placeholder="Use -10 or +10" 
                    value={adjustForm.quantity}
                    onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                    required
                    style={{ width: "100%", height: "44px", padding: "0 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px" }}>Reason for adjustment</label>
                <input 
                  type="text" 
                  placeholder="e.g. Received new shipment, stock correction..." 
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  style={{ width: "100%", height: "44px", padding: "0 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px" }}>Recorded By</label>
                <input 
                  type="text" 
                  value={adjustForm.updatedBy} 
                  onChange={(e) => setAdjustForm({ ...adjustForm, updatedBy: e.target.value })}
                  style={{ width: "100%", height: "44px", padding: "0 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button 
                  type="button" 
                  onClick={() => setAdjustModalOpen(false)}
                  style={{ flex: 1, height: "46px", border: "1px solid #ddd", background: "#fff", borderRadius: "8px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={adjustSaving}
                  style={{ flex: 1, height: "46px", border: "none", background: "#111", color: "#fff", borderRadius: "8px", fontWeight: "600", cursor: adjustSaving ? "not-allowed" : "pointer", opacity: adjustSaving ? 0.7 : 1, transition: "all 0.2s" }}
                >
                  {adjustSaving ? "Saving..." : "Apply Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
