export default function TwoPanelFeature() {
  const panels = [
    {
      title: "Work Mode",
      cta: "Shop the Collection",
      href: "/collections/work-mode",
      img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=70",
    },
    {
      title: "Quite Luxury",
      cta: "Shop the Collection",
      href: "/collections/quite-luxury",
      img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=70",
    },
  ];

  return (
    <section className="curate-panel-grid" aria-label="Collection feature">
      {panels.map((p) => (
        <div
          key={p.href}
          className="curate-panel"
          role="link"
          tabIndex={0}
          onClick={() => window.location.href = p.href}
          onKeyDown={(e) => e.key === "Enter" && (window.location.href = p.href)}
        >
          <img src={p.img} alt={p.title} loading="lazy" />
          <div className="curate-panel-content">
            <h2 className="curate-panel-title">{p.title}</h2>
            <button className="btn-outline">{p.cta}</button>
          </div>
        </div>
      ))}
    </section>
  );
}