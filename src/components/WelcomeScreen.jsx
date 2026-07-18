import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import "./WelcomeScreen.css";

const WelcomeScreen = ({ name, isNew, onComplete }) => {
  const containerRef = useRef(null);
  const messageRef = useRef(null);
  const submessageRef = useRef(null);

  useEffect(() => {
    // Prevent scrolling while welcome screen is active
    document.body.style.overflow = "hidden";

    const container = containerRef.current;
    const message = messageRef.current;
    const submessage = submessageRef.current;

    if (!container || !message) {
      return;
    }

    // Reset initial positions for animation
    gsap.set(container, { opacity: 1 });
    gsap.set(message, { opacity: 0, y: 20 });
    if (submessage) {
      gsap.set(submessage, { opacity: 0, y: 15 });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        if (onComplete) onComplete();
      },
    });

    // Step A: Welcome Message fades in and lifts up
    tl.to(message, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: "power3.out",
    });

    // Step B: Submessage fades in and lifts up
    if (submessage) {
      tl.to(
        submessage,
        {
          opacity: 0.7,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.6"
      );
    }

    // Step C: Hold screen briefly (original slow tempo hold of 1.8s)
    tl.to({}, { duration: 1.8 });

    // Step D: Fade out the entire welcome screen
    tl.to(container, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.inOut",
    });

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, [onComplete, isNew]);

  return (
    <div className="welcome-screen" ref={containerRef}>
      <div className="welcome-container">
        
        {/* Subtle radial glow overlay */}
        <div className="bg-glow"></div>
        
        {/* Welcome Messages */}
        <div className="welcome-message-wrap">
          <h2 className="welcome-message" ref={messageRef}>
            {isNew ? "Welcome to NOVEMBER" : `Welcome Back, ${name}`}
          </h2>
          {isNew && (
            <p className="welcome-submessage" ref={submessageRef}>
              Your account has been created successfully.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default WelcomeScreen;
