import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { io } from "socket.io-client";

const BACKEND = `http://${window.location.hostname}:5000`;
const EMPTY = { label: "", img: "", href: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`${BACKEND}/api/categories`).then(r => setCategories(r.data)).catch(console.error).finally(() => setLoading(false));
    const socket = io(BACKEND);
    socket.on("category_changed", ({ action, data }) => {
      setCategories(prev => {
        if (action === "create") return [...prev, data];
        if (action === "update") return prev.map(c => c._id === data._id ? data : c);
        if (action === "delete") return prev.filter(c => c._id !== data._id);
        return prev;
      });
    });
    return () => socket.disconnect();
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ label: c.label, img: c.img, href: c.href || "" }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await axios.put(`${BACKEND}/api/categories/${editing._id}`, form);
      else await axios.post(`${BACKEND}/api/categories`, form);
      setModal(false);
    } catch (err) { alert(err.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try { await axios.delete(`${BACKEND}/api/categories/${id}`); }
    catch { alert("Failed to delete."); }
  };

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1>Categories</h1>
          <p>{categories.length} categories configured</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Category</button>
      </div>

      {/* Grid of category cards */}
      {loading ? (
        <div className="loading-state"><p>Loading categories...</p></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {categories.map(c => (
            <div key={c._id} style={{
              background: "#fff", border: "1px solid #ececec", borderRadius: 20,
              overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              transition: ".3s"
            }}>
              <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
                <img
                  src={c.img} alt={c.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => e.target.style.display = "none"}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)"
                }} />
                <h3 style={{
                  position: "absolute", bottom: 14, left: 16,
                  color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: 1
                }}>{c.label}</h3>
              </div>
              <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#888", fontFamily: "monospace" }}>{c.href || "/products"}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-icon" onClick={() => openEdit(c)}><Pencil size={13} /> Edit</button>
                  <button className="btn-danger" onClick={() => handleDelete(c._id)}><Trash2 size={13} /></button>
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
              <h2>{editing ? "Edit Category" : "Add Category"}</h2>
              <button className="modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid single">
                <div className="form-group">
                  <label>Label *</label>
                  <input required value={form.label} onChange={e => setForm({...form, label: e.target.value})} placeholder="e.g. Shirts" />
                </div>
                <div className="form-group">
                  <label>Image URL *</label>
                  <input required value={form.img} onChange={e => setForm({...form, img: e.target.value})} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label>Link (href)</label>
                  <input value={form.href} onChange={e => setForm({...form, href: e.target.value})} placeholder="/products?category=shirts" />
                </div>
                {form.img && (
                  <div style={{ borderRadius: 12, overflow: "hidden", height: 140 }}>
                    <img src={form.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
