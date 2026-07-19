import "./LuxuryCollections.css";
import { Link } from "react-router-dom";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";

export default function LuxuryCollections() {
  return (
    <section className="luxury-section">

      {/* Header */}
      <div className="luxury-header">

        <span className="luxury-tag">
          CURATED COLLECTIONS
        </span>

        <h2>
          Crafted For Modern Men
        </h2>

      </div>

      {/* Grid */}
      <div className="luxury-grid">

        {/* WORK MODE */}
        <Link
          to="/work-mode"
          className="luxury-card"
        >
          <img
            src={getOptimizedImageUrl("https://images.unsplash.com/photo-1617127365659-c47fa864d8bc", 800)}
            alt="Work Mode"
            className="luxury-bg-img"
            loading="lazy"
          />
          <div className="overlay"></div>

          <div className="luxury-content">

            <span>
              WORK MODE
            </span>

            <p>
              Tailored Shirts &
              Formal Wear
            </p>

            <small>
              Explore →
            </small>

          </div>
        </Link>

        {/* QUIET LUXURY */}
        <Link
          to="/quiet-luxury"
          className="luxury-card"
        >
          <img
            src={getOptimizedImageUrl("https://images.unsplash.com/photo-1617137984095-74e4e5e3613f", 800)}
            alt="Quiet Luxury"
            className="luxury-bg-img"
            loading="lazy"
          />
          <div className="overlay"></div>

          <div className="luxury-content">

            <span>
              QUIET LUXURY
            </span>

            <p>
              Refined Polos &
              Premium Fits
            </p>

            <small>
              Explore →
            </small>

          </div>
        </Link>

      </div>

    </section>
  );
}