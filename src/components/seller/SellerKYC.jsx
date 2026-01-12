"use client";

import React, { useState, useEffect } from "react";
import "./SellerKYC.css";
import { useRouter } from "next/navigation";
import { uploadSellerKYC } from "../../api/seller";
import MessageBox from "../ui/MessageBox";

const SellerKYC = () => {
  const Brand = ({ children }) => <span className="brand">{children}</span>;
  const router = useRouter();

  const [form, setForm] = useState({
    aadhaar: "",
    pan: "",
    aadhaarFile: null,
    panFile: null,
    declaration: false,
  });

  const [errors, setErrors] = useState({});
  const [panStatus, setPanStatus] = useState("idle"); // idle | verifying | verified | failed
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  /* =========================
      INPUT HANDLERS
  ========================= */
  const handleAadhaarChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, aadhaar: value });
  };

  const handlePanChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setForm({ ...form, pan: value });
    setPanStatus("idle");
  };

  const handleCheckbox = (e) => {
    setForm({ ...form, declaration: e.target.checked });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setForm({ ...form, [name]: files[0] });
    }
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
      // Mock logic: PANs ending in 'F' pass verification
      if (form.pan.endsWith("F")) {
        setPanStatus("verified");
        setErrors((prev) => ({ ...prev, panVerify: null, pan: null }));
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
    if (!/^\d{12}$/.test(form.aadhaar)) err.aadhaar = "Aadhaar must be 12 digits";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan)) err.pan = "Invalid PAN format";
    if (panStatus !== "verified") err.panVerify = "PAN must be verified";
    if (!form.aadhaarFile) err.aadhaarFile = "Aadhaar card scan required";
    if (!form.panFile) err.panFile = "PAN card scan required";
    if (!form.declaration) err.declaration = "Please confirm the declaration";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* =========================
      SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      triggerMsg("Please correct the errors before submitting.", "error");
      return;
    }

    const sellerId = localStorage.getItem("sellerId");
    if (!sellerId) {
      triggerMsg("Session expired. Please sign up again.", "error");
      return;
    }

    const payload = new FormData();
    payload.append("aadhaar", form.aadhaar);
    payload.append("pan", form.pan);
    payload.append("aadhaarFile", form.aadhaarFile);
    payload.append("panFile", form.panFile);

    setLoading(true);
    try {
      await uploadSellerKYC(sellerId, payload);
      triggerMsg("KYC Documents submitted successfully!", "success");
      setTimeout(() => router.push("/deliverydetails"), 2000);
    } catch (err) {
      triggerMsg(err.response?.data?.message || "KYC submission failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-kyc-page">
      {msg.show && (
        <MessageBox 
          message={msg.text} 
          type={msg.type} 
          onClose={() => setMsg({ ...msg, show: false })} 
        />
      )}

      <form className="seller-kyc-card seller-kyc-reveal" onSubmit={handleSubmit}>
        <h1 className="seller-kyc-title">Identity Verification</h1>
        <p className="seller-kyc-subtitle">
          Verify your details to start selling on <Brand>Core2Cover</Brand>
        </p>

        <div className="seller-kyc-field">
          <label>Aadhaar Number *</label>
          <input
            type="text"
            maxLength="12"
            value={form.aadhaar}
            onChange={handleAadhaarChange}
            placeholder="1234 5678 9012"
          />
          {errors.aadhaar && <span className="seller-kyc-error">{errors.aadhaar}</span>}
        </div>

        <div className="seller-kyc-field seller-kyc-pan-row">
          <div style={{ flex: 1 }}>
            <label>PAN Number *</label>
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
            {panStatus === "verifying" ? "Verifying..." : panStatus === "verified" ? "Verified ✓" : panStatus === "failed" ? "Failed" : "Verify"}
          </button>
        </div>
        {(errors.pan || errors.panVerify) && (
          <span className="seller-kyc-error">{errors.pan || errors.panVerify}</span>
        )}

        <div className="seller-kyc-file">
          <label>Upload Aadhaar Card (Front/Back) *</label>
          <input type="file" name="aadhaarFile" accept="image/*,application/pdf" onChange={handleFileChange} />
          {errors.aadhaarFile && <span className="seller-kyc-error">{errors.aadhaarFile}</span>}
        </div>

        <div className="seller-kyc-file">
          <label>Upload PAN Card *</label>
          <input type="file" name="panFile" accept="image/*,application/pdf" onChange={handleFileChange} />
          {errors.panFile && <span className="seller-kyc-error">{errors.panFile}</span>}
        </div>

        <div className="seller-kyc-checkbox">
          <input type="checkbox" checked={form.declaration} onChange={handleCheckbox} id="decl" />
          <label htmlFor="decl">I confirm the above details belong to me and are accurate.</label>
        </div>
        {errors.declaration && <span className="seller-kyc-error">{errors.declaration}</span>}

        <p className="seller-kyc-note">
          🔒 Your documents are encrypted and used only for statutory compliance. 
          Verification typically takes 24-48 hours.
        </p>

        <button type="submit" className="seller-kyc-submit" disabled={loading}>
          {loading ? "Processing..." : "Submit KYC"}
        </button>
      </form>
    </div>
  );
};

export default SellerKYC;