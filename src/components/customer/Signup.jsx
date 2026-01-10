"use client";

import React, { useState, useRef, useEffect, Image } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import {
  customerSignup,
  sendCustomerOtp,
  verifyCustomerOtp,
} from "../../api/auth";
import "./Signup.css";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";

export default function Signup() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [errors, setErrors] = useState({});

  // ref to autofocus the password input after verification
  const passwordRef = useRef(null);

  useEffect(() => {
    if (emailVerified) {
      // small delay so animation finishes before focusing
      setTimeout(() => passwordRef.current?.focus(), 160);
    }
  }, [emailVerified]);

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* =========================
     VALIDATION
  ========================= */
  const validate = () => {
    const e = {};

    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!emailVerified) e.email = "Email must be verified";
    if (!form.phone.match(/^[0-9]{10}$/))
      e.phone = "Enter a valid 10-digit phone number";
    if (!form.address.trim()) e.address = "Address is required";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!termsAccepted) e.terms = "You must accept the terms";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* =========================
     SEND OTP
  ========================= */
  const handleSendOtp = async () => {
    if (!form.email.trim()) {
      setErrors({ email: "Enter email first" });
      return;
    }

    try {
      setSendingOtp(true);
      await sendCustomerOtp(form.email.trim().toLowerCase());
      setOtpSent(true);
      alert("OTP sent to your email");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  /* =========================
     VERIFY OTP
  ========================= */
  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;

    try {
      setVerifyingOtp(true);
      await verifyCustomerOtp(
        form.email.trim().toLowerCase(),
        otp.trim()
      );
      setEmailVerified(true);
      alert("Email verified successfully");
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  /* =========================
     SUBMIT SIGNUP
  ========================= */
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await customerSignup({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        password: form.password,
      });

      alert("Account created successfully. Please login.");
      router.push("/login");
    } catch (err) {
      alert(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-box login-box">
        <Image
          src={CoreToCoverLogo.src || CoreToCoverLogo}
          alt="CoreToCover"
          className="brand-logo"
        />
        <h2 className="signup-title">Create Customer Account</h2>

        <form className="signup-form" onSubmit={handleSignup}>
          <div className="field">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} />
            {errors.name && <small className="error"><FaTimes /> {errors.name}</small>}
          </div>

          <div className="field">
            <label>Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={emailVerified}
            />
            {errors.email && <small className="error"><FaTimes /> {errors.email}</small>}
          </div>


          <div className="field">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
            {errors.phone && <small className="error"><FaTimes /> {errors.phone}</small>}
          </div>

          <div className="field">
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} />
            {errors.address && <small className="error"><FaTimes /> {errors.address}</small>}
          </div>

          {!emailVerified && (
            <div className="field full">
              <button
                type="button"
                className={`otp-btn ${otpSent ? "sent" : ""}`}
                onClick={handleSendOtp}
                disabled={otpSent || sendingOtp || emailVerified}
              >
                {emailVerified
                  ? "Email Verified"
                  : otpSent
                    ? "OTP Sent"
                    : sendingOtp
                      ? "Sending..."
                      : "Send OTP"}
              </button>

              {otpSent && (
                <>
                  <input
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp}
                    className="otp-verify-btn"
                  >
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                </>
              )}
            </div>
          )}

          {emailVerified && (
            <p className="otp-verified">Email verified ✓</p>
          )}

          {/* reveal until emailVerified */}
          <div className={`pw-reveal ${emailVerified ? "show" : ""}`} aria-hidden={!emailVerified}>
            <div className="field">
              <label>Password</label>
              <div className="password-wrap">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
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
              {errors.password && <small className="error"><FaTimes /> {errors.password}</small>}
            </div>

            <div className="field">
              <label>Confirm Password</label>
              <div className="password-wrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <small className="error"><FaTimes /> {errors.confirmPassword}</small>}
            </div>

            <label className="terms">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              I agree to terms
            </label>
            {errors.terms && <small className="error"><FaTimes /> {errors.terms}</small>}

            <button type="submit" disabled={loading || !emailVerified} className="create-btn">
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>

          <p className="links">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}