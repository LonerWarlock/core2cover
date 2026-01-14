"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./SellerDeliveryDetails.css";
import { saveSellerDeliveryDetails } from "../../api/seller";
import MessageBox from "../ui/MessageBox";

const SellerDeliveryDetails = () => {
  const router = useRouter();
  
  const [sellerId, setSellerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success", show: false });

  const [delivery, setDelivery] = useState({
    deliveryResponsibility: "",
    deliveryCoverage: "",
    deliveryType: "",
    deliveryTimeMin: "",
    deliveryTimeMax: "",
    shippingChargeType: "",
    shippingCharge: "",
    internationalDelivery: false,
    installationAvailable: "",
    installationCharge: "",
  });


  const triggerMsg = (text, type = "success") => {
    setMsg({ text, type, show: true });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDelivery({
      ...delivery,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sellerId) {
      triggerMsg("Seller not logged in", "error");
      return;
    }

    if (!delivery.deliveryResponsibility || !delivery.deliveryCoverage) {
      triggerMsg("Please fill all required delivery fields", "error");
      return;
    }

    setLoading(true);
    try {
      await saveSellerDeliveryDetails({
        sellerId: Number(sellerId),
        ...delivery,
      });

      triggerMsg("Delivery details saved successfully ", "success");
      
      // Navigate to the next step (Bank Details) after a short delay
      setTimeout(() => {
        router.push("/sellermanagebankdetails");
      }, 2000);
    } catch (err) {
      triggerMsg(err.response?.data?.message || "Failed to save delivery details", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-container">
      {msg.show && (
        <MessageBox 
          message={msg.text} 
          type={msg.type} 
          onClose={() => setMsg({ ...msg, show: false })} 
        />
      )}

      <div className="delivery-card delivery-reveal">
        <h2 className="delivery-title">Delivery Preferences</h2>
        <p className="delivery-sub">Tell customers how you handle logistics and installation</p>

        <form onSubmit={handleSubmit} className="delivery-form">
          <div className="input-group">
            <label>Who will deliver the product? *</label>
            <select
              name="deliveryResponsibility"
              value={delivery.deliveryResponsibility}
              onChange={handleChange}
              required
            >
              <option value="">Select Responsibility</option>
              <option value="seller">Seller (Self Delivery)</option>
              <option value="courier">Courier Partner</option>
            </select>
          </div>

          <div className="input-group">
            <label>Delivery Coverage Area *</label>
            <select
              name="deliveryCoverage"
              value={delivery.deliveryCoverage}
              onChange={handleChange}
              required
            >
              <option value="">Select Coverage</option>
              <option value="pan-india">PAN India</option>
              <option value="selected-states">Selected States</option>
              <option value="selected-cities">Selected Cities</option>
            </select>
          </div>

          <div className="input-group">
            <label>Logistics Mode *</label>
            <select
              name="deliveryType"
              value={delivery.deliveryType}
              onChange={handleChange}
              required
            >
              <option value="">Select Mode</option>
              <option value="courier">Courier / Surface</option>
              <option value="seller-transport">Seller Transport (Truck/Tempo)</option>
            </select>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Min Delivery Days</label>
              <input
                type="number"
                name="deliveryTimeMin"
                placeholder="e.g. 3"
                value={delivery.deliveryTimeMin}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Max Delivery Days</label>
              <input
                type="number"
                name="deliveryTimeMax"
                placeholder="e.g. 7"
                value={delivery.deliveryTimeMax}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Shipping Charges *</label>
            <select
              name="shippingChargeType"
              value={delivery.shippingChargeType}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="free">Free Delivery</option>
              <option value="fixed">Fixed Charge</option>
            </select>
          </div>

          {delivery.shippingChargeType === "fixed" && (
            <div className="input-group">
              <label>Shipping Charge (₹)</label>
              <input
                type="number"
                name="shippingCharge"
                placeholder="Amount in ₹"
                value={delivery.shippingCharge}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="checkbox-row">
            <input
              type="checkbox"
              name="internationalDelivery"
              id="intl"
              checked={delivery.internationalDelivery}
              onChange={handleChange}
            />
            <label htmlFor="intl">Enable International Delivery</label>
          </div>

          <div className="input-group">
            <label>Installation Service</label>
            <select
              name="installationAvailable"
              value={delivery.installationAvailable}
              onChange={handleChange}
            >
              <option value="">Select Availability</option>
              <option value="no">Not Available</option>
              <option value="free">Available – Free</option>
              <option value="paid">Available – Paid</option>
            </select>
          </div>

          {delivery.installationAvailable === "paid" && (
            <div className="input-group">
              <label>Installation Charge (₹)</label>
              <input
                type="number"
                name="installationCharge"
                placeholder="Installation fee in ₹"
                value={delivery.installationCharge}
                onChange={handleChange}
              />
            </div>
          )}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Saving Details..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerDeliveryDetails;