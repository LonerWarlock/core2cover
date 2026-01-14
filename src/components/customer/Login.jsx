"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const isEmailValid = (val) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    setError("");

    // Validation
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

      // Store Authentication Token
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      // Store Customer Data
      if (data?.user) {
        // Clear any old session data first
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");

        localStorage.setItem("userId", String(data.user.id ?? ""));
        localStorage.setItem("userEmail", data.user.email ?? "");
        localStorage.setItem("userName", data.user.name ?? "");
      }

      // Redirect to Customer Home
      router.push("/"); 
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-header">
          {/* logo image optionally added here */}
          <h1 className="brand-heading">Core2Cover</h1>
          <p className="login-subtitle">Welcome back! Please enter your details.</p>
        </div>

        {/* CRITICAL: Added onSubmit to the form tag */}
        <form className="login-form" onSubmit={handleSubmit}>
          
          {/* Display Error if login fails */}
          {error && <div className="error-message" style={{ color: '#d9534f', marginBottom: '15px', fontWeight: '600' }}>{error}</div>}

          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email} // Controlled input
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrap">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} // Controlled input
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button" 
                className="pw-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="login-utilities">
            <Link href="/forgot-password" hidden className="forgot-link">Forgot Password?</Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="login-footer">
          Don't have an account? <Link href="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}