import { useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";

import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

import "./Wishlist.css";

export default function Wishlist() {

  const {
    wishlist,
    loading,
    toggleWishlist,
  } = useWishlist();

  const {
    addToCart,
  } = useCart();

  const handleMoveToCart = useCallback((item) => {
    addToCart(item);
    toggleWishlist(item);
  }, [addToCart, toggleWishlist]);

  if (loading) {
    return (
      <>
        <Header />

        <div className="wishlist-page">
          <h1>Loading...</h1>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="wishlist-page">

        <div className="wishlist-header">

          <span className="wishlist-label">
            SAVED COLLECTION
          </span>

          <h1>Wishlist</h1>

          <p>
            {wishlist.length} Luxury Item
            {wishlist.length !== 1 && "s"} Saved
          </p>

        </div>

        {wishlist.length === 0 ? (

          <div className="wishlist-empty">

            <ShoppingBag
              size={70}
              strokeWidth={1.5}
            />

            <h2>Your Wishlist is Empty</h2>

            <p>
              Save your favourite luxury pieces and
              they'll appear here.
            </p>

            <Link
              to="/products"
              className="shop-btn"
            >
              Explore Collection
            </Link>

          </div>

        ) : (

          <div className="wishlist-grid">

            {wishlist.map((item) => (

              <div
                key={item.id}
                className="wishlist-card"
              >

                <button
                  className="remove-icon"
                  onClick={() => toggleWishlist(item)}
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={18} />
                </button>

                <Link
                  to={`/product/${item.id}`}
                  className="wishlist-image-link"
                >

                  <img
                    src={getOptimizedImageUrl(item.front, 600)}
                    alt={item.name}
                    className="wishlist-image"
                    loading="lazy"
                  />

                </Link>

                <div className="wishlist-content">

                  <span className="wishlist-category">
                    NOVEMBER COLLECTION
                  </span>

                  <h3>{item.name}</h3>

                  <div className="wishlist-rating">
                    ★★★★★
                  </div>

                  <p className="price">
                    {item.price}
                  </p>

                  <div className="wishlist-actions">

                    <button
                      className="wishlist-cart-btn"
                      onClick={() =>
                        handleMoveToCart(item)
                      }
                    >
                      Move to Cart

                      <ArrowRight size={18} />

                    </button>

                    <Link
                      to={`/product/${item.id}`}
                      className="view-btn"
                    >
                      View Details
                    </Link>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
      <Footer />
    </>
  );
}