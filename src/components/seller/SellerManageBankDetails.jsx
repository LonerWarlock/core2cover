"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./SellerBankDetails.css";
import { saveSellerBankDetails } from "../../api/seller";
import MessageBox from "../ui/MessageBox";

const SellerSignupBankDetails = () => {
  const router = useRouter();
  const [sellerId, setSellerId] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("sellerId");
      if (!storedId) {
        router.push("/sellerlogin");
      } else {
        setSellerId(storedId);
      }
    }
  }, [router]);

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { accountHolder, bankName, accountNumber, ifsc } = form;

    if (!accountHolder || !bankName || !accountNumber || !ifsc) {
      triggerMsg("Please fill all fields", "error");
      return;
    }

    if (!sellerId) {
      triggerMsg("Seller session expired", "error");
      return;
    }

    setSaving(true);
    try {
      await saveSellerBankDetails({
        sellerId: Number(sellerId),
        ...form,
      });

      triggerMsg("Signup complete! Redirecting to dashboard...", "success");
      
      setTimeout(() => {
        router.push("/sellerdashboard");
      }, 2000);
    } catch (err) {
      triggerMsg(err.response?.data?.message || "Failed to save bank details", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bs-layout-root">
      {msg.show && (
        <MessageBox 
          message={msg.text} 
          type={msg.type} 
          onClose={() => setMsg({ ...msg, show: false })} 
        />
      )}

      <div className="bs-profile-shell">
        <h1 className="bs-heading">Add Bank Details</h1>
        <p className="bs-subheading">Enter your details to receive payments for your sales.</p>

        <form className="bs-card bs-bank-form" onSubmit={handleSubmit}>
          <div className="bs-input-group">
            <label>Account Holder Name</label>
            <input 
              name="accountHolder" 
              placeholder="As per bank records" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="bs-input-group">
            <label>Bank Name</label>
            <input 
              name="bankName" 
              placeholder="e.g., HDFC Bank" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="bs-input-group">
            <label>Account Number</label>
            <input 
              name="accountNumber" 
              type="password" /* Hidden for security */
              placeholder="Enter account number" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="bs-input-group">
            <label>IFSC Code</label>
            <input 
              name="ifsc" 
              placeholder="e.g., HDFC0001234" 
              onChange={handleChange} 
              required 
            />
          </div>

          <button className="bs-btn bs-btn--primary" disabled={saving}>
            {saving ? "Finalising..." : "Finish Signup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerSignupBankDetails;