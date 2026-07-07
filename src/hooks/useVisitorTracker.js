import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

// Helper to generate a simple unique identifier
const generateUUID = (prefix) => {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
};

export default function useVisitorTracker() {
  const location = useLocation();
  const lastPath = useRef("");

  useEffect(() => {
    // 1. Initialize or fetch device ID (persists in localStorage)
    let deviceId = localStorage.getItem("visitorDeviceId");
    if (!deviceId) {
      deviceId = generateUUID("dev");
      localStorage.setItem("visitorDeviceId", deviceId);
    }

    // 2. Initialize or fetch session ID (clears when browser tab is closed)
    let sessionId = sessionStorage.getItem("visitorSessionId");
    if (!sessionId) {
      sessionId = generateUUID("sess");
      sessionStorage.setItem("visitorSessionId", sessionId);
    }

    // 3. Retrieve user profile info (if logged in) to pass gender or UID
    let userGender = null;
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        // Fallback: Check if user profile has gender, otherwise pass uid to let backend estimate deterministically
        userGender = user.gender || null;
      }
    } catch (e) {
      console.error("Error reading user from localStorage:", e);
    }

    const BACKEND = `http://${window.location.hostname}:5000`;

    // 4. Tracking function
    const trackPageview = async (actionText = null) => {
      try {
        await axios.post(`${BACKEND}/api/analytics/track`, {
          sessionId,
          deviceId,
          path: location.pathname + location.search,
          referrer: document.referrer || "",
          action: actionText,
          userGender
        });
      } catch (err) {
        console.error("Visitor tracking logging failed:", err);
      }
    };

    // Avoid duplicate tracking logs for the exact same path hit instantly
    const currentFullPage = location.pathname + location.search;
    if (lastPath.current !== currentFullPage) {
      lastPath.current = currentFullPage;
      trackPageview();
    }

    // 5. Keep-Alive / Duration Update Ping
    // Send a update ping every 30 seconds to keep the active status alive and update duration
    const interval = setInterval(() => {
      trackPageview("Browsing");
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [location]);
}
