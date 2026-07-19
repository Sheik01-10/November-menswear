import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { auth } from "../firebase/firebase";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";
import { useProducts } from "../context/ProductContext";
import toast from "react-hot-toast";

import "./Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const { settings } = useProducts();

  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    totalItems,
    totalPrice,
    shippingTotal,
    grandTotal,
  } = useCart();

  const handleCheckoutClick = (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser || JSON.parse(localStorage.getItem("user") || "null");
    if (!currentUser) {
      toast.error("Please log in first to proceed to checkout.");
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <>
      <Header />

      <div className="cart-page">

        <div className="cart-header">

          <span>SHOPPING BAG</span>

          <h1>Your Cart</h1>

          <p>{totalItems} Item{totalItems !== 1 && "s"}</p>

        </div>

        {cart.length === 0 ? (

          <div className="cart-empty">

            <h2>Your Bag is Empty</h2>

            <p>
              Discover timeless luxury pieces.
            </p>

            <Link
              to="/products"
              className="continue-btn"
            >
              Continue Shopping
            </Link>

          </div>

        ) : (

          <div className="cart-wrapper">

            <div className="cart-products">

              {cart.map((item) => (

                <div
                   className="cart-card"
                   key={item.id}
                >

                  <img
                    src={getOptimizedImageUrl(item.front, 200)}
                    alt={item.name}
                    loading="lazy"
                  />

                  <div className="cart-info">

                    <span className="category">
                      NOVEMBER COLLECTION
                    </span>

                    <h3>{item.name}</h3>
                    {item.selectedSize && (
                      <span className="cart-item-size" style={{ fontSize: "13px", color: "#888888", display: "block", marginTop: "4px" }}>
                        Size: {item.selectedSize}
                      </span>
                    )}

                    <p>{item.price}</p>

                    <div className="qty-box">

                      <button
                        onClick={() =>
                          decreaseQty(item.id)
                        }
                      >
                        <Minus size={16} />
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQty(item.id)
                        }
                      >
                        <Plus size={16} />
                      </button>

                    </div>

                  </div>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

              ))}

            </div>

            <div className="summary">

              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>{shippingTotal > 0 ? `₹${shippingTotal.toLocaleString("en-IN")}` : "FREE"}</span>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>

              {/* Shipping Promo Message */}
              {(() => {
                const threshold = settings && settings.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : 999;
                const activeThreshold = threshold === 5000 ? 999 : threshold;
                const isFree = totalPrice >= activeThreshold;
                return (
                  <div className="shipping-promo-message" style={{
                    textAlign: "center",
                    margin: "15px 0",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: isFree ? "#22c55e" : "#888888",
                    letterSpacing: "0.5px"
                  }}>
                    {isFree 
                      ? "Free Shipping Applied!" 
                      : `Add ₹${(activeThreshold - totalPrice).toLocaleString("en-IN")} more to unlock FREE Shipping.`}
                  </div>
                );
              })()}

              <button onClick={handleCheckoutClick} className="checkout-btn" style={{ textDecoration: "none" }}>

                Checkout

                <ArrowRight size={18} />

              </button>

            </div>

          </div>

        )}

      </div>
      <Footer />
    </>
  );
}