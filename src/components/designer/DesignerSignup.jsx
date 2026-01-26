"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "./DesignerSignup.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  designerSignup,
  sendDesignerOtp,
  verifyDesignerOtp,
} from "../../api/designer";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";
// 1. Import MessageBox
import MessageBox from "../ui/MessageBox";
// IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner";

import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

const LIBRARIES = ["places"];

const DesignerSignup = () => {
  const router = useRouter();
  const autocompleteRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    mobile: "",
    location: "",
    password: "",
    confirmPassword: "",
  });

  // 2. Message Box State
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [error, setError] = useState("");

  const passwordRef = useRef(null);

  // 3. Helper to trigger the message box
  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
    // Optional: Clear the red inline error if a success message is shown
    if (type === "success") setError("");
  };

  useEffect(() => {
    if (emailVerified) {
      setTimeout(() => passwordRef.current?.focus(), 160);
    }
  }, [emailVerified]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setForm((prev) => ({ ...prev, location: place.formatted_address }));
      }
    }
  };

  const handleSendOtp = async () => {
    if (!form.email) {
      setError("Enter email first");
      return;
    }

    try {
      setSendingOtp(true);
      setError("");

      await sendDesignerOtp(form.email.trim().toLowerCase());
      setOtpSent(true);
      // Replace alert
      triggerMsg("OTP sent to your email. Check inbox / spam.", "success");
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Failed to send OTP";
      setError(errMsg);
      triggerMsg(errMsg, "error");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Enter OTP");
      return;
    }

    try {
      setVerifyingOtp(true);
      setError("");

      await verifyDesignerOtp(form.email.trim().toLowerCase(), otp.trim());

      setEmailVerified(true);
      // Replace alert
      triggerMsg("Email verified successfully!", "success");
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Invalid OTP";
      setError(errMsg);
      triggerMsg(errMsg, "error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (form.mobile.length < 10) {
      const msg = "Please enter a valid 10-digit mobile number.";
      setError(msg);
      triggerMsg(msg, "error");
      return;
    }

    if (!emailVerified) {
      setError("Verify email before signup");
      triggerMsg("Please verify your email first", "error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      triggerMsg("Passwords do not match", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await designerSignup({
        fullname: form.fullname,
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile,
        location: form.location,
        password: form.password,
      });

      const designerId = res?.designer?.id || res?.data?.designer?.id || res?.data?.id;
      if (designerId) localStorage.setItem("designerId", designerId);

      triggerMsg("Account created! Redirecting to setup...", "success");

      // Delay redirection so user can see the success message
      setTimeout(() => {
        router.push("/designer_profile_setup");
      }, 2000);

    } catch (err) {
      console.error("DESIGNER SIGNUP ERROR:", err);
      const errMsg = err.response?.data?.message || "Server error. Please try again.";
      setError(errMsg);
      triggerMsg(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* APPLY OVERLAY SPINNERS FOR VARIOUS PROCESSES */}
      {sendingOtp && <LoadingSpinner message="Sending verification code..." />}
      {verifyingOtp && <LoadingSpinner message="Verifying your email..." />}
      {loading && <LoadingSpinner message="Creating your professional account..." />}

      {/* 4. Render MessageBox at the top level of the component */}
      {msg.show && (
        <MessageBox
          message={msg.text}
          type={msg.type}
          onClose={() => setMsg({ ...msg, show: false })}
        />
      )}

      <div className="designer-signup-page">
        <div className="ds-auth-box">
          <Image
            src={CoreToCoverLogo}
            alt="CoreToCover"
            className="brand-logo"
            width={100}
            height={100}
          />
          <p className="ds-sub">Join as a Designer</p>

          {/* We keep the inline error for immediate visibility, but the MessageBox covers global feedback */}
          {error && <p className="ds-error" role="alert">{error}</p>}

          <form onSubmit={handleSignup} className="ds-form">
            <div className="ds-field">
              <label>Full Name</label>
              <input
                type="text"
                name="fullname"
                placeholder="Enter your name"
                value={form.fullname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ds-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={emailVerified}
                className={emailVerified ? "ds-disabled" : ""}
              />
            </div>

            <div className="ds-field">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                placeholder="Enter your mobile number"
                value={form.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ds-field">
              <label>Studio Location</label>
              {isLoaded ? (
                <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={onPlaceChanged}>
                  <div className="ds-input-icon-wrapper">
                    <input
                      type="text"
                      name="location"
                      placeholder="Search city or area..."
                      value={form.location}
                      onChange={handleChange}
                      required
                    />
                    <FaMapMarkerAlt className="ds-input-icon" />
                  </div>
                </Autocomplete>
              ) : (
                <input type="text" name="location" placeholder="Loading location services..." disabled />
              )}
            </div>

            <div className="ds-field ds-full">
              <div className="ds-otp-actions">
                <button
                  type="button"
                  className="ds-btn small"
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

                {otpSent && !emailVerified && (
                  <>
                    <input
                      className="ds-otp-input"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.trim())}
                      maxLength={6}
                    />
                    <button
                      type="button"
                      className="ds-btn small"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp}
                    >
                      {verifyingOtp ? "Verifying..." : "Verify OTP"}
                    </button>
                  </>
                )}

                {emailVerified && (
                  <p style={{ color: "var(--ds-olive)", fontWeight: 700, margin: 0 }}>
                    Email verified ✓
                  </p>
                )}
              </div>
            </div>

            <div
              className={`ds-reveal ${emailVerified ? "show" : ""}`}
              aria-hidden={!emailVerified}
            >
              <div className="ds-field">
                <label>Password</label>
                <div className="ds-password-wrap">
                  <input
                    ref={passwordRef}
                    type={showPass ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange}
                    required={emailVerified}
                  />
                  <button
                    type="button"
                    className="ds-toggle-visibility"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="ds-field">
                <label>Confirm Password</label>
                <div className="ds-password-wrap">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required={emailVerified}
                  />
                  <button
                    type="button"
                    className="ds-toggle-visibility"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                  >
                    {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="ds-field ds-full">
                <label>Availability</label>
                <input type="text" value="Available" disabled />
              </div>

              <button
                className="ds-btn ds-full"
                style={{ gridColumn: "span 2", marginTop: 10 }}
                type="submit"
                disabled={loading || !emailVerified}
              >
                {loading ? "Creating Account..." : "Create Designer Account"}
              </button>
            </div>

            <p className="ds-footer">
              Already registered?{" "}
              <Link href="/designerlogin" className="ds-link">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default DesignerSignup;