import { memo, useState } from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import { CreditCard, Clock, Truck, MapPin, Phone, Smartphone, Mail } from "lucide-react";

function Footer() {
  const [openSections, setOpenSections] = useState({
    products: false,
    service: false,
    information: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      <section className="service-highlights">
        <div className="highlights-container">
          <div className="highlight-item">
            <CreditCard size={28} strokeWidth={1.2} className="highlight-icon" />
            <h4 className="highlight-title">PAYMENT</h4>
            <p className="highlight-desc">COD & Secure Online Payment</p>
          </div>
          <div className="highlight-item">
            <Clock size={28} strokeWidth={1.2} className="highlight-icon" />
            <h4 className="highlight-title">DELIVERY</h4>
            <p className="highlight-desc">2–5 Working Days</p>
          </div>
          <div className="highlight-item">
            <Truck size={28} strokeWidth={1.2} className="highlight-icon" />
            <h4 className="highlight-title">SHIPPING</h4>
            <p className="highlight-desc">Free Shipping on Orders Above ₹999</p>
          </div>
        </div>
      </section>
      <footer className="footer">

        {/* DESKTOP ONLY FOOTER CONTAINER */}
        <div className="footer-container footer-desktop-only">

          {/* PRODUCTS */}
          <div className="footer-column">
            <h3>PRODUCTS</h3>

            <ul>
              <li>
                <Link to="/products">
                  NEW ARRIVAL
                </Link>
              </li>

              <li>
                <Link to="/products">
                  SHIRTS
                </Link>
              </li>

              <li>
                <Link to="/products">
                  T-SHIRTS
                </Link>
              </li>

              <li>
                <Link to="/products">
                  TROUSERS
                </Link>
              </li>
            </ul>
          </div>

          {/* SERVICE */}
          <div className="footer-column">
            <h3>SERVICE</h3>

            <ul>
              <li>
                <Link to="/contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* INFORMATION */}
          <div className="footer-column">
            <h3>INFORMATION</h3>

            <ul>
              <li>
                <Link to="/about">
                  About Us
                </Link>
              </li>

              <li>
                <Link to="/privacy-policy">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div className="footer-column support">
            <h3>SUPPORT</h3>

            <h4 className="support-brand">THE NOVEMBER</h4>

            <div className="support-info">
              <div className="support-item">
                <span className="support-icon">
                  <MapPin size={18} strokeWidth={1.2} />
                </span>
                <span className="support-text">
                  <span>291, Gandhiji Road, Surampattivalasu,</span>
                  <span>Erode, Tamil Nadu - 638001</span>
                </span>
              </div>

              <div className="support-item">
                <span className="support-icon">
                  <Phone size={18} strokeWidth={1.2} />
                </span>
                <span className="support-text">
                  <a href="tel:+917604801743">+91 7604801743</a>
                </span>
              </div>

              <div className="support-item">
                <span className="support-icon">
                  <Smartphone size={18} strokeWidth={1.2} />
                </span>
                <span className="support-text">
                  <a href="tel:+917604901743">+91 7604901743</a>
                </span>
              </div>

              <div className="support-item">
                <span className="support-icon">
                  <Mail size={18} strokeWidth={1.2} />
                </span>
                <span className="support-text">
                  <a href="mailto:www.novemberxix@gmail.com">www.novemberxix@gmail.com</a>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* MOBILE ONLY ACCORDION FOOTER */}
        <div className="footer-mobile-only">
          <div className="footer-mobile-accordion">
            
            {/* PRODUCTS */}
            <div className="footer-accordion-item">
              <button
                className="footer-accordion-header"
                onClick={() => toggleSection("products")}
                aria-expanded={openSections.products}
              >
                <span className="footer-accordion-title">PRODUCTS</span>
                <span className={`footer-accordion-icon ${openSections.products ? "is-open" : ""}`} />
              </button>
              <div className={`footer-accordion-content ${openSections.products ? "is-open" : ""}`}>
                <div className="footer-accordion-content-inner">
                  <Link to="/products" className="footer-accordion-link">NEW ARRIVAL</Link>
                  <Link to="/products" className="footer-accordion-link">SHIRTS</Link>
                  <Link to="/products" className="footer-accordion-link">T-SHIRTS</Link>
                  <Link to="/products" className="footer-accordion-link">TROUSERS</Link>
                </div>
              </div>
            </div>

            {/* SERVICE */}
            <div className="footer-accordion-item">
              <button
                className="footer-accordion-header"
                onClick={() => toggleSection("service")}
                aria-expanded={openSections.service}
              >
                <span className="footer-accordion-title">SERVICE</span>
                <span className={`footer-accordion-icon ${openSections.service ? "is-open" : ""}`} />
              </button>
              <div className={`footer-accordion-content ${openSections.service ? "is-open" : ""}`}>
                <div className="footer-accordion-content-inner">
                  <Link to="/contact" className="footer-accordion-link">Contact</Link>
                </div>
              </div>
            </div>

            {/* INFORMATION */}
            <div className="footer-accordion-item">
              <button
                className="footer-accordion-header"
                onClick={() => toggleSection("information")}
                aria-expanded={openSections.information}
              >
                <span className="footer-accordion-title">INFORMATION</span>
                <span className={`footer-accordion-icon ${openSections.information ? "is-open" : ""}`} />
              </button>
              <div className={`footer-accordion-content ${openSections.information ? "is-open" : ""}`}>
                <div className="footer-accordion-content-inner">
                  <Link to="/about" className="footer-accordion-link">About Us</Link>
                  <Link to="/privacy-policy" className="footer-accordion-link">Privacy Policy</Link>
                </div>
              </div>
            </div>

          </div>

          {/* MOBILE SUPPORT */}
          <div className="footer-mobile-support">
            <h4 className="footer-mobile-support-brand">THE NOVEMBER</h4>
            
            <div className="support-info">
              <div className="support-item">
                <span className="support-icon">
                  <MapPin size={18} strokeWidth={1.2} />
                </span>
                <span className="support-text">
                  <span>291, Gandhiji Road, Surampattivalasu,</span>
                  <span>Erode, Tamil Nadu - 638001</span>
                </span>
              </div>

              <div className="support-item">
                <span className="support-icon">
                  <Phone size={18} strokeWidth={1.2} />
                </span>
                <span className="support-text">
                  <a href="tel:+917604801743">+91 7604801743</a>
                </span>
              </div>

              <div className="support-item">
                <span className="support-icon">
                  <Smartphone size={18} strokeWidth={1.2} />
                </span>
                <span className="support-text">
                  <a href="tel:+917604901743">+91 7604901743</a>
                </span>
              </div>

              <div className="support-item">
                <span className="support-icon">
                  <Mail size={18} strokeWidth={1.2} />
                </span>
                <span className="support-text">
                  <a href="mailto:www.novemberxix@gmail.com">www.novemberxix@gmail.com</a>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="footer-bottom">
          <p>
            © 2026 THE NOVEMBER.
            All Rights Reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

export default memo(Footer);