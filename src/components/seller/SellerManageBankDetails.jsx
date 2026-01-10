import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerBankDetails.css";
import { saveSellerBankDetails } from "../../api/seller";

const SellerSignupBankDetails = () => {
  const navigate = useNavigate();
  const sellerId = localStorage.getItem("sellerId"); // created earlier in signup

  const [form, setForm] = useState({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
        ...form,
      });

      navigate("/sellerdashboard");
    } catch {
      alert("Failed to save bank details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bs-layout-root">
      <div className="bs-profile-shell">
        <h1 className="bs-heading">Add Bank Details</h1>

        <form className="bs-card bs-bank-form" onSubmit={handleSubmit}>
          <input name="accountHolder" placeholder="Account Holder Name" onChange={handleChange} />
          <input name="bankName" placeholder="Bank Name" onChange={handleChange} />
          <input name="accountNumber" placeholder="Account Number" onChange={handleChange} />
          <input name="ifsc" placeholder="IFSC Code" onChange={handleChange} />

          <button className="bs-btn bs-btn--primary">
            {saving ? "Saving..." : "Finish Signup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerSignupBankDetails;
