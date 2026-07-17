import { memo } from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
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
            Owner : ABBAS
          </p>

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
            novemberxix@gmail.com
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
  );
}

export default memo(Footer);