import axios from "axios";

const BACKEND = `http://${window.location.hostname}:5000`;

export async function syncUserToMongoDB(userData) {
  try {
    const payload = {
      uid: userData.uid,
      name: userData.name || userData.displayName || "November User",
      email: userData.email,
      photo: userData.photo || userData.photoURL || "",
      phone: userData.phone || userData.phoneNumber || ""
    };
    const res = await axios.post(`${BACKEND}/api/users/sync`, payload);
    return res.data;
  } catch (error) {
    console.error("Failed to sync user to MongoDB:", error);
    return null;
  }
}
