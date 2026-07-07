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
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

import { auth } from "../firebase/firebase";
import { syncUserToMongoDB } from "../firebase/userSync";
import axios from "axios";

import "./Auth.css";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";

export default function Signup() {
  const navigate =
    useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

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
          const userData = {
            uid: user.uid,
            name: user.displayName || "November User",
            email: user.email,
            photo: user.photoURL || "",
            phone: ""
          };
          
          localStorage.setItem("user", JSON.stringify(userData));
          
          await syncUserToMongoDB(userData);
          
          toast.success("Google Sign Up Successful");
          navigate(redirect);
        }
      } catch (error) {
        console.error("Google redirect signup error:", error);
        toast.error(`Google Sign Up Failed: ${error.message}`);
      }
    };
    checkRedirect();
  }, [navigate, redirect]);

  const handleSignup = async (
    e
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      // Prevent registering with duplicate email
      const BACKEND = `http://${window.location.hostname}:5000`;
      const emailCheckRes = await axios.get(`${BACKEND}/api/users/check-email?email=${encodeURIComponent(email)}`);
      if (emailCheckRes.data.exists) {
        toast.error("This email address is already registered. Please login instead.");
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

      navigate(redirect);
    } catch (error) {
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
          phone: ""
        };

        localStorage.setItem("user", JSON.stringify(userData));

        await syncUserToMongoDB(userData);

        toast.success("Google Sign Up Successful");
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
        <div className="auth-logo-wrap">
          <img
            src="/logo.svg"
            alt="November"
            className="auth-logo"
          />
        </div>

        <h1 className="brand-name">
          NOVEMBER
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