export default function FeaturesStrip() {
  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      title: "Payment",
      text: "COD & online payment",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="3" width="15" height="13" rx="1" />
          <path d="M16 8h4l3 5v3h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      title: "Delivery",
      text: "2–5 working days",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
      title: "Shipping",
      text: "Free on orders above ₹999",
    },
  ];

  return (
    <div className="curate-features">
      <div className="curate-features-inner" role="list">
        {features.map((f) => (
          <div key={f.title} className="curate-feature" role="listitem">
            <div className="curate-feature-icon" aria-hidden="true">{f.icon}</div>
            <div>
              <div className="curate-feature-title">{f.title}</div>
              <div className="curate-feature-text">{f.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}