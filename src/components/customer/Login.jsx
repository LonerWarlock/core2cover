"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Changed to next/image
import { useRouter } from "next/navigation"; // Changed from react-router-dom
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
  const router = useRouter(); // Changed to useRouter

  const isEmailValid = (val) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
      const data = response?.data ?? response;

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      if (data?.user) {
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");

        localStorage.setItem("userId", String(data.user.id ?? ""));
        localStorage.setItem("userEmail", data.user.email ?? "");
        localStorage.setItem("userName", data.user.name ?? "");
      }

      router.push("/"); // Changed to router.push
    } catch (err) {
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

        {/* FIX: Use Image component and pass the object directly */}
        <Image
          src={CoreToCoverLogo}
          alt="CoreToCover"
          className="brand-logo"
          width={150} // Provide a fallback width/height just in case CSS fails, or rely on 'auto' via CSS
          height={50}
          style={{ width: 'auto', height: 'auto', maxWidth: '200px' }} // CSS control
          priority // Loads this image faster as it's above the fold
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
            Don’t have an account? <Link href="/signup">Create one</Link>
          </p>
        </form>
      </main>
    </div>
  );
}