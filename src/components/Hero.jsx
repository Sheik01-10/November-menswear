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
    let logoBottom = 260;

    const updateDimensions = () => {
      const logoContainer = document.querySelector(".hero-brand");
      if (logoContainer) {
        logoBottom = logoContainer.offsetTop + logoContainer.offsetHeight;
      }
    };

    // Run initially
    updateDimensions();
    // Run after a short delay to ensure assets are rendered
    const timer = setTimeout(updateDimensions, 100);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const hero = document.querySelector(".hero");
      const heroContent = document.querySelector(".hero-content");
      const heroText = document.querySelector(".hero-bg-text");
      const heroModel = document.querySelector(".hero-model");

      if (!hero) return;

      const heroHeight = hero.offsetHeight;
      const progress = Math.min(scrollY / heroHeight, 1);

      /* ====================
         HERO CONTENT
      ==================== */
      if (heroContent) {
        const moveY = scrollY * -0.08;
        heroContent.style.transform = `translate(-50%, ${moveY}px)`;
        heroContent.style.opacity = Math.max(0, 1 - progress * 1.2);
      }

      /* ====================
         NOVEMBER TEXT
      ==================== */
      if (heroText) {
        /* START: position precisely below the logo bottom with responsive spacing */
        const spacing = window.innerWidth <= 768 ? 16 : 32;
        let startY;

if (window.innerWidth <= 768) {
  startY = logoBottom + 30;
} else {
  startY = logoBottom + 70;
}

        /* HEADER CENTER TARGET (dynamic computation based on the actual header rect) */
        let targetY = 44;
        const headerInner = document.querySelector(".lux-header-inner");
        if (headerInner) {
          const rect = headerInner.getBoundingClientRect();
          targetY = rect.top + rect.height / 2;
        } else {
          if (window.innerWidth <= 480) {
            targetY = 37;
          } else if (window.innerWidth <= 992) {
            targetY = 40;
          }
        }

        /* SCROLL PROGRESS */
        const trigger = Math.min(scrollY / (heroHeight * 0.65), 1);

        /* SMOOTH EASING */
        const eased = 1 - Math.pow(1 - trigger, 4);

        /* MOVE TO HEADER */
        const currentY = startY + (targetY - startY) * eased;

        /* SHRINK */
        let targetWidth = 150;
        if (window.innerWidth <= 480) {
          targetWidth = 110;
        } else if (window.innerWidth <= 992) {
          targetWidth = 82;
        }

        const unscaledWidth = heroText.scrollWidth || 477;
        const targetScale = targetWidth / unscaledWidth;

        const scale = 1 - (1 - targetScale) * eased;

        heroText.style.position = "fixed";
        heroText.style.left = "50%";
        heroText.style.top = `${currentY}px`;
        heroText.style.transform = `translate(-50%, -50%) scale(${scale})`;

        // Hide hero text only when we scroll past the Hero section completely so the header logo takes over
        if (scrollY >= heroHeight) {
          heroText.style.opacity = "0";
          heroText.style.visibility = "hidden";
        } else {
          heroText.style.opacity = "1";
          heroText.style.visibility = "visible";
        }

        // Dynamic layering: behind the model when in the Hero, in front of the header when scrolled
        if (eased > 0.95) {
          heroText.style.zIndex = "1001";
        } else {
          heroText.style.zIndex = "2";
        }

        // Keep the color of the NOVEMBER text matching the gold logo color
        heroText.style.color = "#c9a96a";
      }

      /* ====================
         MODEL PARALLAX
      ==================== */
      if (heroModel) {
        heroModel.style.transform = `translateX(-50%) translateY(${scrollY * 0.06}px)`;
      }
    };

    const handleResize = () => {
      updateDimensions();
      handleScroll();
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Initial positioning
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="hero">
      {/* Background Banners */}
      {banners && banners.length > 0 ? (
        banners.map((banner, index) => (
          <div
            key={banner._id || index}
            className={`hero-bg-image ${index === currentBannerIndex ? "active" : ""}`}
            style={{
              backgroundImage: `url(${banner.image})`,
              position: "absolute",
              inset: 0,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "opacity 1.5s ease-in-out",
              opacity: index === currentBannerIndex ? 1 : 0,
              zIndex: 0,
            }}
          />
        ))
      ) : (
        <div
          className="hero-bg-image active"
          style={{
            background: "var(--bg-primary)",
            position: "absolute",
            inset: 0,
            zIndex: 0,
          }}
        />
      )}

      {/* Overlay */}
      <div className="hero-overlay" style={{ zIndex: 1 }}></div>

      <div className="hero-brand" style={{ zIndex: 4 }}>
        <img
          src="/logo.svg"
          alt="November"
          className="hero-logo"
        />
      </div>

      <h1 className="hero-bg-text" style={{ zIndex: 2 }}>
        NOVEMBER
      </h1>

      {/* CONTENT */}
      <div className="hero-content" style={{ zIndex: 5 }}>
        
        <div className="hero-divider-container">
          <div className="hero-divider-line"></div>
          <div className="hero-divider-diamond">♦</div>
          <div className="hero-divider-line"></div>
        </div>

        <h2 className="hero-subtitle">
          {activeBanner?.subtitle || "CRAFTED FOR ELEGANCE"}
        </h2>

        <p className="hero-tagline">
          {activeBanner?.title || "Redefine your style"}
        </p>

        <div className="hero-buttons">
          <button className="primary-btn" onClick={handleCTAClick}>
            {activeBanner ? "DISCOVER" : "NEW DROP"} <span className="btn-arrow">→</span>
          </button>
          <button className="secondary-btn" onClick={handleSecondaryClick}>
            BEST SELLERS
          </button>
        </div>

      </div>

    </section>
  );
}