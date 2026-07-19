import { useState, useEffect } from "react";
import axios from "axios";
import { Save, Store, Bell, CheckCircle, ArrowUp, ArrowDown, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { io } from "socket.io-client";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export default function AdminSettings() {
  const [form, setForm] = useState({
    storeName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    announcementBarText: "",
    announcementBarActive: true,
    announcements: [],
    freeShippingThreshold: 999
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [newText, setNewText] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/settings`);
      setForm({
        ...res.data,
        announcements: res.data.announcements || []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();

    const socket = io(BACKEND);
    socket.on("settings_changed", (updatedSettings) => {
      setForm({
        ...updatedSettings,
        announcements: updatedSettings.announcements || []
      });
    });

    return () => socket.disconnect();
  }, []);

  const handleAddAnnouncement = () => {
    if (!newText.trim()) return;
    const currentList = form.announcements || [];
    const updated = [...currentList, { text: newText.trim(), active: true }];
    setForm({ ...form, announcements: updated });
    setNewText("");
  };

  const moveAnnouncement = (index, direction) => {
    const currentList = form.announcements || [];
    const updated = [...currentList];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setForm({ ...form, announcements: updated });
  };

  const toggleAnnouncementActive = (index) => {
    const currentList = form.announcements || [];
    const updated = currentList.map((ann, i) =>
      i === index ? { ...ann, active: !ann.active } : ann
    );
    setForm({ ...form, announcements: updated });
  };

  const startEditing = (index) => {
    const currentList = form.announcements || [];
    setEditingIndex(index);
    setEditingText(currentList[index].text);
  };

  const saveEditing = (index) => {
    if (!editingText.trim()) return;
    const currentList = form.announcements || [];
    const updated = currentList.map((ann, i) =>
      i === index ? { ...ann, text: editingText.trim() } : ann
    );
    setForm({ ...form, announcements: updated });
    setEditingIndex(null);
    setEditingText("");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  const deleteAnnouncement = (index) => {
    const currentList = form.announcements || [];
    const updated = currentList.filter((_, i) => i !== index);
    setForm({ ...form, announcements: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await axios.put(`${BACKEND}/api/settings`, form);
      setForm({
        ...res.data,
        announcements: res.data.announcements || []
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-state"><p>Loading shop settings...</p></div>;
  }

  return (
    <div className="admin-page-content" style={{ maxWidth: 720 }}>
      <div className="admin-page-header">
        <div>
          <h1>Settings</h1>
          <p>Global storefront configuration panel</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Profile Card */}
        <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, color: "#111" }}>
            <Store size={20} color="#a38144" />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Store Information</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label>Store Name *</label>
              <input required value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Contact Email *</label>
                <input required type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Contact Phone *</label>
                <input required value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label>Business Address</label>
              <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={3} />
            </div>
          </div>
        </div>

        {/* Announcement Bar Settings */}
        <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 24, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, color: "#111" }}>
            <Bell size={20} color="#a38144" />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Promotions & Header Bar</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Legacy Text (maintained as fallback and sync) */}
            <div className="form-group">
              <label>Legacy Announcement Text (Fallback)</label>
              <input value={form.announcementBarText} onChange={e => setForm({...form, announcementBarText: e.target.value})} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Free Shipping Threshold (₹)</label>
                <input type="number" value={form.freeShippingThreshold} onChange={e => setForm({...form, freeShippingThreshold: Number(e.target.value)})} />
              </div>
              <div className="form-group checkbox" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginTop: 24 }}>
                <input
                  type="checkbox"
                  id="announcementBarActive"
                  checked={form.announcementBarActive}
                  onChange={e => setForm({...form, announcementBarActive: e.target.checked})}
                  style={{ width: "auto" }}
                />
                <label htmlFor="announcementBarActive" style={{ margin: 0, cursor: "pointer" }}>Display announcement bar</label>
              </div>
            </div>

            {/* Announcement Manager */}
            {form.announcementBarActive && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid #f1f1f1", paddingTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: "#444" }}>Manage Announcements</label>
                </div>
                
                {/* Announcement List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(form.announcements || []).map((ann, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        background: ann.active ? "#fafafa" : "#f5f5f5",
                        border: "1px solid #ececec",
                        borderRadius: 12,
                        transition: "all 0.2s ease"
                      }}
                    >
                      {/* Reorder Buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveAnnouncement(index, -1)}
                          style={{
                            padding: 2,
                            background: "transparent",
                            border: "none",
                            cursor: index === 0 ? "not-allowed" : "pointer",
                            color: index === 0 ? "#ccc" : "#666",
                            display: "flex",
                            alignItems: "center"
                          }}
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === (form.announcements || []).length - 1}
                          onClick={() => moveAnnouncement(index, 1)}
                          style={{
                            padding: 2,
                            background: "transparent",
                            border: "none",
                            cursor: index === (form.announcements || []).length - 1 ? "not-allowed" : "pointer",
                            color: index === (form.announcements || []).length - 1 ? "#ccc" : "#666",
                            display: "flex",
                            alignItems: "center"
                          }}
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      {/* Active Checkbox */}
                      <input
                        type="checkbox"
                        checked={ann.active}
                        onChange={() => toggleAnnouncementActive(index)}
                        style={{ width: 16, height: 16, cursor: "pointer", margin: 0 }}
                        title={ann.active ? "Deactivate" : "Activate"}
                      />

                      {/* Announcement Text / Input */}
                      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                        {editingIndex === index ? (
                          <input
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "6px 10px",
                              fontSize: 13,
                              borderRadius: 6,
                              border: "1px solid #a38144",
                              outline: "none"
                            }}
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === "Enter") saveEditing(index);
                              if (e.key === "Escape") cancelEditing();
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: 13,
                              color: ann.active ? "#111" : "#888",
                              textDecoration: ann.active ? "none" : "line-through",
                              fontStyle: ann.active ? "normal" : "italic",
                              wordBreak: "break-all"
                            }}
                          >
                            {ann.text}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {editingIndex === index ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEditing(index)}
                              style={{
                                padding: 6,
                                background: "#15803d",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center"
                              }}
                              title="Save Edit"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              style={{
                                padding: 6,
                                background: "#dc2626",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center"
                              }}
                              title="Cancel Edit"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(index)}
                              style={{
                                padding: 6,
                                background: "#fafafa",
                                border: "1px solid #ececec",
                                borderRadius: 6,
                                cursor: "pointer",
                                color: "#666",
                                display: "flex",
                                alignItems: "center"
                              }}
                              title="Edit Announcement"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteAnnouncement(index)}
                              style={{
                                padding: 6,
                                background: "#fef2f2",
                                border: "1px solid #fee2e2",
                                borderRadius: 6,
                                cursor: "pointer",
                                color: "#ef4444",
                                display: "flex",
                                alignItems: "center"
                              }}
                              title="Delete Announcement"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {(form.announcements || []).length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "#888", fontSize: 13 }}>
                      No announcements added yet. Add one below.
                    </div>
                  )}
                </div>

                {/* Add New Announcement Inline Form */}
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <input
                    placeholder="Add new announcement message (e.g. Free shipping on all orders today!)..."
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      fontSize: 13,
                      borderRadius: 8,
                      border: "1px solid #ececec"
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAnnouncement();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddAnnouncement}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      fontSize: 13,
                      background: "#a38144",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
          <button type="submit" className="btn-primary" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Save size={16} /> {saving ? "Saving Changes..." : "Save Settings"}
          </button>
          {success && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#15803d", fontSize: 13, fontWeight: 500 }}>
              <CheckCircle size={16} /> Changes saved successfully!
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
