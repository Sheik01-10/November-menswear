import { useState, useEffect } from "react";
import axios from "axios";
import { Heart, Search, User } from "lucide-react";

const BACKEND = `http://${window.location.hostname}:5000`;

export default function AdminWishlist() {
  const [customers, setCustomers] = useState([]);
  const [wishlists, setWishlists] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCustomer, setActiveCustomer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const custRes = await axios.get(`${BACKEND}/api/users`);
        setCustomers(custRes.data);

        // Fetch wishlist details for each user
        const wishlistPromises = custRes.data.map(async (cust) => {
          try {
            const wishRes = await axios.get(`${BACKEND}/api/wishlist/${cust.uid}`);
            return { uid: cust.uid, products: wishRes.data };
          } catch (e) {
            return { uid: cust.uid, products: [] };
          }
        });

        const wishResults = await Promise.all(wishlistPromises);
        const wishMap = {};
        wishResults.forEach(res => {
          wishMap[res.uid] = res.products;
        });

        setWishlists(wishMap);
        if (custRes.data.length > 0) {
          setActiveCustomer(custRes.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="loading-state"><p>Loading customer wishlists...</p></div>;
  }

  const activeProducts = activeCustomer ? (wishlists[activeCustomer.uid] || []) : [];

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1>Customer Wishlists</h1>
          <p>Analyze products currently saved by customers</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Customer List Panel */}
        <div style={{
          flex: "0 0 320px", background: "#fff", border: "1px solid #ececec",
          borderRadius: 24, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
          display: "flex", flexDirection: "column", gap: 16
        }}>
          <h3>Customers</h3>
          <div className="table-search" style={{ margin: 0 }}>
            <Search size={14} color="#888" />
            <input
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: "8px 12px 8px 30px", fontSize: 13 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
            {filteredCustomers.map(c => {
              const count = wishlists[c.uid]?.length || 0;
              const isActive = activeCustomer?.uid === c.uid;
              return (
                <div
                  key={c._id}
                  onClick={() => setActiveCustomer(c)}
                  style={{
                    display: "flex", alignItems: "center", justifyBetween: "space-between",
                    padding: "10px 14px", borderRadius: 14, cursor: "pointer",
                    background: isActive ? "#f8f5f0" : "transparent",
                    border: "1px solid", borderColor: isActive ? "#ececec" : "transparent",
                    transition: ".2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <img
                      src={c.photo || `https://i.pravatar.cc/60?u=${c.email}`}
                      style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                      onError={e => { e.target.src = `https://i.pravatar.cc/60?u=${c.email}`; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</h4>
                      <p style={{ fontSize: 11, color: "#888", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: count > 0 ? "#b91c1c" : "#888", fontSize: 12, fontWeight: 600 }}>
                    <Heart size={12} fill={count > 0 ? "#b91c1c" : "none"} /> {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wishlist Items Panel */}
        <div style={{
          flex: 1, background: "#fff", border: "1px solid #ececec",
          borderRadius: 24, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)"
        }}>
          {activeCustomer ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <img
                  src={activeCustomer.photo || `https://i.pravatar.cc/80?u=${activeCustomer.email}`}
                  style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
                  onError={e => { e.target.src = `https://i.pravatar.cc/80?u=${activeCustomer.email}`; }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{activeCustomer.name}'s Wishlist</h3>
                  <span style={{ fontSize: 13, color: "#888" }}>{activeCustomer.email}</span>
                </div>
              </div>

              {activeProducts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px", color: "#888" }}>
                  <Heart size={32} style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 14, margin: 0 }}>This customer's wishlist is empty.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                  {activeProducts.map(p => (
                    <div key={p.id} style={{ border: "1px solid #ececec", borderRadius: 16, overflow: "hidden" }}>
                      <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
                        <img src={p.front} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ padding: 12 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</h4>
                        <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "#888", textTransform: "capitalize" }}>{p.category}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{p.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "64px 24px", color: "#888" }}>
              <User size={36} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14 }}>Select a customer to view their saved items.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
