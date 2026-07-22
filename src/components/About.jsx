import "./About.css";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import BackButton from "./BackButton";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";

// ADD THESE
import Header from "./Header";
import Footer from "./Footer";

export default function About() {
  return (
    <>
      {/* HEADER */}
      <Header cartCount={0} />

      <div className="about-page">

        {/* HERO */}
        <section className="about-hero">

          <BackButton />

          <div className="about-overlay"></div>

          <motion.div
            className="about-center"
            initial={{
              opacity: 0,
              y: 80,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 1,
            }}
          >
            <p className="about-small">
              LUXURY REDEFINED
            </p>

            <h1 className="about-title">
              ABOUT <span>THE NOVEMBER</span>
            </h1>

            <p className="about-desc">
              At <strong>THE NOVEMBER</strong>,
              we believe style is more
              than fashion — it is confidence,
              identity and expression.
              Built for the modern gentleman,
              we create premium menswear
              that combines timeless
              aesthetics, exceptional
              quality and effortless comfort.
            </p>
          </motion.div>

          <h1 className="bg-word">
            THE NOVEMBER
          </h1>
        </section>

        {/* ABOUT SECTION */}
        <section className="about-section">

          <motion.div
            className="about-image"
            initial={{
              opacity: 0,
              x: -100,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 1,
            }}
            viewport={{
              once: true,
            }}
          >
            <img
              src={getOptimizedImageUrl("https://images.unsplash.com/photo-1617127365659-c47fa864d8bc", 800)}
              alt="Luxury Menswear"
              loading="lazy"
            />
          </motion.div>

          <motion.div
            className="about-content"
            initial={{
              opacity: 0,
              x: 100,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 1,
            }}
            viewport={{
              once: true,
            }}
          >
            <p className="section-tag">
              ABOUT US
            </p>

            <h2>
              Timeless Style For
              The <span>
                Modern Gentleman
              </span>
            </h2>

            <p>
              <strong>THE NOVEMBER</strong>
              {" "}is a premium menswear
              brand dedicated to modern
              style, quality craftsmanship
              and everyday comfort.
            </p>

            <p>
              We create timeless clothing
              designed for men who value
              confidence, elegance
              and individuality.
            </p>

            <Link to="/products">
              <button className="luxury-btn">
                Explore Collection
              </button>
            </Link>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="about-cta">

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 1,
            }}
          >
            <h2>
              Experience The Luxury
              Of THE NOVEMBER
            </h2>

            <p>
              Redefine your wardrobe
              with premium menswear.
            </p>

            <Link to="/">
              <button className="luxury-btn">
                Shop Now
              </button>
            </Link>
          </motion.div>
        </section>

      </div>

      {/* FOOTER */}
      <Footer />
    </>
  );
}