"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react"; // Added NextAuth hooks
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa"; // Added FaGoogle icon
import { customerLogin } from "../../api/auth"; //
import "./Login.css"; //

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter(); //
  const { data: session, status } = useSession(); // Retrieve NextAuth session status

  // Redirect to home if user is already authenticated via Google
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/userprofile");
    }
  }, [status, router]);

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
        localStorage.setItem("token", data.token); //
      }

      if (data?.user) {
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");

        localStorage.setItem("userId", String(data.user.id ?? "")); //
        localStorage.setItem("userEmail", data.user.email ?? ""); //
        localStorage.setItem("userName", data.user.name ?? ""); //
      }

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
          <h1 className="brand-heading">Core2Cover</h1>
          <p className="login-subtitle">Welcome back! Please enter your details.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message" style={{ color: '#d9534f', marginBottom: '15px', fontWeight: '600' }}>{error}</div>}

          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
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
                value={password}
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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>

          {/* Divider for Social Login */}
          <div className="social-divider" style={{ margin: '20px 0', textAlign: 'center', color: '#8f8b84', fontSize: '0.9rem' }}>
            <span>OR</span>
          </div>

          {/* Google Sign-In Button */}
          <button 
            type="button" 
            className="google-login-btn"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #eef2e6',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <FaGoogle style={{ color: '#DB4437' }} />
            Continue with Google
          </button>
        </form>

        <div className="login-footer">
          Don't have an account? <Link href="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}