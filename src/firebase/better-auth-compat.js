import { authClient } from "../lib/auth-client";

// Mock GoogleAuthProvider
export class GoogleAuthProvider {
  constructor() {
    this.providerId = "google";
  }
}

// Map Better Auth user to Firebase user schema
const mapUser = (user) => {
  if (!user) return null;
  return {
    uid: user.id,
    displayName: user.name,
    email: user.email,
    photoURL: user.image,
    emailVerified: user.emailVerified,
    providerId: "google"
  };
};

export const onAuthStateChanged = (authInstance, callback) => {
  if (authInstance) {
    // mark used
  }
  // Fire initial fetch immediately
  authClient.getSession().then(({ data }) => {
    callback(data?.user ? mapUser(data.user) : null);
  }).catch((err) => {
    console.error("onAuthStateChanged initial session check failed:", err);
    callback(null);
  });

  // Subscribe directly to the session atom to get the unsubscribe function
  const sessionAtom = authClient.$store?.atoms?.session;
  if (sessionAtom) {
    const unsubscribe = sessionAtom.subscribe((storeVal) => {
      const user = storeVal?.data?.user;
      callback(user ? mapUser(user) : null);
    });
    return unsubscribe;
  }

  return () => {};
};

export const signInWithEmailAndPassword = async (authInstance, email, password) => {
  if (authInstance) {
    // mark used
  }
  const { data, error } = await authClient.signIn.email({ email, password });
  if (error) {
    const err = new Error(error.message || "Failed to sign in");
    err.code = "auth/invalid-credential";
    throw err;
  }
  return { user: mapUser(data.user) };
};

export const createUserWithEmailAndPassword = async (authInstance, email, password) => {
  if (authInstance) {
    // mark used
  }
  const name = email.split("@")[0] || "November User";
  const { data, error } = await authClient.signUp.email({ email, password, name });
  if (error) {
    const err = new Error(error.message || "Failed to sign up");
    const code = error.code || "";
    const msg = (error.message || "").toLowerCase();
    
    if (
      code === "USER_ALREADY_EXISTS" ||
      code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ||
      msg.includes("already exists") ||
      msg.includes("already registered")
    ) {
      err.code = "auth/email-already-in-use";
    } else if (
      code === "PASSWORD_TOO_SHORT" ||
      code === "PASSWORD_TOO_LONG" ||
      msg.includes("password")
    ) {
      err.code = "auth/weak-password";
    } else if (
      code === "INVALID_EMAIL" ||
      msg.includes("email")
    ) {
      err.code = "auth/invalid-email";
    } else {
      err.code = code || "auth/unknown-error";
    }
    throw err;
  }
  return { user: mapUser(data.user) };
};

export const updateProfile = async (firebaseUser, profileData) => {
  if (profileData.displayName) {
    firebaseUser.displayName = profileData.displayName;
    const { error } = await authClient.updateUser({
      name: profileData.displayName
    });
    if (error) {
      throw new Error(error.message || "Failed to update profile name");
    }
  }
};

export const signInWithPopup = async (authInstance, provider) => {
  if (authInstance || provider) {
    // mark used
  }
  const { data, error } = await authClient.signIn.social({
    provider: "google",
    callbackURL: window.location.href
  });
  if (error) {
    throw new Error(error.message || "Failed Google login");
  }
  return { user: mapUser(data?.user) };
};

export const signInWithRedirect = async (authInstance, provider) => {
  if (authInstance || provider) {
    // mark used
  }
  const { error } = await authClient.signIn.social({
    provider: "google",
    callbackURL: window.location.href
  });
  if (error) {
    throw new Error(error.message || "Failed Google login redirect");
  }
};

export const getRedirectResult = async (authInstance) => {
  if (authInstance) {
    // mark used
  }
  const { data } = await authClient.getSession();
  if (data && data.user) {
    return { user: mapUser(data.user) };
  }
  return null;
};

export const sendPasswordResetEmail = async (authInstance, email) => {
  if (authInstance) {
    // mark used
  }
  const { error } = await authClient.forgetPassword({
    email,
    redirectTo: `${window.location.origin}/reset-password`
  });
  if (error) {
    throw new Error(error.message || "Failed to send reset email");
  }
};

export const signOut = async (authInstance) => {
  if (authInstance) {
    // mark used
  }
  await authClient.signOut();
  localStorage.removeItem("user");
};
