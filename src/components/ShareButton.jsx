import React from "react";
import { Share2 } from "lucide-react";
import toast from "react-hot-toast";
import "./ShareButton.css";

export default function ShareButton({ product, variant = "card" }) {
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Construct share URL
    const productUrl = `${window.location.origin}/product/${product.id || product._id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || `Check out ${product.name} on November!`,
          url: productUrl,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing product:", error);
          copyToClipboard(productUrl);
        }
      }
    } else {
      copyToClipboard(productUrl);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success("Product link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        toast.error("Failed to copy link");
      });
  };

  if (variant === "detail") {
    return (
      <button 
        className="btn-share-detail" 
        onClick={handleShare}
        aria-label="Share Product"
      >
        <Share2 size={20} />
        <span>Share</span>
      </button>
    );
  }

  return (
    <button
      className="share-btn"
      onClick={handleShare}
      aria-label="Share Product"
    >
      <Share2 size={18} />
    </button>
  );
}
