import "./Hero.css";
import { useEffect, useState } from "react";
import { useProducts } from "../context/ProductContext";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const { banners } = useProducts();
  const navigate = useNavigate();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const activeBanner = banners && banners.length > 0 ? banners[currentBannerIndex] : null;

  const handleCTAClick = () => {
    if (activeBanner && activeBanner.link) {
      if (activeBanner.link.startsWith("http")) {
        window.location.href = activeBanner.link;
      } else {
        navigate(activeBanner.link);
      }
    } else {
      navigate("/products");
    }
  };

  const handleSecondaryClick = () => {
    navigate("/products");
  };

  useEffect(() => {
    const hero = document.querySelector(".hero");
    const heroContent = document.querySelector(".hero-content");
    const heroText = document.querySelector(".hero-bg-text");
    const spacer = document.querySelector(".hero-title-spacer");
    const scrollIndicator = document.querySelector(".hero-scroll-indicator");

    let startY = 300;
    let heroHeight = 700;
    let targetY = 44;
    let unscaledWidth = 477;

    const updateDimensions = () => {
      if (hero) {
        heroHeight = hero.offsetHeight;
      }
      if (heroText) {
        const prevTransform = heroText.style.transform;
        heroText.style.transform = "none";
        unscaledWidth = heroText.scrollWidth || 477;
        heroText.style.transform = prevTransform;
      }
      if (spacer) {
        const rect = spacer.getBoundingClientRect();
        // Since heroText is position: fixed, top: 0, left: 50%
        // Y translation centers the text vertically on the spacer
        startY = rect.top + rect.height / 2 + window.scrollY;
      }
      
      if (window.innerWidth <= 480) {
        targetY = 37;
      } else if (window.innerWidth <= 992) {
        targetY = 40;
      } else {
        targetY = 44;
      }
    };

    updateDimensions();
    const timer = setTimeout(updateDimensions, 200);

    if (heroText) {
      heroText.style.position = "fixed";
      heroText.style.left = "50%";
      heroText.style.top = "0";
    }

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        if (!hero) {
          ticking = false;
          return;
        }

        const progress = Math.min(scrollY / heroHeight, 1);

        /* ====================
           HERO CONTENT FADE
        ==================== */
        if (heroContent) {
          const moveY = scrollY * -0.05;
          heroContent.style.transform = `translate3d(0, ${moveY}px, 0)`;
          heroContent.style.opacity = Math.max(0, 1 - progress * 1.5);
        }

        /* ====================
           SCROLL INDICATOR FADE
        ==================== */
        if (scrollIndicator) {
          if (scrollY > 15) {
            scrollIndicator.classList.add("hidden");
          } else {
            scrollIndicator.classList.remove("hidden");
          }
        }

        /* ====================
           NOVEMBER TEXT
        ==================== */
        if (heroText) {
          const trigger = Math.min(scrollY / (heroHeight * 0.5), 1);
          const eased = 3 * trigger * trigger - 2 * trigger * trigger * trigger;

          // Interpolate between scrolling naturally and sticking in header
          const currentY = (startY - scrollY) * (1 - eased) + targetY * eased;

          let targetWidth = 150;
          if (window.innerWidth <= 480) {
            targetWidth = 110;
          } else if (window.innerWidth <= 992) {
            targetWidth = 82;
          }

          const scale = 1 - (1 - targetWidth / unscaledWidth) * eased;

          heroText.style.transform = `translate3d(-50%, ${currentY}px, 0) translateY(-50%) scale(${scale})`;

          if (scrollY >= heroHeight) {
            heroText.style.opacity = "0";
            heroText.style.visibility = "hidden";
          } else {
            heroText.style.opacity = "1";
            heroText.style.visibility = "visible";
          }

          if (eased > 0.95) {
            heroText.style.zIndex = "1001";
          } else {
            heroText.style.zIndex = "2";
          }

          heroText.style.color = "#c9a96a";
          heroText.style.webkitTextFillColor = "#c9a96a";
        }

        ticking = false;
      });
    };

    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };

    const handleResize = debounce(() => {
      updateDimensions();
      handleScroll();
    }, 100);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="hero">
      {/* Background Overlay Texture */}
      <div className="hero-texture-overlay"></div>

      {/* Floating Header Text */}
      <h1 className="hero-bg-text">
        THE NOVEMBER
      </h1>

      {/* CONTENT STACK */}
      <div className="hero-content">
        {/* Logo Emblem */}
        <div className="hero-emblem-container">
          <img
            src="/logo.png"
            alt="The November Logo"
            className="hero-emblem"
          />
        </div>

        {/* Invisible spacer holding flow space for the floating brand name */}
        <div className="hero-title-spacer">THE NOVEMBER</div>
        
        {/* Gold divider line with center diamond */}
        <div className="hero-divider-container">
          <div className="hero-divider-line"></div>
          <div className="hero-divider-diamond">♦</div>
          <div className="hero-divider-line"></div>
        </div>

        {/* Subtitle */}
        <h2 className="hero-subtitle">
          {activeBanner?.subtitle || "CRAFTED FOR ELEGANCE"}
        </h2>

        {/* Tagline */}
        <p className="hero-tagline">
          {activeBanner?.title || "Redefine your style"}
        </p>

        {/* Buttons */}
        <div className="hero-buttons">
          <button className="primary-btn" onClick={handleCTAClick}>
            {activeBanner ? "DISCOVER" : "NEW DROP"} <span className="btn-arrow">→</span>
          </button>
          <button className="secondary-btn" onClick={handleSecondaryClick}>
            BEST SELLERS
          </button>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="hero-scroll-indicator">
        <div className="mouse-wheel">
          <div className="scroll-dot"></div>
        </div>
        <span className="scroll-text">SCROLL TO EXPLORE</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}