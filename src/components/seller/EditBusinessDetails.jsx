// File: src/components/seller/EditBusinessDetails.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BusinessDetails.css";
import {
    getSellerBusinessDetails,
    updateSellerBusinessDetails,
} from "../../api/seller";
import Sidebar from "./Sidebar";

const EditBusinessDetails = () => {
    const navigate = useNavigate();
    const sellerId = localStorage.getItem("sellerId");

    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!sellerId) {
            navigate("/sellerlogin");
            return;
        }

        getSellerBusinessDetails(sellerId)
            .then((res) => {
                setBusiness(res.data);
            })
            .catch((err) => {
                if (err.response?.status === 404) {
                    navigate("/editbusinessdetails");
                } else {
                    alert("Failed to load business details");
                }
            })
            .finally(() => setLoading(false));
    }, [sellerId, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBusiness({ ...business, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await updateSellerBusinessDetails(sellerId, business);
            alert("Business details updated successfully ✅");
            navigate("/editbusinessdetails");
        } catch (err) {
            alert("Failed to update business details");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!business) return null;

    return (
        <div className="sma-root">
            <Sidebar />
            <div className="business_container">
                <div className="business-card">
                    <h2>Edit Business Details</h2>
                    <p>Update your store information</p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Business / Store Name *</label>
                            <input
                                name="businessName"
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
                                <option value="interior-products">Interior Products</option>
                                <option value="raw-materials">
                                    Raw Materials for Interior Products
                                </option>
                                <option value="both">Both</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Address</label>
                            <input
                                name="address"
                                value={business.address || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid-2">
                            <input
                                name="city"
                                placeholder="City"
                                value={business.city || ""}
                                onChange={handleChange}
                            />
                            <input
                                name="state"
                                placeholder="State"
                                value={business.state || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid-2">
                            <input
                                name="pincode"
                                placeholder="Pincode"
                                value={business.pincode || ""}
                                onChange={handleChange}
                            />
                            <input
                                name="gst"
                                placeholder="GST (optional)"
                                value={business.gst || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="primary-btn" disabled={saving}>
                            {saving ? "Saving..." : "Update Business Details"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditBusinessDetails;
