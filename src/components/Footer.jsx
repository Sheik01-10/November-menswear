import { memo } from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import { CreditCard, Clock, Truck } from "lucide-react";

function Footer() {
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

      <div className="footer-container">

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

          <h4>NOVEMBER</h4>

          <p>
            291, Gandhiji Road,
            Surampattivalasu,
            Erode,
            Tamil Nadu - 638001
          </p>

          <p>
            +91 7604801743
          </p>

          <p>
            +91 7604901743
          </p>

          <p>
            www.novemberxix@gmail.com
          </p>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p>
          © 2026 NOVEMBER.
          All Rights Reserved.
        </p>
      </div>
    </footer>
    </>
  );
}

export default memo(Footer);