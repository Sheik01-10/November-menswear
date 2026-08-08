import { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { ProductProvider } from "./context/ProductContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";

// Components
import Header from "./components/Header";
import Hero from "./components/Hero";

// Lazy below-the-fold components
const FeaturedCategories = lazy(() => import("./components/FeaturedCategories"));
const Bestsellers = lazy(() => import("./components/Bestsellers"));
const LuxuryCollections = lazy(() => import("./components/LuxuryCollections"));
const BrandStory = lazy(() => import("./components/BrandStory"));
const Footer = lazy(() => import("./components/Footer"));

// Lazy Pages
const About = lazy(() => import("./components/About"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const WorkMode = lazy(() => import("./pages/WorkMode"));
const QuietLuxury = lazy(() => import("./pages/QuietLuxury"));
const Contact = lazy(() => import("./pages/Contact"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Profile = lazy(() => import("./pages/Profile"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
import { Toaster } from "react-hot-toast";
import axios from "axios";
import { Navigate as RouterNavigate } from "react-router-dom";
import { authClient } from "./lib/auth-client";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

axios.defaults.withCredentials = true;

// Intercept axios requests to send tab-scoped session token
axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("sessionToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper route guards using sessionStorage and custom getMe endpoint
function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    axios.get(`${BACKEND}/api/users/me`).then((res) => {
      const user = res.data?.user;
      if (user) {
        const role = user.role || (user.isAdmin ? "admin" : "customer");
        if (role === "admin") {
          sessionStorage.setItem("role", "admin");
          sessionStorage.setItem("isAdmin", "true");
          sessionStorage.setItem("isStaff", "false");
        } else if (role === "staff") {
          sessionStorage.setItem("role", "staff");
          sessionStorage.setItem("isAdmin", "false");
          sessionStorage.setItem("isStaff", "true");
          setRedirectPath("/staff-dashboard");
        } else {
          setRedirectPath("/admin-login");
        }
      } else {
        setRedirectPath("/admin-login");
      }
      setChecking(false);
    }).catch(() => {
      setRedirectPath("/admin-login");
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "'Jost', sans-serif",
        letterSpacing: "3px",
        fontSize: "12px",
        textTransform: "uppercase"
      }}>
        Verifying Admin Session...
      </div>
    );
  }

  if (redirectPath) {
    return <RouterNavigate to={redirectPath} replace />;
  }

  return children;
}

function StaffRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    axios.get(`${BACKEND}/api/users/me`).then((res) => {
      const user = res.data?.user;
      if (user) {
        const role = user.role || (user.isAdmin ? "admin" : "customer");
        if (role === "staff") {
          sessionStorage.setItem("role", "staff");
          sessionStorage.setItem("isStaff", "true");
          sessionStorage.setItem("isAdmin", "false");
        } else if (role === "admin") {
          sessionStorage.setItem("role", "admin");
          sessionStorage.setItem("isStaff", "false");
          sessionStorage.setItem("isAdmin", "true");
          setRedirectPath("/admin-dashboard");
        } else {
          setRedirectPath("/admin-login");
        }
      } else {
        setRedirectPath("/admin-login");
      }
      setChecking(false);
    }).catch(() => {
      setRedirectPath("/admin-login");
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "'Jost', sans-serif",
        letterSpacing: "3px",
        fontSize: "12px",
        textTransform: "uppercase"
      }}>
        Verifying Staff Session...
      </div>
    );
  }

  if (redirectPath) {
    return <RouterNavigate to={redirectPath} replace />;
  }

  return children;
}

// Admin Pages
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const StaffDashboard = lazy(() => import("./admin/StaffDashboard"));
import useVisitorTracker from "./hooks/useVisitorTracker";

function AnalyticsTracker() {
  useVisitorTracker();
  return null;
}


/* ==========================
   HOME
/* ========================== */

function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <Suspense fallback={null}>
          <FeaturedCategories />
          <Bestsellers />
          <LuxuryCollections />
          <BrandStory />
          <Footer />
        </Suspense>
      </main>
    </>
  );
}

const LoadingFallback = () => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#ffffff",
    color: "#000000",
    fontFamily: "'Jost', sans-serif",
    letterSpacing: "3px",
    textTransform: "uppercase",
    fontSize: "12px",
    fontWeight: "500"
  }}>
    Loading...
  </div>
);

/* ==========================
   APP
========================== */

function App() {
  useEffect(() => {
    // Wait for critical resources, then hold the splash screen for 3 seconds before transition
    Promise.all([
      document.fonts.ready
    ]).then(() => {
      setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        if (splash) {
          splash.classList.add("fade-out");
          
          const handleTransitionEnd = () => {
            splash.remove();
            sessionStorage.setItem("appLoaded", "true");
          };
          
          splash.addEventListener("transitionend", handleTransitionEnd, { once: true });
          
          // Fallback safety timeout
          setTimeout(handleTransitionEnd, 600);
        }
      }, 2000); // 3-second duration
    });
  }, []);

  return (
    <ProductProvider>
    <CartProvider>
    <WishlistProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <Toaster position="bottom-right" reverseOrder={false} />

        <Suspense fallback={<LoadingFallback />}>
          <Routes>

            {/* HOME */}
            <Route
              path="/"
              element={
                <Home
                />
              }
            />

            {/* PRODUCTS */}
            <Route
              path="/products"
              element={<Products />}
            />

            <Route
              path="/product/:id"
              element={<ProductDetails />}
            />

            {/* COLLECTIONS */}
            <Route
              path="/work-mode"
              element={<WorkMode />}
            />

            <Route
              path="/quiet-luxury"
              element={<QuietLuxury />}
            />

            {/* ABOUT */}
            <Route
              path="/about"
              element={<About />}
            />

            {/* CONTACT */}
            <Route
              path="/contact"
              element={<Contact />}
            />

            {/* LOGIN */}
            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/signup"
              element={<Signup />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            {/* ADMIN */}
            <Route
              path="/admin-login"
              element={<AdminLogin />}
            />

            <Route
              path="/admin-dashboard/*"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route
              path="/staff-dashboard/*"
              element={
                <StaffRoute>
                  <StaffDashboard />
                </StaffRoute>
              }
            />
            
            <Route
              path="/wishlist"
              element={<Wishlist />}
            />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </Suspense>

      </BrowserRouter>
    </WishlistProvider>
    </CartProvider>
    </ProductProvider>
  );
}

export default App;