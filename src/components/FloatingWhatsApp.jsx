import { FaWhatsapp } from "react-icons/fa";
import "./FloatingWhatsApp.css";

export default function FloatingWhatsApp({ product, selectedSize, selectedColor, quantity = 1 }) {
  const phone = "917604801743";

  let message = "Hi, I'm interested in your products.";

  if (product) {
    const lines = [
      "Hi, I would like to inquire about this product:\n",
      `*Product:* ${product.name}`,
      `*Price:* ${product.price}`,
      selectedSize ? `*Size:* ${selectedSize}` : `*Size:* Not selected`,
      selectedColor ? `*Color:* ${selectedColor}` : null,
      `*Quantity:* ${quantity}`,
      `*Link:* ${window.location.href}`
    ].filter(Boolean);

    message = lines.join("\n");
  }

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