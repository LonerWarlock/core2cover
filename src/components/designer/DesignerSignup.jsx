import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./DesignerSignup.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  designerSignup,
  sendDesignerOtp,
  verifyDesignerOtp,
} from "../../api/designer";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_1.png";

const DesignerSignup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    mobile: "",
    location: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [error, setError] = useState("");

  // ref to focus password after verification
  const passwordRef = useRef(null);

  useEffect(() => {
    if (emailVerified) {
      // small timeout so transition finishes
      setTimeout(() => passwordRef.current?.focus(), 160);
    }
  }, [emailVerified]);

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  /* =========================
     SEND EMAIL OTP
  ========================= */
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

      alert("OTP sent to your email. Check inbox / spam.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  /* =========================
     VERIFY EMAIL OTP
  ========================= */
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
      alert("Email verified ✅");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  /* =========================
     SUBMIT SIGNUP
  ========================= */
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailVerified) {
      setError("Verify email before signup");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
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

      // adapt to your response shape
      const designerId = res?.designer?.id || res?.data?.designer?.id || res?.data?.id;
      if (designerId) localStorage.setItem("designerId", designerId);

      navigate("/designer_profile_setup");
    } catch (err) {
      console.error("DESIGNER SIGNUP ERROR:", err);

      if (err.response?.status === 409 || err.response?.status === 400) {
        setError(err.response?.data?.message || "Account exists");
      } else {
        setError("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="designer-signup-page">
      <div className="ds-auth-box">
        <img
          src={CoreToCoverLogo}
          alt="CoreToCover"
          className="brand-logo"
        />
        <p className="ds-sub">Join as a Designer</p>

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

          {/* OTP SECTION */}
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
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
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
                <p style={{ color: "green", fontWeight: 700, margin: 0 }}>
                  Email verified ✓
                </p>
              )}
            </div>
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
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="City or location"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          {/* Hidden until verified: password / confirm / availability / submit */}
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
                  required
                />
                <button
                  type="button"
                  className="ds-toggle-visibility"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Hide password" : "Show password"}
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
                  required
                />
                <button
                  type="button"
                  className="ds-toggle-visibility"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  aria-label={showConfirmPass ? "Hide confirm password" : "Show confirm password"}
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
            <Link to="/designerlogin" className="ds-link">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default DesignerSignup;
