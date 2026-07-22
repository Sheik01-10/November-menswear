import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";
import "./CollectionPage.css";
import "./Products.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import WishlistButton from "../components/WishlistButton";
import ShareButton from "../components/ShareButton";
import FloatingWhatsApp from "../components/FloatingWhatsApp";

export default function WorkMode() {
  const { products, loading } = useProducts();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (item) => item.category === "work-mode"
    );
  }, [products]);

  return (
    <>
      {/* HEADER */}
      <Header />
      <BackButton/>
      {/* COLLECTION HERO */}
<section className="collection-hero work-mode-hero">
  <div className="collection-overlay"></div>

  <div className="collection-content">
    <h1>WORK MODE</h1>
  </div>
</section>

      {/* PRODUCTS CATALOG SECTION */}
      <div className="products-page" style={{ paddingTop: "0px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "30vh" }}>
            <p style={{ letterSpacing: "2px", fontWeight: "500", fontFamily: "Jost, sans-serif" }}>LOADING COLLECTION...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "30vh", gap: "10px" }}>
            <p style={{ letterSpacing: "2px", fontWeight: "500", fontFamily: "Jost, sans-serif" }}>NO ITEMS FOUND IN THIS COLLECTION</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((item) => (
              <Link 
                className="product-card" 
                key={item.id}
                to={`/product/${item.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {/* IMAGE */}
                <div className="product-image">
                  <img
                    src={getOptimizedImageUrl(item.front, 600)}
                    alt={item.name}
                    className="front-img"
                    loading="lazy"
                  />
                  {item.back && (
                    <img
                      src={getOptimizedImageUrl(item.back, 600)}
                      alt={item.name}
                      className="back-img"
                      loading="lazy"
                    />
                  )}
                  {/* Wishlist Button */}
                  <WishlistButton product={item} />
                  {/* Share Button */}
                  <ShareButton product={item} />
                  {/* Discount Badge */}
                  {item.pct && (
                    <span className="discount-badge">
                      {item.pct}
                    </span>
                  )}
                </div>

                {/* INFO */}
                <div className="product-info">
                  <p className="brand-name">THE NOVEMBER</p>
                  <h3>{item.name}</h3>
                  <div className="price-wrap">
                    <span className="price">{item.price}</span>
                    {item.compare && (
                      <span className="compare-price">{item.compare}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING WHATSAPP & FOOTER */}
      <FloatingWhatsApp />
      <Footer />
    </>
  );
}