import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import "./SplashScreen.css";

const SplashScreen = ({ onComplete }) => {
  const containerRef = useRef(null);
  const wordmarkWrapperRef = useRef(null);
  const emblemWrapperRef = useRef(null);
  const logoEmblemRef = useRef(null);
  const taglineWrapperRef = useRef(null);
  const shineSweepRef = useRef(null);

  useEffect(() => {
    // Prevent scrolling while splash screen is active
    document.body.style.overflow = "hidden";

    const container = containerRef.current;
    const wordmark = wordmarkWrapperRef.current;
    const emblem = emblemWrapperRef.current;
    const logoImg = logoEmblemRef.current;
    const tagline = taglineWrapperRef.current;
    const shine = shineSweepRef.current;

    let tl;

    document.fonts.ready.then(() => {
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
      gsap.set(tagline, { opacity: 0, y: 15 });
      gsap.set(shine, { xPercent: -150 });

      // 4. Create Timeline (Runs in exactly 2.0 seconds)
      tl = gsap.timeline({
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

      // Step C: Tagline fades in directly beneath with soft upward motion (1.0s - 1.4s)
      tl.to(
        tagline,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
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

      // Step E: Hold final splash screen briefly (1.7s - 1.85s)
      tl.to({}, { duration: 0.15 });

      // Step F: Fade out the entire splash screen (1.85s - 2.0s)
      tl.to(container, {
        opacity: 0,
        duration: 0.15,
        ease: "power2.out",
      });

      // Visual Testing Helper: check URL query parameter to pause at specific states (adjusted for 2s timing)
      const urlParams = new URLSearchParams(window.location.search);
      const frame = urlParams.get("frame");
      if (frame) {
        if (frame === "emblem") {
          tl.seek(0.3).pause();
        } else if (frame === "morph") {
          tl.seek(0.8).pause();
        } else if (frame === "tagline") {
          tl.seek(1.3).pause();
        } else if (frame === "final") {
          tl.seek(1.7).pause();
        }
      }
    });

    return () => {
      if (tl) tl.kill();
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  return (
    <div className="splash-screen" ref={containerRef}>
      <div className="splash-container">
        
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

        {/* Tagline and Dividers */}
        <div className="splash-tagline-wrapper" ref={taglineWrapperRef}>
          <div className="splash-divider-container">
            <div className="splash-divider-line"></div>
            <div className="splash-divider-diamond">♦</div>
            <div className="splash-divider-line"></div>
          </div>
          <p className="splash-tagline-text">
            Crafted for Elegance
          </p>
        </div>

      </div>
    </div>
  );
};

export default SplashScreen;