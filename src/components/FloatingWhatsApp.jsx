import { FaWhatsapp } from "react-icons/fa";
import "./FloatingWhatsApp.css";

export default function FloatingWhatsApp() {
  const phone = "917604801743";

  const message =
    "Hi, I'm interested in your products.";

  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp"
    >
      <FaWhatsapp className="wa-icon" />
      <span>Message Us</span>
    </a>
  );
}   