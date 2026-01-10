"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./DesignerLogin.css";
import { designerLogin } from "../../api/designer";

const DesignerLogin = () => {
  const Brand = ({ children }) => <span className="brand">{children}</span>;
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await designerLogin({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      localStorage.setItem("designerId", data.designer.id);
      router.push("/designerdashboard");
    } catch (err) {
      console.error("DESIGNER LOGIN ERROR:", err);
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="designer-login-page">
      <div className="login-box login-reveal">
        <h1 className="login-logo">
          <Brand>Core2Cover</Brand>
        </h1>
        <p className="login-sub">Login to your designer workspace</p>
        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-field password-field">
            <label>Password</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span
                className="eye-btn"
                onClick={() => setShowPassword((s) => !s)}
                role="button"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">
          New to Casa?{" "}
          <Link href="/designersignup" className="login-link">
            Sign up as Designer
          </Link>
        </p>
      </div>
    </div>
  );
};

export default DesignerLogin;