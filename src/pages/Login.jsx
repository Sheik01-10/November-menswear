import { useState, useEffect } from "react";
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
} from "firebase/auth";

import { auth } from "../firebase/firebase";
import { syncUserToMongoDB } from "../firebase/userSync";

import "./Auth.css";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";

export default function Login() {
  const navigate =
    useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

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
          const userData = {
            uid: user.uid,
            name: user.displayName || "November User",
            email: user.email,
            photo: user.photoURL || "",
          };
          
          localStorage.setItem("user", JSON.stringify(userData));
          
          await syncUserToMongoDB(userData);
          
          toast.success("Welcome back!");
          navigate(redirect);
        }
      } catch (error) {
        console.error("Google redirect auth error:", error);
        toast.error(`Google Login Failed: ${error.message}`);
      }
    };
    checkRedirect();
  }, [navigate, redirect]);

  const handleLogin = async (
    e
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user =
        userCredential.user;

      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: user.uid,
          name:
            user.displayName ||
            "November User",
          email: user.email,
          photo:
            user.photoURL || "",
        })
      );

      await syncUserToMongoDB({
        uid: user.uid,
        name: user.displayName || "November User",
        email: user.email,
        photo: user.photoURL || ""
      });

      toast.success(
        "Welcome back!"
      );

      navigate(redirect);
    } catch (error) {
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
      
      // Force redirect flow on mobile devices to prevent popup blockers
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        setLoading(true);
        await signInWithRedirect(auth, provider);
      } else {
        setLoading(true);
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userData = {
          uid: user.uid,
          name: user.displayName || "November User",
          email: user.email,
          photo: user.photoURL || "",
        };

        localStorage.setItem("user", JSON.stringify(userData));

        await syncUserToMongoDB(userData);

        toast.success("Welcome back!");
        navigate(redirect);
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

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