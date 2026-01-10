import React, { useState } from "react";
import "./SellerKYC.css";
import { useNavigate } from "react-router-dom";

const SellerKYC = () => {
  const Brand = ({ children }) => <span className="brand">{children}</span>;

  const navigate = useNavigate();

  const [form, setForm] = useState({
    aadhaar: "",
    pan: "",
    aadhaarFile: null,
    panFile: null,
    declaration: false,
  });

  const [errors, setErrors] = useState({});
  const [panStatus, setPanStatus] = useState("idle");
  // idle | verifying | verified | failed

  /* =========================
     INPUT HANDLERS
  ========================= */

  const handleAadhaarChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, aadhaar: value });
  };

  const handlePanChange = (e) => {
    const value = e.target.value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
    setForm({ ...form, pan: value });
    setPanStatus("idle");
  };

  const handleCheckbox = (e) => {
    setForm({ ...form, declaration: e.target.checked });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm({ ...form, [name]: files[0] });
  };

  /* =========================
     PAN VERIFICATION (MOCK)
  ========================= */

  const verifyPan = () => {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan)) {
      setErrors({ ...errors, pan: "Invalid PAN format" });
      return;
    }

    setPanStatus("verifying");

    setTimeout(() => {
      if (form.pan.endsWith("F")) {
        setPanStatus("verified");
      } else {
        setPanStatus("failed");
      }
    }, 1500);
  };

  /* =========================
     VALIDATION
  ========================= */

  const validate = () => {
    const err = {};

    if (!/^\d{12}$/.test(form.aadhaar))
      err.aadhaar = "Aadhaar must be 12 digits";

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan))
      err.pan = "Invalid PAN format";

    if (panStatus !== "verified")
      err.panVerify = "PAN must be verified";

    if (!form.aadhaarFile)
      err.aadhaarFile = "Aadhaar card required";

    if (!form.panFile)
      err.panFile = "PAN card required";

    if (!form.declaration)
      err.declaration = "Please confirm declaration";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = new FormData();
    Object.entries(form).forEach(([k, v]) => payload.append(k, v));

    console.log("KYC Submitted");
    navigate("/deliverydetails");
  };

  return (
    <div className="seller-kyc-page">
      <form className="seller-kyc-card" onSubmit={handleSubmit}>
        <h1 className="seller-kyc-title">Seller Verification</h1>

        <p className="seller-kyc-subtitle">
          Verify your identity to maintain trust on <Brand>Core2Cover</Brand>
        </p>

        {/* Aadhaar */}
        <div className="seller-kyc-field">
          <label>Aadhaar Number</label>
          <input
            type="text"
            maxLength="12"
            value={form.aadhaar}
            onChange={handleAadhaarChange}
            placeholder="123456789012"
          />
          {errors.aadhaar && (
            <span className="seller-kyc-error">{errors.aadhaar}</span>
          )}
        </div>

        {/* PAN */}
        <div className="seller-kyc-field seller-kyc-pan-row">
          <div>
            <label>PAN Number</label>
            <input
              type="text"
              maxLength="10"
              value={form.pan}
              onChange={handlePanChange}
              placeholder="ABCDE1234F"
            />
          </div>

          <button
            type="button"
            className={`seller-kyc-verify-btn ${panStatus}`}
            onClick={verifyPan}
            disabled={panStatus === "verifying" || !form.pan}
          >
            {panStatus === "verifying" && "Verifying..."}
            {panStatus === "verified" && "Verified ✓"}
            {panStatus === "failed" && "Failed"}
            {panStatus === "idle" && "Verify"}
          </button>
        </div>

        {(errors.pan || errors.panVerify) && (
          <span className="seller-kyc-error">
            {errors.pan || errors.panVerify}
          </span>
        )}

        {/* Files */}
        <div className="seller-kyc-file">
          <label>Aadhaar Card</label>
          <input type="file" name="aadhaarFile" onChange={handleFileChange} />
          {errors.aadhaarFile && (
            <span className="seller-kyc-error">{errors.aadhaarFile}</span>
          )}
        </div>

        <div className="seller-kyc-file">
          <label>PAN Card</label>
          <input type="file" name="panFile" onChange={handleFileChange} />
          {errors.panFile && (
            <span className="seller-kyc-error">{errors.panFile}</span>
          )}
        </div>

        {/* Declaration */}
        <div className="seller-kyc-checkbox">
          <input
            type="checkbox"
            checked={form.declaration}
            onChange={handleCheckbox}
          />
          <label>
            I confirm the above details are accurate and belong to me
          </label>
        </div>

        {errors.declaration && (
          <span className="seller-kyc-error">{errors.declaration}</span>
        )}

        <p className="seller-kyc-note">
          🔒 Your documents are securely handled and used solely for identity
          verification purposes. We do not display or sell your personal
          information and share it only with trusted verification and
          infrastructure providers when required to operate our services.
        </p>

        <button className="seller-kyc-submit">Submit</button>
      </form>
    </div>
  );
};

export default SellerKYC;
