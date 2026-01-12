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
      <div className="login-box">
        <div className="login-header">
          <h1 className="brand-heading">Core2Cover</h1>
          <p className="login-subtitle">Welcome back! Please enter your details.</p>
        </div>

        <form className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="name@example.com" required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrap">
              <input type="password" placeholder="••••••••" required />
              <button type="button" className="pw-toggle">
                {/* Insert Eye Icon here */}
              </button>
            </div>
          </div>

          <div className="login-utilities">
            <a href="/forgot-password" hidden className="forgot-link">Forgot Password?</a>
          </div>

          <button type="submit" className="login-btn">Log In</button>
        </form>

        <div className="login-footer">
          Don't have an account? <a href="/signup">Sign Up</a>
        </div>
      </div>
    </div>
  );
}