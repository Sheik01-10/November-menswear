import { useState, useEffect, useRef } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
} from "lucide-react";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../firebase/firebase";
import { syncUserToMongoDB } from "../firebase/userSync";

import "./Auth.css";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import WelcomeScreen from "../components/WelcomeScreen";

export default function Login() {
  const navigate =
    useNavigate();
  const [searchParams] = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/";
  const redirect = rawRedirect.startsWith("/") ? rawRedirect : `/${rawRedirect}`;

  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const [welcomeUser, setWelcomeUser] = useState(null);
  const isLoggingInRef = useRef(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  // Handle Google redirect sign-in result on mount (for mobile flow)
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const user = result.user;
          const name = user.displayName || "November User";
          const userData = {
            uid: user.uid,
            name,
            email: user.email,
            photo: user.photoURL || "",
          };
          
          isLoggingInRef.current = true;
          localStorage.setItem("user", JSON.stringify(userData));
          
          await syncUserToMongoDB(userData);
          
          toast.success("Welcome back!");
          setWelcomeUser({ name, isNew: false });
        }
      } catch (error) {
        console.error("Google redirect auth error:", error);
        toast.error(`Google Login Failed: ${error.message}`);
      } finally {
        setCheckingRedirect(false);
      }
    };
    checkRedirect();
  }, [navigate, redirect]);

  // Automatically redirect if user is already logged in
  useEffect(() => {
    if (checkingRedirect) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (isLoggingInRef.current) return;

        // Robust fallback: if localStorage is missing user details (e.g. on mobile redirect landing),
        // populate it and sync to database.
        const localUser = localStorage.getItem("user");
        if (!localUser) {
          const userData = {
            uid: user.uid,
            name: user.displayName || "November User",
            email: user.email,
            photo: user.photoURL || "",
          };
          localStorage.setItem("user", JSON.stringify(userData));
          syncUserToMongoDB(userData);
        }
        navigate(redirect);
      }
    });

    return () => unsubscribe();
  }, [checkingRedirect, navigate, redirect]);

  const handleLogin = async (
    e
  ) => {
    e.preventDefault();

    setLoading(true);
    isLoggingInRef.current = true;

    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user =
        userCredential.user;
      const name = user.displayName || "November User";

      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: user.uid,
          name,
          email: user.email,
          photo:
            user.photoURL || "",
        })
      );

      await syncUserToMongoDB({
        uid: user.uid,
        name,
        email: user.email,
        photo: user.photoURL || ""
      });

      toast.success(
        "Welcome back!"
      );

      setWelcomeUser({ name, isNew: false });
    } catch (error) {
      isLoggingInRef.current = false;
      console.error(error);
      let friendlyMessage = error.message;
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found"
      ) {
        friendlyMessage = "Incorrect email or password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/user-disabled") {
        friendlyMessage = "This account has been disabled.";
      } else if (error.code === "auth/too-many-requests") {
        friendlyMessage = "Too many failed attempts. Please try again later.";
      }
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      setLoading(true);
      isLoggingInRef.current = true;
      
      // Try popup first (works on both mobile and desktop, preserves query parameters, no page reload)
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const name = user.displayName || "November User";
        const userData = {
          uid: user.uid,
          name,
          email: user.email,
          photo: user.photoURL || "",
        };

        localStorage.setItem("user", JSON.stringify(userData));

        await syncUserToMongoDB(userData);

        toast.success("Welcome back!");
        setWelcomeUser({ name, isNew: false });
      } catch (popupError) {
        console.warn("Popup sign-in failed, falling back to redirect:", popupError);
        // Fallback to redirect if popup is blocked or fails on mobile/desktop
        toast.loading("Redirecting to Google Sign-In...");
        await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      isLoggingInRef.current = false;
      console.error("Google Auth Error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (welcomeUser) {
    return (
      <WelcomeScreen
        name={welcomeUser.name}
        isNew={welcomeUser.isNew}
        onComplete={() => navigate(redirect)}
      />
    );
  }

  return (
    <section className="auth-page">
      <BackButton />

      <div className="auth-card">
        {/* LOGO */}
        <div className="auth-logo-wrap">
          <img
            src="/logo.svg"
            alt="November"
            className="auth-logo"
          />
        </div>

        {/* BRAND */}
        <h1 className="brand-name">
          NOVEMBER
        </h1>

        {/* TITLE */}
        <div className="title-wrap">
          <h2>
            Welcome Back
          </h2>

          <p>
            Login to your
            premium account
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={
            handleLogin
          }
        >
          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              required
            />
          </div>

          <div className="input-group password-box">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword ? (
                <EyeOff
                  size={18}
                />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <div className="forgot-wrap">
            <Link to={`/forgot-password?redirect=${encodeURIComponent(redirect)}`}>
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {loading ? (
              <>
                <span className="spinner-loader"></span>
                LOGGING IN...
              </>
            ) : (
              "LOGIN"
            )}
          </button>

          <button
            type="button"
            className="google-btn"
            onClick={
              handleGoogleLogin
            }
          >
            Continue with
            Google
          </button>
        </form>

        <div className="auth-footer">
          Don't have an
          account?{" "}
          <Link to={`/signup?redirect=${encodeURIComponent(redirect)}`}>
            Create Account
          </Link>
        </div>
      </div>
    </section>
  );
}