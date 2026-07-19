import axios from "axios";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

/* Add Product */
export async function addToWishlist(uid, product) {
  try {
    const res = await axios.post(`${BACKEND}/api/wishlist/${uid}`, product);
    return res.data;
  } catch (e) {
    console.error("Error adding to wishlist:", e);
    throw e;
  }
}

/* Remove Product */
export async function removeFromWishlist(uid, productId) {
  try {
    const res = await axios.delete(`${BACKEND}/api/wishlist/${uid}/${productId}`);
    return res.data;
  } catch (e) {
    console.error("Error removing from wishlist:", e);
    throw e;
  }
}

/* Get Wishlist Once */
export async function getWishlist(uid) {
  try {
    const res = await axios.get(`${BACKEND}/api/wishlist/${uid}`);
    return res.data;
  } catch (e) {
    console.error("Error fetching wishlist:", e);
    return [];
  }
}

/* Live Listener (mocked using interval for simple real-time updates) */
export function wishlistListener(uid, callback) {
  const fetchWish = async () => {
    // Only fetch if the document is active/visible to user
    if (document.visibilityState === "visible") {
      const data = await getWishlist(uid);
      callback(data);
    }
  };
  
  // Initial fetch
  const initialFetch = async () => {
    const data = await getWishlist(uid);
    callback(data);
  };
  initialFetch();
  
  // Poll every 6 seconds to simulate live snapshot updates with visibility check
  const interval = setInterval(fetchWish, 6000);
  
  // Instantly sync when the tab transitions back to visible/focused
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      fetchWish();
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  
  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}