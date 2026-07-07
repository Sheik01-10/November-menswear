import "./LuxuryCollections.css";
import { Link } from "react-router-dom";

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
          className="luxury-card work-mode"
        >
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
          className="luxury-card quiet-luxury"
        >
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