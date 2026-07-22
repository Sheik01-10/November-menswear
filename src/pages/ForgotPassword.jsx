import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase";
import toast from "react-hot-toast";
import BackButton from "../components/BackButton";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
      setEmail("");
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send password reset email.");
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
            src="/logo.png"
            alt="The November"
            className="auth-logo"
          />
        </div>

        {/* BRAND */}
        <h1 className="brand-name">
          THE NOVEMBER
        </h1>

        {/* TITLE */}
        <div className="title-wrap">
          <h2>
            Reset Password
          </h2>

          <p>
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleResetPassword}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "SENDING LINK..." : "SEND RESET LINK"}
          </button>
        </form>

        <div className="auth-footer">
          Remembered your password?{" "}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`}>
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}
