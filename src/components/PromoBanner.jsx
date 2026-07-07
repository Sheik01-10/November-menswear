export default function PromoBanner() {
  return (
    <section className="curate-promo" aria-label="Promotional offer">
      <p className="curate-promo-eyebrow">Discover the best deal</p>
      <h2 className="curate-promo-title">
        Flat 15% for<br />all collections
      </h2>
      <button
        className="btn-dark"
        onClick={() => window.location.href = "/collections/all"}
      >
        Check Now
      </button>
    </section>
  );
}