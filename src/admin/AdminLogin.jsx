import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (
      email === "admin@novemberxix.com" &&
      password === "November@123"
    ) {
      localStorage.setItem("isAdmin", "true");
      navigate("/admin-dashboard");
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
   <div className="admin-page">
  <div className="admin-bg"></div>

  <div className="admin-card">

    <img
      src="/logo.png"
      alt="November"
      className="brand-logo"
    />

    <h1 className="brand-name">
      NOVEMBER
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

      <button type="submit">
        Continue →
      </button>
    </form>

    <span className="admin-note">
      Authorized Personnel Only
    </span>

  </div>
</div>
  );
}