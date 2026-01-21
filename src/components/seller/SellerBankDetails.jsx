"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import Sidebar from "./Sidebar";
import "./SellerBankDetails.css";
import { getSellerBankDetails, saveSellerBankDetails } from "../../api/seller";
import MessageBox from "../ui/MessageBox";
// 1. IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner";

const SellerBankDetails = () => {
  const router = useRouter();
  const [sellerId, setSellerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const [form, setForm] = useState({
    upiId: "",
    accountHolder: "",
  });

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

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

  useEffect(() => {
    if (!sellerId) return;
    const loadDetails = async () => {
      try {
        setLoading(true);
        const res = await getSellerBankDetails(sellerId);
        if (res.data) {
          setForm({
            upiId: res.data.upiId || "",
            accountHolder: res.data.accountHolder || "",
          });
        }
      } catch (err) {
        console.log("No details found.");
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [sellerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSellerBankDetails({
        sellerId: Number(sellerId),
        ...form,
        bankName: "UPI",
        accountNumber: "UPI",
        ifsc: "UPI",
      });
      triggerMsg("UPI details updated successfully ", "success");
    } catch (err) {
      triggerMsg(err?.response?.data?.message || "Failed to update details", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* 2. TOP LEVEL LOADERS FOR MAXIMUM VISIBILITY */}
      {loading && <LoadingSpinner message="Retrieving payment settings..." />}
      {saving && <LoadingSpinner message="Updating UPI records..." />}

      <div className="ms-root">
        {msg.show && (
          <MessageBox 
            message={msg.text} 
            type={msg.type} 
            onClose={() => setMsg({ ...msg, show: false })} 
          />
        )}
        
        <Sidebar />
        <div className="bs-layout-root">
          <div className="bs-profile-shell">
            <h1 className="bs-heading">Payment Settings</h1>
            
            {/* Form is hidden or dimmed while loading to prevent jumps */}
            {!loading && (
              <form className="bs-card bs-bank-form" onSubmit={handleSave}>
                <div className="bs-input-group">
                  <label>Account Holder Name</label>
                  <input
                    name="accountHolder"
                    value={form.accountHolder}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="bs-input-group">
                  <label>UPI ID</label>
                  <input
                    name="upiId"
                    value={form.upiId}
                    onChange={handleChange}
                    placeholder="example@okaxis"
                    required
                  />
                </div>

                <button className="bs-btn bs-btn--primary" disabled={saving}>
                  {saving ? "Updating..." : "Update UPI Details"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerBankDetails;