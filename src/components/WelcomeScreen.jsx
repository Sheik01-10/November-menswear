import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import "./SplashScreen.css";
import "./WelcomeScreen.css";

const WelcomeScreen = ({ name, isNew, onComplete }) => {
  const containerRef = useRef(null);
  const emblemWrapperRef = useRef(null);
  const logoEmblemRef = useRef(null);
  const sparkleRef = useRef(null);
  const wordmarkRef = useRef(null);
  const taglineWrapperRef = useRef(null);
  const topTextRef = useRef(null);

  // Extract user's first name and make it uppercase for consistency with premium typography
  const getFirstName = () => {
    if (!name) return "GUEST";
    const parts = name.trim().split(/\s+/);
    return parts[0].toUpperCase();
  };
  const firstName = getFirstName();

  useEffect(() => {
    // Prevent scrolling while welcome screen is active
    document.body.style.overflow = "hidden";

    const container = containerRef.current;
    const emblem = emblemWrapperRef.current;
    const logoImg = logoEmblemRef.current;
    const sparkle = sparkleRef.current;
    const wordmark = wordmarkRef.current;
    const tagline = taglineWrapperRef.current;
    const topText = topTextRef.current;

    let tl;
    let sparkleTween;
    let active = true;

    document.fonts.ready.then(() => {
      if (!active) return;
      // 1. Reset all elements to initial state for animation
      gsap.set(container, { opacity: 1 });
      gsap.set(topText, { opacity: 0, y: -12 });
      gsap.set(emblem, { opacity: 0, scale: 1.15 });
      gsap.set(logoImg, { opacity: 1 });
      gsap.set(sparkle, { opacity: 0, scale: 0, rotate: -45 });
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

      // Step A: Top welcome text fades in (start)
      tl.to(topText, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      }, "start");

      // Step B: Logo Emblem fades in and scales down to normal size
      tl.to(emblem, {
        opacity: 1,
        scale: 1.0,
        duration: 1.2,
        ease: "power3.out",
      }, "start+=0.15");

      // Step C: Sparkling lens flare glistens on the crest top-right circle
      tl.to(sparkle, {
        opacity: 1,
        scale: 1.0,
        rotate: 45,
        duration: 0.7,
        ease: "back.out(1.5)",
      }, "start+=0.8");

      // Continuous sparkle glimmer loop (independent of timeline so timeline can complete)
      sparkleTween = gsap.to(sparkle, {
        scale: 1.15,
        opacity: 0.85,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5,
      });

      // Step D: Staggered fade-in of wordmark letters with a soft slide-up
      tl.to(chars, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.04,
        ease: "power3.out",
      }, "start+=0.5");

      // Step E: Tagline/Name and Divider fade in
      tl.to(tagline, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      }, "start+=1.0");

      // Step F: Hold final welcome screen frame
      tl.to({}, { duration: 1.0 });

      // Step G: Exit transition (Seamless fade out and lift contents)
      tl.to(container, {
        opacity: 0,
        y: -15,
        pointerEvents: "none",
        duration: 0.45,
        ease: "power2.inOut",
      }, "exit");
    });

    return () => {
      active = false;
      if (tl) tl.kill();
      if (sparkleTween) sparkleTween.kill();
      document.body.style.overflow = "";
    };
  }, [onComplete, firstName]);

  const wordmarkText = "THE NOVEMBER";

  return (
    <div className="splash-screen welcome-screen" ref={containerRef}>
      <div className="splash-container">
        
        {/* Welcome context text */}
        <div className="welcome-top-text" ref={topTextRef}>
  <span className="welcome-heading">
    {isNew ? "WELCOME TO" : "WELCOME BACK"}
  </span>
</div>

        {/* Emblem Container with Sparkle */}
        <div className="splash-emblem-container" ref={emblemWrapperRef}>
          <img
            src="/logo.png"
            alt="THE NOVEMBER Emblem"
            className="logo-emblem"
            ref={logoEmblemRef}
          />
          
          {/* Sparkle SVG */}
          <svg className="splash-sparkle" viewBox="0 0 100 100" fill="none" ref={sparkleRef}>
            <path 
              d="M50 0 C50 35 35 50 0 50 C35 50 50 65 50 100 C50 65 65 50 100 50 C65 50 50 35 50 0 Z" 
              fill="#ffffff" 
            />
            <circle cx="50" cy="50" r="12" fill="#ffffff" filter="blur(3px)" opacity="0.8" />
            <circle cx="50" cy="50" r="4" fill="#ffffff" />
          </svg>
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

        {/* Tagline/Name and Dividers */}
        <div className="splash-tagline-wrapper" ref={taglineWrapperRef}>
          <div className="splash-divider-container">
            <div className="splash-divider-line"></div>
            <div className="splash-divider-diamond">♦</div>
            <div className="splash-divider-line"></div>
          </div>
          <p className="splash-tagline-text">
  {isNew ? (
    <span className="welcome-tagline">
      Crafted for Elegance
    </span>
  ) : (
    <span className="welcome-user">
      {firstName}
    </span>
  )}
</p>
        </div>

      </div>
    </div>
  );
};

export default WelcomeScreen;
