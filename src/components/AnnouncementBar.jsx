import { useProducts } from "../context/ProductContext";
import "./AnnouncementBar.css";

export default function AnnouncementBar({
  showBar = true,
}) {
  const { settings } = useProducts();
  
  const activeAnnouncements = settings && settings.announcements && settings.announcements.length > 0
    ? settings.announcements.filter(a => a.active).map(a => a.text)
    : (settings && !settings.announcementBarActive
        ? []
        : [settings?.announcementBarText || "FREE SHIPPING ON ORDERS OVER ₹5,000"]
      );

  const show = showBar && (settings ? settings.announcementBarActive : true) && activeAnnouncements.length > 0;

  return (
    <div
      className={`announcement-wrapper ${
        show
          ? "bar-show"
          : "bar-hide"
      }`}
    >
      <div className="announcement-bar">
        <div className="announcement-track">
          {activeAnnouncements.map((text, idx) => (
            <span key={`first-${idx}`}>
              {text}
            </span>
          ))}
          {/* Duplicate for infinite scrolling */}
          {activeAnnouncements.map((text, idx) => (
            <span key={`second-${idx}`}>
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}