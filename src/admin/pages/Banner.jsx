import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, X, Image as ImageIcon } from "lucide-react";
import { io } from "socket.io-client";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
const EMPTY_FORM = { title: "", subtitle: "", image: "", link: "", isActive: true };

export default function AdminBanner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/banners`);
      setBanners(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();

    const socket = io(BACKEND);
    socket.on("banner_changed", ({ action, data }) => {
      setBanners(prev => {
        if (action === "create") return [data, ...prev];
        if (action === "update") return prev.map(b => b._id === data._id ? data : b);
        if (action === "delete") return prev.filter(b => b._id !== data._id);
        return prev;
      });
    });

    return () => socket.disconnect();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      image: b.image,
      link: b.link || "",
      isActive: b.isActive
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${BACKEND}/api/banners/${editing._id}`, form);
      } else {
        await axios.post(`${BACKEND}/api/banners`, form);
      }
      setModal(false);
    } catch (err) {
      alert("Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await axios.delete(`${BACKEND}/api/banners/${id}`);
    } catch (e) {
      alert("Failed to delete banner");
    }
  };

  const toggleActive = async (banner) => {
    try {
      await axios.put(`${BACKEND}/api/banners/${banner._id}`, {
        ...banner,
        isActive: !banner.isActive
      });
    } catch (err) {
      alert("Failed to toggle banner status");
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post(`${BACKEND}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm(prev => ({ ...prev, image: res.data.url }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1>Banners</h1>
          <p>{banners.length} promotional banners configured</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {loading ? (
        <div className="loading-state"><p>Loading banners...</p></div>
      ) : banners.length === 0 ? (
        <div className="empty-state">
          <h3>No banners found</h3>
          <p>Add dynamic hero promo banners to configure the homepage.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {banners.map(b => (
            <div key={b._id} style={{
              background: "#fff", border: "1px solid #ececec", borderRadius: 20,
              overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
              display: "flex", flexDirection: "column", justifyBetween: "space-between"
            }}>
              <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                <img
                  src={b.image}
                  alt={b.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.target.style.display = "none"; }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)"
                }} />
                <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, color: "#fff" }}>
                  <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#c9a96a", fontWeight: 600 }}>{b.subtitle}</span>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{b.title || "Untitled Banner"}</h3>
                </div>
                <button
                  onClick={() => toggleActive(b)}
                  style={{
                    position: "absolute", top: 12, right: 12,
                    background: b.isActive ? "#dcfce7" : "#fee2e2",
                    color: b.isActive ? "#15803d" : "#b91c1c",
                    border: "none", borderRadius: 20, padding: "4px 12px",
                    fontSize: 11, fontWeight: 600, cursor: "pointer"
                  }}
                >
                  {b.isActive ? "Active" : "Inactive"}
                </button>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f9f9f9" }}>
                <span style={{ fontSize: 12, color: "#888", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: 150 }}>
                  Link: {b.link || "None"}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-icon" onClick={() => openEdit(b)}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(b._id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? "Edit Banner" : "Add Banner"}</h2>
              <button className="modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid single">
                <div className="form-group">
                  <label>Title</label>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Luxury Winter Drops" />
                </div>
                <div className="form-group">
                  <label>Subtitle / Category Eyebrow</label>
                  <input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} placeholder="e.g. FLAT 15% OFF" />
                </div>
                <div className="form-group">
                  <label>Banner Image *</label>
                  <div 
                    style={{
                      border: "2px dashed #c9a96a",
                      borderRadius: "12px",
                      padding: "24px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: "#faf8f5",
                      transition: "all 0.3s ease",
                      marginBottom: "12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                    onClick={() => document.getElementById("banner-image-file").click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        await handleImageUpload(e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    <input 
                      type="file" 
                      id="banner-image-file" 
                      accept="image/*" 
                      style={{ display: "none" }} 
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          await handleImageUpload(e.target.files[0]);
                        }
                      }}
                    />
                    {uploading ? (
                      <span style={{ fontSize: "14px", color: "#666" }}>Uploading image...</span>
                    ) : form.image ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <ImageIcon size={24} style={{ color: "#c9a96a" }} />
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>Image Uploaded Successfully!</span>
                        <span style={{ fontSize: "11px", color: "#888", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {form.image}
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <Plus size={24} style={{ color: "#c9a96a" }} />
                        <span style={{ fontSize: "14px", color: "#555" }}>Click or Drag image here to upload</span>
                        <span style={{ fontSize: "11px", color: "#aaa" }}>Supports JPG, PNG, JPEG (Max 5MB)</span>
                      </div>
                    )}
                  </div>
                  
                  <details style={{ cursor: "pointer", marginTop: "4px" }}>
                    <summary style={{ fontSize: "12px", color: "#c9a96a", fontWeight: "500" }}>Or enter manual image URL</summary>
                    <input 
                      style={{ 
                        marginTop: "8px", 
                        width: "100%", 
                        padding: "10px 14px", 
                        border: "1px solid #ececec", 
                        borderRadius: "8px",
                        fontSize: "14px"
                      }}
                      value={form.image} 
                      onChange={e => setForm({...form, image: e.target.value})} 
                      placeholder="https://..." 
                    />
                  </details>
                  
                  <input 
                    type="text" 
                    style={{ display: "none" }} 
                    required 
                    value={form.image} 
                    readOnly 
                  />
                </div>
                <div className="form-group">
                  <label>CTA Target URL (link)</label>
                  <input value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="e.g. /products?category=shirts" />
                </div>
                <div className="form-group checkbox" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={e => setForm({...form, isActive: e.target.checked})}
                    style={{ width: "auto" }}
                  />
                  <label htmlFor="isActive" style={{ margin: 0, cursor: "pointer" }}>Make this banner active</label>
                </div>
                {form.image && (
                  <div style={{ borderRadius: 12, overflow: "hidden", height: 140, border: "1px solid #ececec" }}>
                    <img src={form.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
