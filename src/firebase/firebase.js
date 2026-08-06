import { authClient } from "../lib/auth-client";
import { onAuthStateChanged } from "./better-auth-compat";

export const auth = {
  get currentUser() {
    const sessionAtom = authClient.$store?.atoms?.session;
    const storeVal = sessionAtom ? sessionAtom.get() : null;
    const user = storeVal?.data?.user;
    if (user) {
      return {
        uid: user.id,
        displayName: user.name,
        email: user.email,
        photoURL: user.image,
        emailVerified: user.emailVerified,
        providerId: "google"
      };
    }
    return null;
  },
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this, callback);
  }
};

export const db = {};