import { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { ProductProvider } from "./context/ProductContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";

// Splash
import SplashScreen from "./components/SplashScreen";

// Components
import Header from "./components/Header";
import Hero from "./components/Hero";
import FeaturedCategories from "./components/FeaturedCategories";
import Bestsellers from "./components/Bestsellers";
import LuxuryCollections from "./components/LuxuryCollections";
import BrandStory from "./components/BrandStory";
import Footer from "./components/Footer";

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


// Admin Pages
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
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
        <FeaturedCategories />
        <Bestsellers />
        <LuxuryCollections />
        <BrandStory />
        <Footer />
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

  const shouldShowSplash = () => {
    const nav =
      performance.getEntriesByType(
        "navigation"
      )[0];

    const isReload =
      nav?.type === "reload";

    const firstVisit =
      !sessionStorage.getItem(
        "appLoaded"
      );

    return (
      firstVisit || isReload
    );
  };

  const [showSplash, setShowSplash] =
    useState(shouldShowSplash);
  const [splashUnmounted, setSplashUnmounted] =
    useState(!shouldShowSplash());

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("appLoaded", "true");
    setSplashUnmounted(true);
  };

  return (
    <ProductProvider>
    <CartProvider>
    <WishlistProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <Toaster position="bottom-right" reverseOrder={false} />

        {!splashUnmounted && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}

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
              element={<AdminDashboard />}
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