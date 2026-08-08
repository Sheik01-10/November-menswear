import { createAuthClient } from "better-auth/react";

const isLocalhost = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || 
   window.location.hostname === "127.0.0.1" || 
   window.location.hostname.startsWith("10.") || 
   window.location.hostname.startsWith("192.168."));

export const authClient = createAuthClient({
  baseURL: isLocalhost 
    ? `http://${window.location.hostname}:5000` 
    : (import.meta.env.VITE_API_URL || `https://${window.location.hostname}`),
  fetchOptions: {
    headers: {
      get Authorization() {
        const token = sessionStorage.getItem("sessionToken");
        return token ? `Bearer ${token}` : "";
      }
    }
  }
});
