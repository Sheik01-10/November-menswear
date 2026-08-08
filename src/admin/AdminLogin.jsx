import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import axios from "axios";
import "./styles/Admin.css";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({ email, password });
      if (error) {
        alert(error.message || "Invalid Credentials");
        setLoading(false);
        return;
      }

      // Record login in database and fetch role
      const res = await axios.post(`${BACKEND}/api/users/login-success`, {}, {
        withCredentials: true
      });

      const { role } = res.data;

      if (role === "admin") {
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("role", "admin");
        navigate("/admin-dashboard");
      } else if (role === "staff") {
        localStorage.setItem("isStaff", "true");
        localStorage.setItem("role", "staff");
        navigate("/staff-dashboard");
      } else {
        await authClient.signOut();
        alert("Access Denied: Authorized Personnel Only");
      }
    } catch (err) {
      console.error("Login failure:", err);
      alert(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="admin-page">
  <div className="admin-bg"></div>

  <div className="admin-card">

    <img
      src="/logo.webp"
      alt="The November"
      className="brand-logo"
      width="120"
      height="96"
    />

    <h1 className="brand-name">
      THE NOVEMBER
    </h1>

    <p className="brand-subtitle">
      Admin Portal
    </p>

    <form
      className="admin-form"
      onSubmit={handleLogin}
    >
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button type="submit" disabled={loading}>
        {loading ? "Verifying..." : "Continue →"}
      </button>
    </form>

    <span className="admin-note">
      Authorized Personnel Only
    </span>

  </div>
</div>
  );
}