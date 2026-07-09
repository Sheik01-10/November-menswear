import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Plus, Search, Pencil, Trash2, X, UploadCloud } from "lucide-react";
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

const EMPTY_FORM = {
  name: "", category: "shirts", price: "", comparePrice: "",
  pct: "", front: "", back: "", description: "", inStock: true, isBestseller: false,
  sizes: [], stockQuantity: 0, deliveryCharge: 0
};

export default function AdminProducts() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null); // product being edited
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Image Upload states & refs
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [dragFront, setDragFront] = useState(false);
  const [dragBack, setDragBack] = useState(false);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const uploadImage = async (file, type) => {
    if (type === "front") setUploadingFront(true);
    else setUploadingBack(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(`${BACKEND}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm(prev => ({ ...prev, [type]: res.data.url }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to upload image.");
    } finally {
      if (type === "front") setUploadingFront(false);
      else setUploadingBack(false);
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file, type);
    }
  };

  const renderImageUpload = (type, label, uploading, isDragging, setDragging, inputRef) => {
    const value = form[type];
    
    const handleDragOver = (e) => {
      e.preventDefault();
      setDragging(true);
    };
    
    const handleDragLeave = () => {
      setDragging(false);
    };
    
    const handleDrop = async (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        await uploadImage(file, type);
      }
    };

    const triggerClick = () => {
      inputRef.current?.click();
    };

    const handleRemove = () => {
      setForm(prev => ({ ...prev, [type]: "" }));
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    return (
      <div className="image-upload-container">
        <div className="image-upload-header">
          <label>{label}</label>
          {value && (
            <button type="button" className="btn-remove-img" onClick={handleRemove}>
              <X size={14} /> Remove
            </button>
          )}
        </div>
        
        {value ? (
          <div className="image-preview-box">
            <img src={value} alt={`${label} Preview`} />
            <div className="image-preview-overlay">
              <button type="button" className="btn-change-img" onClick={triggerClick}>
                Change Image
              </button>
            </div>
          </div>
        ) : (
          <div 
            className={`image-upload-dropzone ${isDragging ? "dragging" : ""} ${uploading ? "loading" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerClick}
          >
            {uploading ? (
              <div className="upload-spinner-container">
                <div className="upload-spinner"></div>
                <span>Uploading image...</span>
              </div>
            ) : (
              <>
                <UploadCloud size={24} className="upload-icon" />
                <span className="upload-title">Drag & drop or click to upload</span>
                <span className="upload-subtitle">PNG, JPG or JPEG up to 5MB</span>
              </>
            )}
          </div>
        )}
        <input 
          type="file" 
          ref={inputRef} 
          accept="image/*" 
          onChange={(e) => handleFileChange(e, type)} 
          style={{ display: "none" }}
        />
      </div>
    );
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/products`);
      setProducts(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/categories`);
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    const socket = io(BACKEND);
    socket.on("product_changed", ({ action, data }) => {
      setProducts(prev => {
        if (action === "create") return [data, ...prev];
        if (action === "update") return prev.map(p => p._id === data._id ? data : p);
        if (action === "delete") return prev.filter(p => p._id !== data._id);
        return prev;
      });
    });
    return () => socket.disconnect();
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, category: p.category, price: p.price, comparePrice: p.comparePrice || "",
      pct: p.pct || "", front: p.front, back: p.back, description: p.description || "",
      inStock: p.inStock, isBestseller: p.isBestseller,
      sizes: p.sizes || [], stockQuantity: p.stockQuantity || 0,
      deliveryCharge: p.deliveryCharge || 0
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.front) {
      alert("Front Image is required!");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        comparePrice: Number(form.comparePrice),
        stockQuantity: Number(form.stockQuantity || 0),
        inStock: Number(form.stockQuantity || 0) > 0,
        deliveryCharge: Number(form.deliveryCharge || 0)
      };
      if (editing) {
        await axios.put(`${BACKEND}/api/products/${editing._id}`, payload);
      } else {
        await axios.post(`${BACKEND}/api/products`, payload);
      }
      setModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save product.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try { await axios.delete(`${BACKEND}/api/products/${id}`); }
    catch (e) { alert("Failed to delete."); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page-content">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>Products</h1>
          <p>{products.length} products in store</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="table-panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={15} color="#888" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={handleLocalSearchChange}
            />
          </div>
          <span style={{ color: "#888", fontSize: 13 }}>{filtered.length} results</span>
        </div>

        {loading ? (
          <div className="loading-state"><p>Loading products...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Add your first product to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Compare</th>
                  <th>Discount</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="product-img-cell">
                        <img src={p.front} alt={p.name} onError={e => e.target.style.display = "none"} />
                        <div>
                          <h4>{p.name}</h4>
                          {p.isBestseller && <span>⭐ Bestseller</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: "capitalize", color: "#555" }}>{p.category}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(p.price).toLocaleString("en-IN")}</td>
                    <td style={{ color: "#888", textDecoration: "line-through" }}>
                      {p.comparePrice ? `₹${Number(p.comparePrice).toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td>
                      <span style={{
                        background: "#dcfce7", color: "#15803d",
                        padding: "3px 10px", borderRadius: "20px", fontSize: 12
                      }}>{p.pct || "—"}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span className={`status-badge ${p.inStock ? "completed" : "cancelled"}`}>
                          {p.inStock ? "In Stock" : "Out"}
                        </span>
                        <span style={{ fontSize: 11, color: "#666" }}>
                          Qty: {p.stockQuantity !== undefined ? p.stockQuantity : 0}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-icon" onClick={() => openEdit(p)}>
                          <Pencil size={14} /> Edit
                        </button>
                        <button className="btn-danger" onClick={() => handleDelete(p._id)}>
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

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? "Edit Product" : "Add New Product"}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Product Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Classic Black Shirt" />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {categories.map((cat) => {
                      const val = cat.label.toLowerCase().replace(/\s+/g, "-");
                      return (
                        <option key={cat._id} value={val}>
                          {cat.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="1280" />
                </div>
                <div className="form-group">
                  <label>Compare Price (₹)</label>
                  <input type="number" value={form.comparePrice} onChange={e => setForm({...form, comparePrice: e.target.value})} placeholder="1506" />
                </div>
                <div className="form-group">
                  <label>Discount %</label>
                  <input value={form.pct} onChange={e => setForm({...form, pct: e.target.value})} placeholder="-15%" />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      setForm({ ...form, stockQuantity: val, inStock: val > 0 });
                    }}
                    placeholder="e.g. 10"
                  />
                </div>
                <div className="form-group">
                  <label>Delivery Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.deliveryCharge}
                    onChange={e => setForm({...form, deliveryCharge: e.target.value})}
                    placeholder="e.g. 150"
                  />
                </div>
                <div className="form-group full">
                  <label style={{ display: "block", marginBottom: "8px" }}>Available Sizes</label>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {["S", "M", "L", "XL", "XXL"].map((sz) => {
                      const isSelected = form.sizes?.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            const sizes = form.sizes || [];
                            const newSizes = sizes.includes(sz)
                              ? sizes.filter(s => s !== sz)
                              : [...sizes, sz];
                            setForm({ ...form, sizes: newSizes });
                          }}
                          style={{
                            padding: "8px 16px",
                            border: isSelected ? "1px solid #c9a96a" : "1px solid #ececec",
                            background: isSelected ? "#fcfaf7" : "#fff",
                            color: isSelected ? "#c9a96a" : "#111",
                            fontWeight: isSelected ? "600" : "400",
                            borderRadius: "4px",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group full">
                  {renderImageUpload("front", "Front Image *", uploadingFront, dragFront, setDragFront, frontInputRef)}
                </div>
                <div className="form-group full">
                  {renderImageUpload("back", "Back Image", uploadingBack, dragBack, setDragBack, backInputRef)}
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Product description..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving || uploadingFront || uploadingBack}>
                  {saving ? "Saving..." : (uploadingFront || uploadingBack) ? "Uploading..." : editing ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
