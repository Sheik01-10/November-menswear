import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import { ChevronRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import ShareButton from "../components/ShareButton";
import { auth } from "../firebase/firebase";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [activeTab, setActiveTab] = useState("description");

  // Desktop Hover Zoom States
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: "center", transform: "scale(1)" });
  const [isZoomed, setIsZoomed] = useState(false);

  // Fullscreen Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [modalScale, setModalScale] = useState(1);
  const [startScale, setStartScale] = useState(1);
  const [initialPinchDist, setInitialPinchDist] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (products && products.length > 0) {
      const found = products.find((p) => p.id === id || p._id === id);
      if (found) {
        setProduct(found);
        setActiveImage(found.front);
        // Reset selected size if product changes
        setSelectedSize("");
      }
    }
  }, [products, id]);

  const images = product ? [product.front, product.back].filter(Boolean) : [];

  const handleMainNext = () => {
    if (images.length <= 1) return;
    const nextIdx = (images.indexOf(activeImage) + 1) % images.length;
    setActiveImage(images[nextIdx]);
  };

  const handleMainPrev = () => {
    if (images.length <= 1) return;
    const prevIdx = (images.indexOf(activeImage) - 1 + images.length) % images.length;
    setActiveImage(images[prevIdx]);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.2)"
    });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomStyle({ transformOrigin: "center", transform: "scale(1)" });
  };

  const handleModalNext = () => {
    if (images.length <= 1) return;
    setModalImageIndex((prev) => (prev + 1) % images.length);
    setModalScale(1);
  };

  const handleModalPrev = () => {
    if (images.length <= 1) return;
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setModalScale(1);
  };

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      } else if (e.key === "ArrowRight") {
        handleModalNext();
      } else if (e.key === "ArrowLeft") {
        handleModalPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, images.length, handleModalNext, handleModalPrev]);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setTouchStart(e.touches[0].clientX);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDist(dist);
      setStartScale(modalScale);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialPinchDist > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialPinchDist;
      setModalScale(Math.min(Math.max(startScale * factor, 1), 3));
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      setInitialPinchDist(0);
    }
    if (e.changedTouches && e.changedTouches.length === 1 && touchStart !== 0) {
      const diffX = e.changedTouches[0].clientX - touchStart;
      if (diffX > 50) {
        handleModalPrev();
      } else if (diffX < -50) {
        handleModalNext();
      }
      setTouchStart(0);
    }
  };

  const handleDoubleTap = () => {
    setModalScale((prev) => (prev > 1 ? 1 : 2));
  };

  if (loading) {
    return (
      <div className="product-loading">
        <p>LOADING PRODUCT DETAILS...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="product-not-found">
          <h2>Product Not Found</h2>
          <p>The product you are looking for does not exist or has been removed.</p>
          <Link to="/products" className="btn-back-collection">Back to Collection</Link>
        </div>
        <Footer />
      </>
    );
  }

  const discountPct = product.pct || "";
  const stock = product.stockQuantity !== undefined ? product.stockQuantity : 0;
  const isOutOfStock = stock === 0 || !product.inStock;
  const isLowStock = stock > 0 && stock <= 5;

  // Calculate remaining stock for this size in cart
  const cartItemId = product.id + (selectedSize ? `-${selectedSize}` : "");
  const cartItem = cart.find(item => item.id === cartItemId);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const remainingStock = Math.max(0, stock - qtyInCart);

  const handleAddToBag = () => {
    if (isOutOfStock) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (qtyInCart >= stock) {
      toast.error(`Cannot add more. Only ${stock} items available in stock.`);
      return;
    }

    addToCart(product, selectedSize);
    toast.success(`${product.name} (${selectedSize || "Standard"}) added to cart!`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (qtyInCart >= stock) {
      toast.error(`Cannot add more. Only ${stock} items available in stock.`);
      return;
    }

    addToCart(product, selectedSize);

    const currentUser = auth.currentUser || JSON.parse(localStorage.getItem("user") || "null");
    if (!currentUser) {
      toast.error("Please log in first to purchase.");
      navigate(`/login?redirect=checkout`);
    } else {
      navigate("/checkout");
    }
  };

  const relatedProducts = product
    ? products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4)
    : [];

  return (
    <>
      <Header />
      <div className="product-details-page">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={12} />
            <Link to="/products">Collection</Link>
            <ChevronRight size={12} />
            <span className="current-crumb">{product.name}</span>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <BackButton />
          </div>

          <div className="product-layout">
            {/* Left: Gallery */}
            <div className="product-gallery">
              <div 
                className="main-image-wrapper" 
                onClick={() => {
                  const idx = images.indexOf(activeImage);
                  setModalImageIndex(idx >= 0 ? idx : 0);
                  setModalScale(1);
                  setIsModalOpen(true);
                }} 
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: "zoom-in", position: "relative" }}
              >
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  className={`main-image ${isZoomed ? "zoomed" : ""}`}
                  style={{
                    ...zoomStyle,
                    pointerEvents: "none"
                  }}
                  loading="lazy"
                />
                {discountPct && <span className="detail-discount-badge">{discountPct}</span>}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button 
                      type="button"
                      className="main-gallery-arrow prev"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMainPrev();
                      }}
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button 
                      type="button"
                      className="main-gallery-arrow next"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMainNext();
                      }}
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  </>
                )}

                {/* Image Index Display */}
                {images.length > 1 && (
                  <div className="main-gallery-index">
                    {images.indexOf(activeImage) + 1} / {images.length}
                  </div>
                )}
              </div>
              
              <div className="thumbnails-wrapper">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    className={`thumb-btn ${activeImage === img ? "active" : ""}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt={`View ${idx + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Info */}
            <div className="product-info-panel">
              <span className="brand-label">NOVEMBER COLLECTION</span>
              <h1 className="product-title">{product.name}</h1>
              
              <div className="price-container">
                <span className="price-val">{product.price}</span>
                {product.compare && (
                  <span className="compare-price-val">{product.compare}</span>
                )}
              </div>

              <div className="stock-container">
                {isOutOfStock ? (
                  <span className="stock-alert out-of-stock">Sold Out</span>
                ) : isLowStock ? (
                  <span className="stock-alert low-stock">Only {remainingStock} left in stock - Order Soon</span>
                ) : (
                  <span className="stock-alert in-stock">In Stock ({stock} available)</span>
                )}
              </div>

              <p className="product-short-desc">{product.description || "Crafted for comfort, design, and a refined luxury presence."}</p>

              {/* Sizes Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="sizes-section">
                  <div className="sizes-header">
                    <span className="section-title">Select Size</span>
                    {selectedSize && <span className="selected-size-label">Selected: {selectedSize}</span>}
                  </div>
                  <div className="sizes-grid">
                    {["S", "M", "L", "XL", "XXL"].map((size) => {
                      const isAvailable = product.sizes.includes(size);
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          className={`size-chip ${isSelected ? "selected" : ""} ${!isAvailable ? "unavailable" : ""}`}
                          disabled={!isAvailable}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-section" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                  <button 
                    className={`btn-add-to-bag ${isOutOfStock || remainingStock <= 0 ? "disabled" : ""}`}
                    disabled={isOutOfStock || remainingStock <= 0}
                    onClick={handleAddToBag}
                    style={{ flex: 1 }}
                  >
                    {isOutOfStock ? "SOLD OUT" : remainingStock <= 0 ? "MAX QUANTITY ADDED" : "ADD TO BAG"}
                  </button>
                  <button 
                    className={`btn-buy-now ${isOutOfStock || remainingStock <= 0 ? "disabled" : ""}`}
                    disabled={isOutOfStock || remainingStock <= 0}
                    onClick={handleBuyNow}
                    style={{ flex: 1 }}
                  >
                    {isOutOfStock ? "SOLD OUT" : remainingStock <= 0 ? "MAX QUANTITY ADDED" : "BUY NOW"}
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <ShareButton product={product} variant="detail" />
                </div>
              </div>

              {/* Luxury Guarantee Strips */}
              <div className="luxury-guarantees">
                <div className="guarantee-item">
                  <Truck size={18} />
                  <div>
                    <h4>Free Premium Shipping</h4>
                    <p>Complimentary shipping on orders above ₹5,000.</p>
                  </div>
                </div>
                <div className="guarantee-item">
                  <RefreshCw size={18} />
                  <div>
                    <h4>Easy Returns</h4>
                    <p>7-day hassle-free returns and size exchanges.</p>
                  </div>
                </div>
                <div className="guarantee-item">
                  <ShieldCheck size={18} />
                  <div>
                    <h4>100% Authentic Quality</h4>
                    <p>Designed and manufactured under strict craftsmanship guidelines.</p>
                  </div>
                </div>
              </div>

              {/* Product Tabs */}
              <div className="tabs-container">
                <div className="tabs-header">
                  <button 
                    className={`tab-link ${activeTab === "description" ? "active" : ""}`}
                    onClick={() => setActiveTab("description")}
                  >
                    Details
                  </button>
                  <button 
                    className={`tab-link ${activeTab === "shipping" ? "active" : ""}`}
                    onClick={() => setActiveTab("shipping")}
                  >
                    Shipping & Returns
                  </button>
                </div>
                <div className="tabs-content">
                  {activeTab === "description" && (
                    <div className="tab-pane">
                      <p>{product.description || "No product specifications available."}</p>
                      <ul style={{ paddingLeft: "20px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <li>100% Luxury double-woven cotton</li>
                        <li>Tailored regular fit</li>
                        <li>Engraved custom buttons</li>
                        <li>Dry clean recommended</li>
                      </ul>
                    </div>
                  )}
                  {activeTab === "shipping" && (
                    <div className="tab-pane">
                      <p>Orders are dispatched within 24-48 hours. Express transit takes 2-5 business days across India.</p>
                      <p style={{ marginTop: "10px" }}>Returns must be unused, unwashed, and accompanied by original tag tags. Exchanges are processed instantly based on size availability.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="related-products-section">
              <h2 className="related-title">YOU MAY ALSO LIKE</h2>
              <div className="related-divider-container">
                <div className="related-divider-line"></div>
                <div className="related-divider-diamond">♦</div>
                <div className="related-divider-line"></div>
              </div>
              
              <div className="products-grid">
                {relatedProducts.map((item, index) => (
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
                      {item.back && (
                        <img
                          src={item.back}
                          alt={item.name}
                          className="back-img"
                        />
                      )}
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
                      <p className="brand-name">NOVEMBER</p>
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
            </div>
          )}
        </div>
      </div>
      <FloatingWhatsApp product={product} selectedSize={selectedSize} />
      
      {/* Fullscreen Gallery Modal */}
      {isModalOpen && (
        <div className="fullscreen-gallery-modal" onClick={() => setIsModalOpen(false)}>
          <button className="gallery-modal-close" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
            &times;
          </button>
          
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            {images.length > 1 && (
              <button 
                type="button" 
                className="gallery-modal-arrow prev" 
                onClick={handleModalPrev}
                aria-label="Previous image"
              >
                &#8249;
              </button>
            )}
            
            <div 
              className="gallery-modal-image-container"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleTap}
            >
              <img 
                src={images[modalImageIndex]} 
                alt={`${product.name} Fullscreen`} 
                className="gallery-modal-image"
                style={{
                  transform: `scale(${modalScale})`,
                  transition: initialPinchDist > 0 ? "none" : "transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                }}
                loading="lazy"
              />
              
              {/* Index Indicator */}
              <div className="gallery-modal-index">
                {modalImageIndex + 1} / {images.length}
              </div>
            </div>
            
            {images.length > 1 && (
              <button 
                type="button" 
                className="gallery-modal-arrow next" 
                onClick={handleModalNext}
                aria-label="Next image"
              >
                &#8250;
              </button>
            )}
          </div>
          
          {/* Gallery Modal Thumbnails */}
          {images.length > 1 && (
            <div className="gallery-modal-thumbnails-wrapper" onClick={(e) => e.stopPropagation()}>
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  className={`gallery-modal-thumb-btn ${modalImageIndex === idx ? "active" : ""}`}
                  onClick={() => {
                    setModalImageIndex(idx);
                    setModalScale(1);
                  }}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />
    </>
  );
}
