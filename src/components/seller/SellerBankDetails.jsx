import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar"
import "./SellerBankDetails.css";
import {
  getSellerBankDetails,
  saveSellerBankDetails,
} from "../../api/seller";

const SellerBankDetails = () => {
  const navigate = useNavigate();
  const sellerId = localStorage.getItem("sellerId");

  const [form, setForm] = useState({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =========================
     FETCH BANK DETAILS
  ========================= */
  useEffect(() => {
    if (!sellerId) {
      navigate("/sellerlogin");
      return;
    }

    const loadBankDetails = async () => {
      try {
        const res = await getSellerBankDetails(sellerId);
        if (res.data) {
          setForm(res.data);
        }
      } catch {
        // no bank details yet — safe to ignore
      } finally {
        setLoading(false);
      }
    };

    loadBankDetails();
  }, [sellerId, navigate]);

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
      alert("Please fill all fields");
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

      alert("Bank details saved successfully ✅");
      navigate("/sellerbankdetails");
    } catch (err) {
      alert(
        err?.response?.data?.message ||
        "Failed to save bank details"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="ms-root">
      <Sidebar/>
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
              />
            </label>

            <label>
              Bank Name
              <input
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
              />
            </label>

            <label>
              Account Number
              <input
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
              />
            </label>

            <label>
              IFSC Code
              <input
                name="ifsc"
                value={form.ifsc}
                onChange={handleChange}
              />
            </label>

            <button
              className="bs-btn bs-btn--primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save "}
            </button>
          </form>
        )}
      </div>
    </div>
    </div>
  );
};

export default SellerBankDetails;
