import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import "./SplashScreen.css";
import "./WelcomeScreen.css";

const WelcomeScreen = ({ name, isNew, onComplete }) => {
  const containerRef = useRef(null);
  const wordmarkWrapperRef = useRef(null);
  const emblemWrapperRef = useRef(null);
  const logoEmblemRef = useRef(null);
  const shineSweepRef = useRef(null);
  const topTextRef = useRef(null);
  const bottomWrapperRef = useRef(null);

  // Extract user's first name and make it uppercase for consistency with premium typography
  const getFirstName = () => {
    if (!name) return "USER";
    const parts = name.trim().split(/\s+/);
    return parts[0].toUpperCase();
  };
  const firstName = getFirstName();

  useEffect(() => {
    // Prevent scrolling while welcome screen is active
    document.body.style.overflow = "hidden";

    const container = containerRef.current;
    const wordmark = wordmarkWrapperRef.current;
    const emblem = emblemWrapperRef.current;
    const logoImg = logoEmblemRef.current;
    const shine = shineSweepRef.current;
    const topText = topTextRef.current;
    const bottomWrapper = bottomWrapperRef.current;

    if (!container || !wordmark || !emblem || !logoImg || !shine || !topText || !bottomWrapper) {
      return;
    }

    const letters = wordmark.querySelectorAll(".char-letter");

    // 1. Reset all elements to their natural layout positions to measure coordinates
    gsap.set(wordmark, { x: 0, scale: 1 });
    gsap.set(letters, { x: 0, opacity: 1, scale: 1 });
    gsap.set(emblem, { scale: 1 });
    gsap.set(logoImg, { scale: 1, opacity: 1 });

    // 2. Measure layout positions in natural state
    const wordmarkRect = wordmark.getBoundingClientRect();
    const wordmarkCenter = wordmarkRect.left + wordmarkRect.width / 2;

    const emblemRect = emblem.getBoundingClientRect();
    const emblemCenter = emblemRect.left + emblemRect.width / 2;

    // Calculate shift needed to center the emblem initially
    const initialWordmarkShift = wordmarkCenter - emblemCenter;

    // Calculate translations for each letter to stack directly behind the emblem's center
    const lettersData = Array.from(letters).map((letter) => {
      const letterRect = letter.getBoundingClientRect();
      const letterCenter = letterRect.left + letterRect.width / 2;
      return {
        el: letter,
        dx: emblemCenter - letterCenter,
      };
    });

    // Calculate scale factor for initial emblem size dynamically
    const initialSize = Math.max(160, Math.min(window.innerWidth * 0.2, 240));
    const finalSize = Math.max(48, Math.min(window.innerWidth * 0.06, 92));
    const scaleFactor = initialSize / finalSize;

    // 3. Set initial states for animation (emblem centered and scaled large, letters hidden behind emblem)
    gsap.set(wordmark, { x: initialWordmarkShift, scale: 0.95 });
    gsap.set(emblem, { scale: 1 });

    lettersData.forEach((item) => {
      gsap.set(item.el, { x: item.dx, opacity: 0, scale: 0.4 });
    });

    gsap.set(logoImg, { scale: 1, opacity: 0 });
    gsap.set(topText, { opacity: 0, y: -15 });
    gsap.set(bottomWrapper, { opacity: 0, y: 15 });
    gsap.set(shine, { xPercent: -150 });

    // 4. Create Timeline (Runs in exactly 2.0 seconds)
    const tl = gsap.timeline({
      onComplete: () => {
        // Restore body scroll
        document.body.style.overflow = "";
        if (onComplete) onComplete();
      },
    });

    // Step A: Logo Emblem softly fades in (0.0s - 0.4s)
    tl.to(logoImg, {
      opacity: 1,
      duration: 1.4,
      ease: "power2.out",
    });

    // Step B: Slow cinematic zoom & letter expansion (0.3s - 1.2s)
    // 1. Zoom in the entire wordmark wrapper (overall scale increases)
    tl.to(
      wordmark,
      {
        scale: 1.05,
        duration: 0.9,
        ease: "power2.out",
      },
      "morph"
    );

    // 2. Scale the emblem image from 1 down to finalScale
    const finalScale = 1 / scaleFactor;
    tl.to(
      logoImg,
      {
        scale: finalScale,
        duration: 0.9,
        ease: "power3.inOut",
      },
      "morph"
    );

    // 3. Shift the wordmark container so the resulting full wordmark ends up perfectly centered
    tl.to(
      wordmark,
      {
        x: 0,
        duration: 0.9,
        ease: "power3.inOut",
      },
      "morph"
    );

    // 4. Slide letters out from the emblem center to their respective positions
    lettersData.forEach((item) => {
      tl.to(
        item.el,
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.inOut",
        },
        "morph"
      );
    });

    // Step C: Top text and Bottom wrapper fade in with soft motion (1.0s - 1.4s)
    tl.to(
      [topText, bottomWrapper],
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
      },
      "tagline"
    );

    // Step D: Subtle champagne-gold shine sweeps across using GPU translateX (1.2s - 1.7s)
    tl.to(
      shine,
      {
        xPercent: 150,
        duration: 0.5,
        ease: "power2.inOut",
      },
      "sweep"
    );

    // Step E: Hold final welcome screen briefly (1.7s - 1.85s)
    tl.to({}, { duration: 0.15 });

    // Step F: Fade out the entire welcome screen (1.85s - 2.0s)
    tl.to(container, {
      opacity: 0,
      duration: 0.15,
      ease: "power2.out",
    });

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, [onComplete, isNew, firstName]);

  return (
    <div className="splash-screen welcome-screen" ref={containerRef}>
      <div className="splash-container">
        
        {/* Top Text displaying welcome context */}
        <div className="welcome-top-text" ref={topTextRef}>
          {isNew ? "WELCOME TO" : "WELCOME BACK"}
        </div>

        {/* Brand Container containing the wordmark and the sweep overlay */}
        <div className="splash-brand-wrapper">
          
          <div className="splash-wordmark-container" ref={wordmarkWrapperRef}>
            {/* Letter N */}
            <div className="char-wrapper">
              <span className="char char-letter">N</span>
            </div>

            {/* Emblem (serves as O) */}
            <div className="emblem-wrapper" ref={emblemWrapperRef}>
              <img
                src="/logo-emblem.svg"
                alt="NOVEMBER Emblem"
                className="logo-emblem"
                ref={logoEmblemRef}
              />
            </div>

            {/* Letters V E M B E R */}
            <div className="rest-letters-wrapper">
              <div className="char-wrapper">
                <span className="char char-letter">V</span>
              </div>
              <div className="char-wrapper">
                <span className="char char-letter">E</span>
              </div>
              <div className="char-wrapper">
                <span className="char char-letter">M</span>
              </div>
              <div className="char-wrapper">
                <span className="char char-letter">B</span>
              </div>
              <div className="char-wrapper">
                <span className="char char-letter">E</span>
              </div>
              <div className="char-wrapper">
                <span className="char char-letter">R</span>
              </div>
            </div>
          </div>

          {/* Shine Sweep Overlay */}
          <div className="shine-sweep" ref={shineSweepRef}></div>

        </div>

        {/* Bottom wrapper displaying either user name (returning) or brand + tagline (new) */}
        <div className="welcome-bottom-wrapper" ref={bottomWrapperRef}>
          <h2 className="welcome-bottom-text">
            {isNew ? "NOVEMBER" : firstName}
          </h2>

          {isNew && (
            <div className="splash-tagline-wrapper" style={{ marginTop: 0 }}>
              <div className="splash-divider-container">
                <div className="splash-divider-line"></div>
                <div className="splash-divider-diamond">♦</div>
                <div className="splash-divider-line"></div>
              </div>
              <p className="splash-tagline-text">
                Crafted for Elegance
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default WelcomeScreen;
