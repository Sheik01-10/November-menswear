import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { ProductProvider } from "./context/ProductContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import Cart from "./pages/Cart";

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
import About from "./components/About";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import WorkMode from "./pages/WorkMode";
import QuietLuxury from "./pages/QuietLuxury";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { Toaster } from "react-hot-toast";


// Admin Pages
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import useVisitorTracker from "./hooks/useVisitorTracker";

function AnalyticsTracker() {
  useVisitorTracker();
  return null;
}


/* ==========================
   HOME
========================== */

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

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("appLoaded", "true");
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

 return (
  <ProductProvider>
  <CartProvider>
  <WishlistProvider>
    <BrowserRouter>
      <AnalyticsTracker />
      <Toaster position="bottom-right" reverseOrder={false} />

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

    </BrowserRouter>
  </WishlistProvider>
  </CartProvider>
  </ProductProvider>
);
}

export default App;