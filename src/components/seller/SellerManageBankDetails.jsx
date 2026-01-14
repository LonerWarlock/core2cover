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

  // Simplified state for UPI only
  const [form, setForm] = useState({
    upiId: "",
    accountHolder: "", // Still useful to know who owns the UPI
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
    if (!form.upiId || !form.accountHolder) {
      triggerMsg("Please fill all fields", "error");
      return;
    }

    setSaving(true);
    try {
      await saveSellerBankDetails({
        sellerId: Number(sellerId),
        ...form,
        // Send nulls for legacy bank fields if your backend requires them
        bankName: "UPI",
        accountNumber: "UPI",
        ifsc: "UPI",
      });

      triggerMsg("Signup complete! Redirecting to dashboard...", "success");
      setTimeout(() => router.push("/sellerdashboard"), 2000);
    } catch (err) {
      triggerMsg(err.response?.data?.message || "Failed to save UPI details", "error");
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
        <h1 className="bs-heading">Add Payment Details</h1>
        <p className="bs-subheading">Enter your UPI ID to receive payments for your sales.</p>

        <form className="bs-card bs-bank-form" onSubmit={handleSubmit}>
          <div className="bs-input-group">
            <label>Account Holder Name</label>
            <input 
              name="accountHolder" 
              placeholder="Name as per Bank/UPI" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="bs-input-group">
            <label>UPI ID</label>
            <input 
              name="upiId" 
              placeholder="username@bank or mobile@upi" 
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