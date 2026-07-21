import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./Header.css";
import AnnouncementBar from "./AnnouncementBar";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase/firebase";

import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";

export default function Header() {

  const { pathname } = useLocation();

  const [menuOpen,
    setMenuOpen] =
    useState(false);

  const [productsSubmenuOpen,
    setProductsSubmenuOpen] =
    useState(false);

  const [profileOpen,
    setProfileOpen] =
    useState(false);

  const [showCenterLogo,
    setShowCenterLogo] =
    useState(false);

  const [showHeader,
    setShowHeader] =
    useState(true);

  const [showBar,
    setShowBar] =
    useState(true);

  const navigate =
  useNavigate();

  const { wishlistCount } = useWishlist();
  const { totalItems } = useCart();

  const [user, setUser] =
  useState(null);


  useEffect(() => {
  const unsubscribe =
    onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(
          currentUser
        );
      }
    );

  return () =>
    unsubscribe();
}, []);


  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);

      localStorage.removeItem(
        "user"
      );

      setProfileOpen(false);

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }, [navigate]);

  // Refs for performant scroll handling
  const lastScrollY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const ticking = useRef(false);
  const showHeaderRef = useRef(showHeader);
  const showBarRef = useRef(showBar);
  const showCenterRef = useRef(showCenterLogo);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { products } = useProducts();

  const filteredSearchProducts = useMemo(() => {
    return searchQuery.trim() === ""
      ? []
      : (products || []).filter(prod =>
          prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (prod.category && prod.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
  }, [searchQuery, products]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, navigate]);

  const handlePopularTagClick = useCallback((tag) => {
    setSearchOpen(false);
    navigate(`/products?search=${encodeURIComponent(tag)}`);
  }, [navigate]);

  const handleProductClick = useCallback((prod) => {
    setSearchOpen(false);
    navigate(`/products?search=${encodeURIComponent(prod.name)}`);
  }, [navigate]);

  const handleViewAllResults = useCallback(() => {
    setSearchOpen(false);
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  }, [searchQuery, navigate]);

  useEffect(() => {
    if (menuOpen || searchOpen) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
    return () => {
      document.body.classList.remove("drawer-open");
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
    setProductsSubmenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      setProductsSubmenuOpen(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    // sync refs to latest state on mount
    showHeaderRef.current = showHeader;
    showBarRef.current = showBar;
    showCenterRef.current = showCenterLogo;

    let hero = document.querySelector(".hero");
    let heroHeight = hero ? hero.offsetHeight : 0;

    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };

    const handleResize = debounce(() => {
      if (!hero) {
        hero = document.querySelector(".hero");
      }
      if (hero) {
        heroHeight = hero.offsetHeight;
      }
    }, 150);

    window.addEventListener("resize", handleResize);

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        const isHomePage =
  pathname === "/";

        /* CENTER LOGO */

        const shouldShowCenter =
  !isHomePage ||
  currentScrollY >
    heroHeight;

        if (
          shouldShowCenter !==
          showCenterRef.current
        ) {
          showCenterRef.current =
            shouldShowCenter;

          setShowCenterLogo(
            shouldShowCenter
          );
        }

        // BAR: only visible at the very top
        const isTop = currentScrollY < 50;
        if (isTop !== showBarRef.current) {
          showBarRef.current = isTop;
          setShowBar(isTop);
        }

        // HEADER hide/show on scroll direction with small hysteresis
        // Force header to remain visible when on the home page and within the Hero section
        if (
          pathname === "/" &&
          currentScrollY <= heroHeight
        ) {
          if (!showHeaderRef.current) {
            showHeaderRef.current = true;
            setShowHeader(true);
          }
        } else if (isTop) {
          if (!showHeaderRef.current) {
            showHeaderRef.current = true;
            setShowHeader(true);
          }
        } else if (currentScrollY > lastScrollY.current + 8) {
          if (showHeaderRef.current) {
            showHeaderRef.current = false;
            setShowHeader(false);
          }
        } else if (currentScrollY < lastScrollY.current - 8) {
          if (!showHeaderRef.current) {
            showHeaderRef.current = true;
            setShowHeader(true);
          }
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
    };

  }, [pathname]);

  return (
    <>
      {/* Announcement Bar */}
      {pathname === "/" && (
  <AnnouncementBar
    showBar={showBar}
  />
)}

      {/* HEADER */}
      <header
        className={`lux-header
  ${
    pathname !== "/" ||
    showCenterLogo
      ? "sticky-header"
      : ""
  }
  ${
    showHeader
      ? "header-show"
      : "header-hide"
  }
  ${
    showBar &&
    pathname === "/"
      ? "header-with-bar"
      : "header-no-bar"
  }`}
      >
        <div className="lux-header-inner">

          {/* LEFT: NAV LINKS & HAMBURGER */}
          <div className="header-left">
            <button className="desktop-menu-btn" onClick={() => setMenuOpen(true)}>
              <Menu size={22} />
            </button>

            <nav className="lux-nav">
              <Link to="/">
                Home
              </Link>

              <Link to="/about">
                About
              </Link>

              <Link to="/contact">
                Contact
              </Link>
            </nav>
          </div>

          {/* CENTER */}
          <div className="header-center">

  {(pathname !== "/" ||
    showCenterLogo) && (

    <Link
      to="/"
      className="center-logo"
    >
      <img
        src="/logo.png"
        alt="November"
        className="center-logo-img"
      />
    </Link>

  )}

</div>

          {/* DESKTOP ICONS */}
          <div className="lux-icons">

            <button className="icon-btn" onClick={() => setSearchOpen(true)}>
              <Search size={22} />
            </button>

            <Link
  to="/wishlist"
  className="icon-btn cart-btn"
>

  <Heart size={22} />

  {wishlistCount > 0 && (
    <span className="cart-count">
      {wishlistCount}
    </span>
  )}

</Link>

          <Link
  to="/cart"
  className="icon-btn cart-btn"
>
  <ShoppingBag size={22} />

  {totalItems > 0 && (
    <span className="cart-count">
      {totalItems}
    </span>
  )}
</Link>

            <div className="profile-wrapper">

              <button
  className="icon-btn"
  onClick={() =>
    setProfileOpen(
      !profileOpen
    )
  }
>
  {user ? (
    <img
      src={
        user.photoURL ||
        "/default-avatar.png"
      }
      alt="Profile"
      className="profile-avatar"
    />
  ) : (
    <User size={22} />
  )}
</button>

              {profileOpen && (
  <div className="profile-dropdown">

    {user ? (
      <>
        <div className="profile-header-card">

          <div className="profile-avatar-wrapper">
            <img
              src={user.photoURL || "/default-avatar.png"}
              alt="Profile"
              className="profile-large-avatar"
            />
            <span className="online-indicator"></span>
          </div>

          <h3>
            {user.displayName || "User"}
          </h3>

          <p>{user.email}</p>

        </div>

        <div className="profile-menu">

          <Link
            to="/profile?tab=profile"
            onClick={() => setProfileOpen(false)}
          >
            <User size={18} />
            <span>MY PROFILE</span>
          </Link>

          <Link
            to="/profile?tab=orders"
            onClick={() => setProfileOpen(false)}
          >
            <ShoppingBag size={18} />
            <span>MY ORDERS</span>
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setProfileOpen(false)}
          >
            <Heart size={18} />
            <span>WISHLIST</span>
          </Link>

          <Link
            to="/profile?tab=addresses"
            onClick={() => setProfileOpen(false)}
          >
            📍
            <span>ADDRESSES</span>
          </Link>

          <Link
            to="/profile?tab=support"
            onClick={() => setProfileOpen(false)}
          >
            ❓
            <span>HELP & SUPPORT</span>
          </Link>

        </div>

        <div className="profile-footer">

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            LOGOUT
          </button>

        </div>

      </>
    ) : (
      <>
        <Link
          to="/login"
          onClick={() => setProfileOpen(false)}
        >
          Login
        </Link>

        <Link
          to="/signup"
          onClick={() => setProfileOpen(false)}
        >
          Signup
        </Link>
      </>
    )}

  </div>
)}

            </div>

          </div>

          {/* MOBILE */}
          <div className="mobile-actions">

            {/* LEFT */}
            <div className="mobile-left">
              {/* MENU */}
              <button
                className="hamburger"
                onClick={() =>
                  setMenuOpen(true)
                }
              >
                <Menu size={26} />
              </button>

              {/* CART */}
              <Link
  to="/cart"
  className="icon-btn cart-btn"
>
  <ShoppingBag size={22} />

  {totalItems > 0 && (
    <span className="cart-count">
      {totalItems}
    </span>
  )}
</Link>

            </div>

            {/* RIGHT */}
            <div className="mobile-right">

              {/* SEARCH */}
              <button className="icon-btn" onClick={() => setSearchOpen(true)}>
  <Search size={22} />
</button>


               {/* PROFILE */}
              
              <div className="mobile-profile">

                <button
  className="icon-btn"
  onClick={() =>
    setProfileOpen(
      !profileOpen
    )
  }
>
  {user ? (
    <img
      src={
        user.photoURL ||
        "/default-avatar.png"
      }
      alt="Profile"
      className="profile-avatar"
    />
  ) : (
    <User size={22} />
  )}
</button>
{profileOpen && (
  <div className="mobile-profile-dropdown">

    {user ? (
      <>
        <Link
          to="/profile?tab=profile"
          onClick={() => setProfileOpen(false)}
        >
          MY PROFILE
        </Link>

        <Link
          to="/profile?tab=orders"
          onClick={() => setProfileOpen(false)}
        >
          MY ORDERS
        </Link>

        <Link
          to="/wishlist"
          onClick={() => setProfileOpen(false)}
        >
          <Heart size={18} />
          <span>WISHLIST</span>
        </Link>

        <Link
          to="/profile?tab=addresses"
          onClick={() => setProfileOpen(false)}
        >
          📍
          <span>ADDRESSES</span>
        </Link>

        <Link
          to="/profile?tab=support"
          onClick={() => setProfileOpen(false)}
        >
          ❓
          <span>HELP & SUPPORT</span>
        </Link>

        <div className="mobile-profile-footer">
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            LOGOUT
          </button>
        </div>

      </>
    ) : (
      <>
        <Link
          to="/login"
          onClick={() => setProfileOpen(false)}
        >
          Login
        </Link>

        <Link
          to="/signup"
          onClick={() => setProfileOpen(false)}
        >
          Signup
        </Link>
      </>
    )}

  </div>
)}
              </div>

            </div>

          </div>

        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div
        className={`drawer-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      <div className={`drawer ${menuOpen ? "open" : ""}`}>

        <button
          className="close-btn"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          <X size={28} />
        </button>

        <Link
          to="/"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          Home
        </Link>

        <div className="drawer-accordion">
          <button
            className={`drawer-accordion-btn ${productsSubmenuOpen ? "active" : ""}`}
            onClick={() => setProductsSubmenuOpen(!productsSubmenuOpen)}
          >
            <span>Products</span>
            <ChevronDown size={18} className="accordion-chevron" />
          </button>
          <div className={`drawer-submenu ${productsSubmenuOpen ? "open" : ""}`}>
            <div className="drawer-submenu-inner">
              <Link
                to="/products"
                onClick={() => setMenuOpen(false)}
              >
                New Arrivals
              </Link>
              <Link
                to="/products?category=shirts"
                onClick={() => setMenuOpen(false)}
              >
                Shirts
              </Link>
              <Link
                to="/products?category=trousers"
                onClick={() => setMenuOpen(false)}
              >
                Pants
              </Link>
              <Link
                to="/products?category=tshirts"
                onClick={() => setMenuOpen(false)}
              >
                T-Shirts
              </Link>
            </div>
          </div>
        </div>

        <Link
          to="/wishlist"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          Wishlist
        </Link>

        <Link
          to="/about"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          About
        </Link>

        <Link
          to="/contact"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          Contact
        </Link>

        <div className="drawer-divider" />

        <Link
          to="/login"
          className="drawer-auth"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          Login
        </Link>

        <Link
          to="/signup"
          className="drawer-auth"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          Signup
        </Link>

      </div>

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <div className="search-overlay">
          <div className="search-overlay-backdrop" onClick={() => setSearchOpen(false)} />
          <div className="search-container-box">
            <div className="search-header-row">
              <h2>SEARCH</h2>
              <button className="search-close-btn" onClick={() => setSearchOpen(false)}>
                <X size={26} />
              </button>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className="search-input-wrapper">
                <Search className="search-input-icon" size={20} />
                <input
                  type="text"
                  placeholder="Search products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="search-input-field"
                />
                {searchQuery && (
                  <button type="button" className="search-clear-input" onClick={() => setSearchQuery("")}>
                    <X size={18} />
                  </button>
                )}
              </div>
            </form>

            <div className="search-results-section">
              {searchQuery.trim() === "" ? (
                <div className="search-suggestions">
                  <p className="section-title">Popular Searches</p>
                  <div className="popular-tags">
                    {["Shirt", "Trouser", "T-Shirts"].map((tag) => (
                      <button
                        key={tag}
                        className="popular-tag-btn"
                        onClick={() => handlePopularTagClick(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="search-live-results">
                  <p className="section-title">Products ({filteredSearchProducts.length})</p>
                  {filteredSearchProducts.length > 0 ? (
                    <div className="search-results-list">
                      {filteredSearchProducts.slice(0, 5).map((prod) => (
                        <div
                          key={prod._id}
                          className="search-result-item"
                          onClick={() => handleProductClick(prod)}
                        >
                          <img src={getOptimizedImageUrl(prod.front, 200)} alt={prod.name} className="search-result-img" loading="lazy" />
                          <div className="search-result-info">
                            <span className="search-result-brand">NOVEMBER</span>
                            <span className="search-result-name">{prod.name}</span>
                            <div className="search-result-price-wrap">
                              <span className="search-result-price">{prod.price}</span>
                              {prod.compare && (
                                <span className="search-result-compare">{prod.compare}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredSearchProducts.length > 5 && (
                        <button className="view-all-results-btn" onClick={handleViewAllResults}>
                          View All {filteredSearchProducts.length} Results
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="no-results-msg">
                      No products found matching "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}