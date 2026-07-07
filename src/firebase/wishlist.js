import axios from "axios";

const BACKEND = `http://${window.location.hostname}:5000`;

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
    const data = await getWishlist(uid);
    callback(data);
  };
  
  // Initial fetch
  fetchWish();
  
  // Poll every 4 seconds to simulate live snapshot updates
  const interval = setInterval(fetchWish, 4000);
  
  return () => {
    clearInterval(interval);
  };
}