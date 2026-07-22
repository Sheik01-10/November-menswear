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
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../firebase/firebase";
import { syncUserToMongoDB } from "../firebase/userSync";
import axios from "axios";

import "./Auth.css";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import WelcomeScreen from "../components/WelcomeScreen";

export default function Signup() {
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

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
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
          const name = user.displayName || "The November User";
          const userData = {
            uid: user.uid,
            name,
            email: user.email,
            photo: user.photoURL || "",
            phone: ""
          };
          
          isLoggingInRef.current = true;
          localStorage.setItem("user", JSON.stringify(userData));
          
          await syncUserToMongoDB(userData);
          
          toast.success("Google Sign Up Successful");
          setWelcomeUser({ name, isNew: true });
        }
      } catch (error) {
        console.error("Google redirect signup error:", error);
        toast.error(`Google Sign Up Failed: ${error.message}`);
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
            name: user.displayName || "The November User",
            email: user.email,
            photo: user.photoURL || "",
            phone: ""
          };
          localStorage.setItem("user", JSON.stringify(userData));
          syncUserToMongoDB(userData);
        }
        navigate(redirect);
      }
    });

    return () => unsubscribe();
  }, [checkingRedirect, navigate, redirect]);

  const handleSignup = async (
    e
  ) => {
    e.preventDefault();

    setLoading(true);
    isLoggingInRef.current = true;

    try {
      // Prevent registering with duplicate email
      const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      const emailCheckRes = await axios.get(`${BACKEND}/api/users/check-email?email=${encodeURIComponent(email)}`);
      if (emailCheckRes.data.exists) {
        toast.error("This email address is already registered. Please login instead.");
        isLoggingInRef.current = false;
        setLoading(false);
        return;
      }

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await updateProfile(
        userCredential.user,
        {
          displayName: name,
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          uid:
            userCredential.user.uid,
          name,
          email,
          phone,
          photo:
            userCredential.user
              .photoURL || "",
        })
      );

      await syncUserToMongoDB({
        uid: userCredential.user.uid,
        name: name,
        email: email,
        phone: phone,
        photo: ""
      });

      toast.success(
        "Account Created Successfully"
      );

      setWelcomeUser({ name, isNew: true });
    } catch (error) {
      isLoggingInRef.current = false;
      console.error(error);
      let friendlyMessage = error.message;
      if (error.code === "auth/email-already-in-use") {
        friendlyMessage = "This email address is already registered. Please login instead.";
      } else if (error.code === "auth/weak-password") {
        friendlyMessage = "Password should be at least 6 characters.";
      } else if (error.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      }
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      setLoading(true);
      isLoggingInRef.current = true;
      
      // Try popup first (works on both mobile and desktop, preserves query parameters, no page reload)
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const name = user.displayName || "The November User";
        const userData = {
          uid: user.uid,
          name,
          email: user.email,
          photo: user.photoURL || "",
          phone: ""
        };

        localStorage.setItem("user", JSON.stringify(userData));

        await syncUserToMongoDB(userData);

        toast.success("Google Sign Up Successful");
        setWelcomeUser({ name, isNew: true });
      } catch (popupError) {
        console.warn("Popup sign-up failed, falling back to redirect:", popupError);
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
        <div className="auth-logo-wrap">
          <img
            src="/logo.png"
            alt="The November"
            className="auth-logo"
          />
        </div>

        <h1 className="brand-name">
          THE NOVEMBER
        </h1>

        <div className="title-wrap">
          <h2>
            Create Account
          </h2>

          <p>
            Join the premium
            experience
          </p>
        </div>

        <form
          onSubmit={
            handleSignup
          }
        >
          <div className="input-group">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
            />
          </div>

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

          <div className="input-group">
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
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

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {loading ? (
              <>
                <span className="spinner-loader"></span>
                CREATING...
              </>
            ) : (
              "CREATE ACCOUNT"
            )}
          </button>

          <button
            type="button"
            className="google-btn"
            onClick={
              handleGoogleSignup
            }
          >
            Continue with Google
          </button>
        </form>

        <div className="auth-footer">
          Already have an
          account?{" "}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`}>
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}