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
    // Cache DOM selections
    const hero = document.querySelector(".hero");
    const heroContent = document.querySelector(".hero-content");
    const heroText = document.querySelector(".hero-bg-text");
    const heroModel = document.querySelector(".hero-model");
    const logoContainer = document.querySelector(".hero-brand");

    let logoBottom = 260;
    let heroHeight = 700;
    let targetY = 44;
    let unscaledWidth = 477;

    const updateDimensions = () => {
      if (logoContainer) {
        logoBottom = logoContainer.offsetTop + logoContainer.offsetHeight;
      }
      if (hero) {
        heroHeight = hero.offsetHeight;
      }
      if (heroText) {
        unscaledWidth = heroText.scrollWidth || 477;
      }
      
      // Calculate targetY dynamically based on the final sticky header inner heights
      if (window.innerWidth <= 480) {
        targetY = 37; // 74px / 2
      } else if (window.innerWidth <= 992) {
        targetY = 40; // 80px / 2
      } else {
        targetY = 44; // 88px / 2
      }
    };

    // Run initially
    updateDimensions();
    // Run after a short delay to ensure assets are rendered
    const timer = setTimeout(updateDimensions, 100);

    // Position heroText at top 0 statically so we only animate translate3d
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
           HERO CONTENT
        ==================== */
        if (heroContent) {
          const moveY = scrollY * -0.08;
          heroContent.style.transform = `translate3d(-50%, ${moveY}px, 0)`;
          heroContent.style.opacity = Math.max(0, 1 - progress * 1.2);
        }

        /* ====================
           NOVEMBER TEXT
        ==================== */
        if (heroText) {
          /* START: position precisely below the logo bottom with responsive spacing */
          let startY;

          if (window.innerWidth <= 768) {
            startY = logoBottom + 30;
          } else {
            startY = logoBottom + 70;
          }

          /* SCROLL PROGRESS */
          const trigger = Math.min(scrollY / (heroHeight * 0.65), 1);

          /* SMOOTH EASING AND SCROLL SYNC INTERPOLATION */
          const eased = 3 * trigger * trigger - 2 * trigger * trigger * trigger; // smoothstep
          const scrollCorrection = (heroHeight * 0.65) * (trigger * trigger * trigger - 2 * trigger * trigger + trigger);

          /* MOVE TO HEADER */
          const currentY = startY + (targetY - startY) * eased - scrollCorrection;

          /* SHRINK */
          let targetWidth = 150;
          if (window.innerWidth <= 480) {
            targetWidth = 110;
          } else if (window.innerWidth <= 992) {
            targetWidth = 82;
          }

          const scale = 1 - (1 - targetWidth / unscaledWidth) * eased;

          // Position using hardware-accelerated translate3d
          heroText.style.transform = `translate3d(-50%, ${currentY}px, 0) translateY(-50%) scale(${scale})`;

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
          heroModel.style.transform = `translate3d(-50%, ${scrollY * 0.06}px, 0)`;
        }

        ticking = false;
      });
    };

    const handleResize = () => {
      updateDimensions();
      handleScroll();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
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