import React, { useState } from "react";
import { Share2, X, Copy, Check } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaTelegramPlane, FaTwitter } from "react-icons/fa";
import toast from "react-hot-toast";
import "./ShareButton.css";

export default function ShareButton({ product, variant = "card" }) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const productUrl = `${window.location.origin}/product/${product.id || product._id}`;

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

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
          setShowModal(true);
        }
      }
    } else {
      setShowModal(true);
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast.success("Product link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        toast.error("Failed to copy link");
      });
  };

  return (
    <>
      {variant === "detail" ? (
        <button 
          className="btn-share-detail" 
          onClick={handleShare}
          aria-label="Share Product"
        >
          <Share2 size={20} />
          <span>Share</span>
        </button>
      ) : (
        <button
          className="share-btn"
          onClick={handleShare}
          aria-label="Share Product"
        >
          <Share2 size={18} />
        </button>
      )}

      {showModal && (
        <div className="share-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="share-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share Product</h3>
              <button className="share-modal-close" onClick={() => setShowModal(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="share-modal-product">
              <img src={product.front} alt={product.name} className="share-modal-product-img" />
              <div className="share-modal-product-info">
                <span className="share-modal-product-brand">NOVEMBER</span>
                <h4>{product.name}</h4>
                <p>{product.price}</p>
              </div>
            </div>

            <div className="share-modal-options">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${product.name} on November: ${productUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-option-item whatsapp"
              >
                <div className="share-icon-wrap">
                  <FaWhatsapp size={22} />
                </div>
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-option-item facebook"
              >
                <div className="share-icon-wrap">
                  <FaFacebook size={22} />
                </div>
                <span>Facebook</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product.name} on November!`)}&url=${encodeURIComponent(productUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-option-item twitter"
              >
                <div className="share-icon-wrap">
                  <FaTwitter size={20} />
                </div>
                <span>Twitter / X</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(`Check out ${product.name} on November!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-option-item telegram"
              >
                <div className="share-icon-wrap">
                  <FaTelegramPlane size={22} />
                </div>
                <span>Telegram</span>
              </a>

              <button
                onClick={() => handleCopyLink(productUrl)}
                className="share-option-item copy-link"
              >
                <div className="share-icon-wrap">
                  {copied ? <Check size={20} className="copied-check" /> : <Copy size={20} />}
                </div>
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
