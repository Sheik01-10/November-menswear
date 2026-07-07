import { useLocation, useNavigate, Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import "./Products.css";
import FloatingWhatsApp from "../components/FloatingWhatsApp";

import BackButton from "../components/BackButton";
import Header from "../components/Header";
import WishlistButton from "../components/WishlistButton";
import ShareButton from "../components/ShareButton";
import Footer from "../components/Footer";

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const { products, categories, loading } = useProducts();

  const getCategoryKey = (cat) => {
    if (!cat.href) return cat.label.toLowerCase();
    try {
      const url = new URL(cat.href, window.location.origin);
      return url.searchParams.get("category") || "new";
    } catch {
      const match = cat.href.match(/[?&]category=([^&]+)/);
      return match ? match[1] : cat.label.toLowerCase();
    }
  };

  const params = new URLSearchParams(location.search);
  const activeTab = params.get("category") || "new";
  const searchQuery = params.get("search") || "";

  const handleTabClick = (category) => {
    if (category === "new") {
      navigate("/products");
    } else {
      navigate(`/products?category=${category}`);
    }
  };

  /* ==========================
     FILTER PRODUCTS
  ========================== */
  let filteredProducts =
    activeTab === "new"
      ? products
      : products.filter(
        (item) =>
          item.category === activeTab
      );

  if (searchQuery) {
    filteredProducts = filteredProducts.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#fcfaf7", color: "#111" }}>
        <p style={{ letterSpacing: "2px", fontWeight: "500", fontFamily: "Jost, sans-serif" }}>LOADING COLLECTION...</p>
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <Header />

      <div className="products-page">

        {/* BACK BUTTON */}
        <BackButton />

        {/* PAGE HEADER */}
        <div className="products-header">

          <h1>
            {searchQuery ? `SEARCH: "${searchQuery}"` : "OUR COLLECTION"}
          </h1>

          <p>
            {searchQuery
              ? `${filteredProducts.length} luxury item(s) found`
              : "Premium Luxury Menswear"}
          </p>

          {searchQuery && (
            <div
              className="search-clear-badge"
              onClick={() => navigate("/products")}
              style={{ marginBottom: "35px" }}
            >
              <span>Clear Search: "{searchQuery}"</span>
              <span className="clear-icon"> ×</span>
            </div>
          )}

          {/* CATEGORY TABS */}
          <div className="category-tabs">

            <button
              className={activeTab === "new" ? "active" : ""}
              onClick={() => handleTabClick("new")}
            >
              New Arrivals
            </button>

            {categories
              .filter((cat) => {
                const key = getCategoryKey(cat);
                return key !== "new" && cat.label.toLowerCase() !== "new arrival";
              })
              .map((cat) => {
                const key = getCategoryKey(cat);
                return (
                  <button
                    key={cat._id}
                    className={activeTab === key ? "active" : ""}
                    onClick={() => handleTabClick(key)}
                  >
                    {cat.label}
                  </button>
                );
              })}

          </div>
        </div>

        <FloatingWhatsApp />

        {/* PRODUCTS GRID */}
        <div className="products-grid">

          {filteredProducts.map(
            (item, index) => (

              <Link
                className="product-card"
                key={index}
                to={`/product/${item.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >

                {/* IMAGE */}
                <div className="product-image">

                  <img
                    src={item.front}
                    alt={item.name}
                    className="front-img"
                  />

                  <img
                    src={item.back}
                    alt={item.name}
                    className="back-img"
                  />

                  {/* Wishlist */}
                  <WishlistButton product={item} />

                  {/* Share */}
                  <ShareButton product={item} />

                  {/* Discount */}
                  <span className="discount-badge">
                    {item.pct}
                  </span>

                </div>

                {/* INFO */}
                <div className="product-info">

                  <p className="brand-name">
                    NOVEMBER
                  </p>

                  <h3>
                    {item.name}
                  </h3>

                  <div className="price-wrap">

                    <span className="price">
                      {item.price}
                    </span>

                    <span className="compare-price">
                      {item.compare}
                    </span>

                  </div>

                </div>

              </Link>
            )
          )}

        </div>

      </div>
      <Footer />
    </>
  );
}