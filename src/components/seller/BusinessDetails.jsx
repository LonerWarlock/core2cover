"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./BusinessDetails.css";
import { createSellerBusinessDetails } from "../../api/seller";
import MessageBox from "../ui/MessageBox";

const BusinessDetails = () => {
  const router = useRouter();

  const [business, setBusiness] = useState({
    businessName: "",
    sellerType: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  // Access localStorage safely in Client Component
  const [sellerId, setSellerId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("sellerId");
      setSellerId(storedId);
    }
  }, []);

  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusiness({ ...business, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!business.businessName || !business.sellerType) {
      triggerMsg("Please fill all required fields.", "error");
      return;
    }

    if (!sellerId) {
      triggerMsg("Seller session expired. Please sign up again.", "error");
      setTimeout(() => router.push("/sellerlogin"), 2000);
      return;
    }

    setLoading(true);

    try {
      await createSellerBusinessDetails({
        sellerId: Number(sellerId),
        businessName: business.businessName,
        sellerType: business.sellerType,
        address: business.address,
        city: business.city,
        state: business.state,
        pincode: business.pincode,
        gst: business.gst,
      });

      triggerMsg("Business details saved successfully ", "success");
      
      // Navigate after a short delay so user can see the success message
      setTimeout(() => {
        router.push("/deliverydetails");
      }, 2000);
      
    } catch (err) {
      triggerMsg(
        err?.response?.data?.message || "Failed to save business details",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="business-container">
      {msg.show && (
        <MessageBox 
          message={msg.text} 
          type={msg.type} 
          onClose={() => setMsg({ ...msg, show: false })} 
        />
      )}

      <div className="business-card business-reveal">
        <h2 className="business-title">Business Details</h2>
        <p className="business-sub">Tell us about what you sell at Core2Cover</p>

        <form onSubmit={handleSubmit} className="business-form">
          <div className="input-group">
            <label>Business / Store Name *</label>
            <input
              name="businessName"
              placeholder="e.g. Elegant Interiors"
              value={business.businessName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>What do you sell? *</label>
            <select
              name="sellerType"
              value={business.sellerType}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="interior-products">Interior Products</option>
              <option value="raw-materials">
                Raw Materials for Interior Products
              </option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="input-group">
            <label>Full Address</label>
            <input
              name="address"
              placeholder="Shop No, Street, Area"
              value={business.address}
              onChange={handleChange}
            />
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>City</label>
              <input
                name="city"
                placeholder="City"
                value={business.city}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>State</label>
              <input
                name="state"
                placeholder="State"
                value={business.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Pincode</label>
              <input
                name="pincode"
                placeholder="6-digit code"
                value={business.pincode}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>GST (optional)</label>
              <input
                name="gst"
                placeholder="GSTIN Number"
                value={business.gst}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Saving..." : "Finish & Go to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusinessDetails;