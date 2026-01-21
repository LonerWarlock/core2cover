"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  sendSellerOtp,
  verifySellerOtp,
  sellerSignup,
} from "../../api/auth";
import "./SellerSignup.css";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";
// 1. IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner";

const SellerSignup = () => {
  const Brand = ({ children }) => <span className="brand">{children}</span>;

  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ref to focus password after verification
  const passwordRef = useRef(null);

  useEffect(() => {
    if (emailVerified) {
      setTimeout(() => passwordRef.current?.focus(), 160);
    }
  }, [emailVerified]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // Send OTP to email
  const sendOtp = async () => {
    if (!form.email) return alert("Enter email");
    setSendingOtp(true);
    try {
      await sendSellerOtp(form.email.trim().toLowerCase());
      setOtpSent(true);
      alert("OTP sent to your email. Check inbox / spam.");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP for email
  const verifyOtp = async () => {
    if (!otp) return alert("Enter OTP");
    setVerifyingOtp(true);
    try {
      await verifySellerOtp(form.email.trim().toLowerCase(), otp.trim());
      setEmailVerified(true);
      alert("Email verified ");
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.terms) return alert("Accept terms");
    if (!emailVerified) return alert("Verify email");
    if (form.password !== form.confirmPassword) return alert("Passwords do not match");

    setLoading(true);

    try {
      const res = await sellerSignup({
        name: form.name,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      });

      localStorage.setItem("sellerId", res.data.sellerId);
      window.dispatchEvent(new Event("storage"));

      router.push("/businessdetails");
    } catch (err) {
      const status = err?.response?.status;

      if (status === 409) {
        alert("Account already exists. Please login.");
        router.push("/sellerlogin");
      } else if (status === 403) {
        alert("Please verify your email before signup.");
      } else {
        alert(err?.response?.data?.message || "Signup failed");
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 2. APPLY THE LOADING SPINNERS FOR DIFFERENT STATES */}
      {sendingOtp && <LoadingSpinner message="Sending verification code..." />}
      {verifyingOtp && <LoadingSpinner message="Verifying your email..." />}
      {loading && <LoadingSpinner message="Creating your seller account..." />}

      <div className="signup-container">
        <div className="signup-card">
          <Image
            src={CoreToCoverLogo}
            alt="CoreToCover"
            className="brand-logo"
            width={200}
            height={100}
          />
          <h2>Create Seller Account</h2>
          <p className="subtitle">Start selling on <Brand>Core2Cover</Brand></p>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="input-group">
              <label>Full Name</label>
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={emailVerified}
              />
            </div>

            {/* Phone */}
            <div className="input-group">
              <label>Phone</label>
              <input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* OTP Section */}
            <div className="otp-actions">
              <button
                className="otp-btn"
                type="button"
                onClick={sendOtp}
                disabled={otpSent || sendingOtp || emailVerified}
              >
                {emailVerified ? "Email Verified" : otpSent ? "OTP Sent" : sendingOtp ? "Sending..." : "Send OTP"}
              </button>

              {otpSent && !emailVerified && (
                <>
                  <input
                    className="otp-btn primary"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\s/g, ""))}
                  />
                  <button
                    className="otp-btn"
                    type="button"
                    onClick={verifyOtp}
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                </>
              )}

              {emailVerified && (
                <span style={{ color: "green", marginLeft: 8 }}>Verified ✓</span>
              )}
            </div>

            {/* Hidden until verified: Passwords, Terms, Submit */}
            <div
              className={`reveal ${emailVerified ? "show" : ""}`}
              aria-hidden={!emailVerified}
            >
              {/* Password */}
              <div className="input-group password-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required={emailVerified}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="input-group password-group">
                <label>Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required={emailVerified}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="terms">
                <input
                  type="checkbox"
                  name="terms"
                  checked={form.terms}
                  onChange={handleChange}
                />
                I agree to the <Link href="/terms">Terms & Conditions</Link>
              </label>

              {/* Submit */}
              <button
                type="submit"
                className="signup-btn"
                disabled={loading || !emailVerified}
              >
                {loading ? "Creating..." : "Continue"}
              </button>

              {/* Login */}
              <p className="login-link">
                Already have an account?{" "}
                <Link href="/sellerlogin">Login</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SellerSignup;