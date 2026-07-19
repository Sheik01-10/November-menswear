import { useCallback, memo } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";

import "./WishlistButton.css";

export default memo(function WishlistButton({ product }) {
  const navigate = useNavigate();

  const {
    toggleWishlist,
    isWishlisted,
  } = useWishlist();

  const active = isWishlisted(product.id);

  const handleClick = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const success =
      await toggleWishlist(product);

    if (!success) {
      navigate("/login");
    }
  }, [product, toggleWishlist, navigate]);

  return (
    <button
      className={`wishlist-btn ${
        active ? "active" : ""
      }`}
      onClick={handleClick}
      aria-label="Wishlist"
    >
      <Heart
        size={22}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
});