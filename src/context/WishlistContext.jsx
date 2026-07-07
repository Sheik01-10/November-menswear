import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { auth } from "../firebase/firebase";

import {
  addToWishlist,
  removeFromWishlist,
  wishlistListener,
} from "../firebase/wishlist";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFirestore;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      unsubscribeFirestore = wishlistListener(
        user.uid,
        (items) => {
          setWishlist(items);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  const isWishlisted = (id) => {
    return wishlist.some((item) => item.id === id);
  };

  const toggleWishlist = async (product) => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first.");
      return false;
    }

    // Optimistic Update: Capture original state for rollback
    const originalWishlist = [...wishlist];

    if (isWishlisted(product.id)) {
      // Optimistically remove from state
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      try {
        await removeFromWishlist(user.uid, product.id);
      } catch (err) {
        console.error("Failed to remove from wishlist, rolling back:", err);
        setWishlist(originalWishlist);
        return false;
      }
    } else {
      // Optimistically add to state
      setWishlist((prev) => [...prev, product]);
      try {
        await addToWishlist(user.uid, product);
      } catch (err) {
        console.error("Failed to add to wishlist, rolling back:", err);
        setWishlist(originalWishlist);
        return false;
      }
    }

    return true;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        toggleWishlist,
        isWishlisted,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}