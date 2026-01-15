"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react"; // ADD THIS
import Image from "next/image";
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
  const [msg, setMsg] = useState({ text: "", type: "", show: false });

  const showMessage = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  const passwordRef = useRef(null);

  useEffect(() => {
    if (emailVerified) {
      setTimeout(() => passwordRef.current?.focus(), 160);
    }
  }, [emailVerified]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    try {
      setVerifyingOtp(true);
      await verifyCustomerOtp(
        form.email.trim().toLowerCase(),
        otp.trim()
      );
      setEmailVerified(true);
      showMessage("Email verified successfully!");
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

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
    <>
      {msg.show && (
        <MessageBox
          message={msg.text}
          type={msg.type}
          onClose={() => setMsg({ ...msg, show: false })}
        />
      )}
      <div className="signup-page">
        <div className="signup-box login-box">
          <Image
            src={CoreToCoverLogo}
            alt="CoreToCover"
            className="brand-logo"
            width={150}
            height={50}
            style={{ width: 'auto', height: 'auto', maxWidth: '200px' }}
          />
          <h2 className="signup-title">Create Customer Account</h2>

          <form className="signup-form" onSubmit={handleSignup}>
            {/* Form inputs remain largely the same, logic is updated */}
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
                  {emailVerified ? "Email Verified" : otpSent ? "OTP Sent" : sendingOtp ? "Sending..." : "Send OTP"}
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

            {emailVerified && <p className="otp-verified">Email verified ✓</p>}

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

             <div className="login-divider">
                        <span>OR</span>
                      </div>
            
                      <button
                        type="button"
                        className="google-btn-premium"
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                      >
                        <div className="google-icon-wrapper">
                          <svg viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                        </div>
                        <span className="btn-text">Signup with Google</span>
                        <div className="btn-shimmer"></div>
                      </button>

            <p className="links">
              Already have an account? <Link href="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}