"use client";

import React, { useEffect, useState } from "react";
// Replace react-router-dom with next/navigation
import { useRouter } from "next/navigation"; 
import Sidebar from "./Sidebar";
import "./SellerBankDetails.css";
import {
  getSellerBankDetails,
  saveSellerBankDetails,
} from "../../api/seller";
import MessageBox from "../ui/MessageBox";

const SellerBankDetails = () => {
  const router = useRouter();
  const [sellerId, setSellerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const [form, setForm] = useState({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
  });

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  /* =========================
     INITIALISE & FETCH
  ========================= */
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

    const loadBankDetails = async () => {
      try {
        const res = await getSellerBankDetails(sellerId);
        if (res.data) {
          setForm(res.data);
        }
      } catch (err) {
        console.log("No existing bank details found.");
      } finally {
        setLoading(false);
      }
    };

    loadBankDetails();
  }, [sellerId]);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const { accountHolder, bankName, accountNumber, ifsc } = form;

    if (!accountHolder || !bankName || !accountNumber || !ifsc) {
      triggerMsg("Please fill all fields", "error");
      return;
    }

    setSaving(true);

    try {
      await saveSellerBankDetails({
        sellerId: Number(sellerId),
        accountHolder,
        bankName,
        accountNumber,
        ifsc,
      });

      triggerMsg("Bank details saved successfully ✅", "success");
    } catch (err) {
      triggerMsg(
        err?.response?.data?.message || "Failed to save bank details",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
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
          <h1 className="bs-heading">Bank Details</h1>

          {loading ? (
            <p>Loading…</p>
          ) : (
            <form className="bs-card bs-bank-form" onSubmit={handleSave}>
              <label>
                Account Holder Name
                <input
                  name="accountHolder"
                  value={form.accountHolder}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Bank Name
                <input
                  name="bankName"
                  value={form.bankName}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Account Number
                <input
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                IFSC Code
                <input
                  name="ifsc"
                  value={form.ifsc}
                  onChange={handleChange}
                  required
                />
              </label>

              <button className="bs-btn bs-btn--primary" disabled={saving}>
                {saving ? "Saving..." : "Save Details"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerBankDetails;