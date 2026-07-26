import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import "./SplashScreen.css";

const SplashScreen = ({ onComplete }) => {
  const containerRef = useRef(null);
  const emblemWrapperRef = useRef(null);
  const logoEmblemRef = useRef(null);
  const wordmarkRef = useRef(null);
  const taglineWrapperRef = useRef(null);

  useEffect(() => {
    // Prevent scrolling while splash screen is active
    document.body.style.overflow = "hidden";

    const container = containerRef.current;
    const emblem = emblemWrapperRef.current;
    const logoImg = logoEmblemRef.current;
    const wordmark = wordmarkRef.current;
    const tagline = taglineWrapperRef.current;

    let tl;
    let active = true;

    document.fonts.ready.then(() => {
      if (!active) return;
      // 1. Reset all elements to initial state for animation
      gsap.set(container, { opacity: 1 });
      gsap.set(emblem, { opacity: 0, scale: 1.15 });
      gsap.set(logoImg, { opacity: 1 });
      gsap.set(tagline, { opacity: 0, y: 12 });

      const chars = wordmark.querySelectorAll(".splash-char");
      gsap.set(chars, { opacity: 0, y: 15, scale: 0.92 });

      // 2. Create high-performance GSAP Timeline
      tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          if (onComplete) onComplete();
        },
      });

      // Step B: Logo Emblem fades in and scales down to normal size
      tl.to(emblem, {
        opacity: 1,
        scale: 1.0,
        duration: 1.2,
        ease: "power3.out",
        force3D: true,
      }, "start+=0.15");

      // Step D: Staggered fade-in of wordmark letters with a soft slide-up
      tl.to(chars, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.04,
        ease: "power3.out",
        force3D: true,
      }, "start+=0.5");

      // Step E: Tagline and Divider fade in
      tl.to(tagline, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        force3D: true,
      }, "start+=1.0");

      // Step F: Hold final splash screen frame
      tl.to({}, { duration: 0.5 });

      // Step G: Exit transition (Seamless fade out and lift contents)
      tl.to(container, {
        opacity: 0,
        y: -15,
        pointerEvents: "none",
        duration: 0.45,
        ease: "power2.inOut",
        force3D: true,
      }, "exit");
    });

    return () => {
      active = false;
      if (tl) tl.kill();
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  // Split wordmark into letters for staggered animation
  const wordmarkText = "THE NOVEMBER";

  return (
    <div className="splash-screen" ref={containerRef}>
      <div className="splash-container">
        
        {/* Emblem Container */}
        <div className="splash-emblem-container" ref={emblemWrapperRef}>
          <img
            src="/logo.png"
            alt="THE NOVEMBER Emblem"
            className="logo-emblem"
            ref={logoEmblemRef}
          />
        </div>

        {/* Brand Wordmark (Serif Gold Header) */}
        <h1 className="splash-wordmark" ref={wordmarkRef}>
          {wordmarkText.split("").map((char, index) => {
            if (char === " ") {
              return (
                <span key={index} className="splash-char-space">
                  &nbsp;
                </span>
              );
            }
            return (
              <span key={index} className="splash-char">
                {char}
              </span>
            );
          })}
        </h1>

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