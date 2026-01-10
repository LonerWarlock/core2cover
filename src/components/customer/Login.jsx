// src/components/auth/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { customerLogin } from "../../api/auth";
import "./Login.css";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isEmailValid = (val) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // client-side validation
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!isEmailValid(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await customerLogin({ email: email.trim(), password });

      /*
        customerLogin usually returns an axios response.
        axios-responses store payload in response.data
        so use response?.data as the canonical source.
      */
      const data = response?.data ?? response;

      // Expectation: backend returns { user: {...}, token: "..." }
      // Save token + (optionally) user info for UI convenience.
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      // Keep existing localStorage usage for UI (safe as long as backend trusts JWT)
      if (data?.user) {
        // remove only auth-related keys to avoid wiping unrelated localStorage
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");

        localStorage.setItem("userId", String(data.user.id ?? ""));
        localStorage.setItem("userEmail", data.user.email ?? "");
        localStorage.setItem("userName", data.user.name ?? "");
      }

      // Navigate to homepage (or your post-login route)
      navigate("/");
    } catch (err) {
      // Try to surface backend message if present
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="login-page">
      <main className="login-box" aria-labelledby="login-heading">

        {/* LOGO */}
        <img
          src={CoreToCoverLogo}
          alt="CoreToCover"
          className="brand-logo"
        />

        <h2 id="login-heading">Sign in</h2>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="form-error" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="password_wrap">
            <label htmlFor="password">Password</label>

            <div className="password-input">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>

          <p className="helper-line">
            Don’t have an account? <Link to="/signup">Create one</Link>
          </p>
        </form>
      </main>
    </div>
  );
}