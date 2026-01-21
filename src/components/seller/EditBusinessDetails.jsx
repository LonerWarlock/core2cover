"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./BusinessDetails.css";
import {
    getSellerBusinessDetails,
    updateSellerBusinessDetails,
} from "../../api/seller";
import Sidebar from "./Sidebar";
import MessageBox from "../ui/MessageBox";
// 1. IMPORT THE LOADING SPINNER
import LoadingSpinner from "../ui/LoadingSpinner";

const EditBusinessDetails = () => {
    const router = useRouter();
    const [sellerId, setSellerId] = useState(null);
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "success", show: false });

    const triggerMsg = (text, type = "success") => {
        setMsg({ text, type, show: true });
    };

    // Safe access to localStorage in Next.js
    useEffect(() => {
        if (typeof window !== "undefined") {
            const sid = localStorage.getItem("sellerId");
            if (!sid) {
                router.push("/sellerlogin");
            } else {
                setSellerId(sid);
            }
        }
    }, [router]);

    // Fetch existing details
    useEffect(() => {
        if (!sellerId) return;

        setLoading(true);
        getSellerBusinessDetails(sellerId)
            .then((res) => {
                setBusiness(res.data);
            })
            .catch((err) => {
                if (err.response?.status === 404) {
                    router.push("/business_details");
                } else {
                    triggerMsg("Failed to load business details", "error");
                }
            })
            .finally(() => setLoading(false));
    }, [sellerId, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBusiness({ ...business, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await updateSellerBusinessDetails(sellerId, business);
            triggerMsg("Business details updated successfully ", "success");
        } catch (err) {
            triggerMsg("Failed to update business details", "error");
        } finally {
            setSaving(false);
        }
    };

    // 2. APPLY THE LOADING SPINNER FOR INITIAL LOAD
    if (loading) return (
        <div className="sma-root">
            <Sidebar />
            <LoadingSpinner message="Retrieving business details..." />
            <div className="business_container" style={{ opacity: 0 }}>
                <p>Loading business details...</p>
            </div>
        </div>
    );
    
    if (!business) return null;

    return (
        <div className="sma-root">
            {/* 3. APPLY THE LOADING SPINNER DURING UPDATE */}
            {saving && <LoadingSpinner message="Updating your store profile..." />}

            {msg.show && (
                <MessageBox 
                    message={msg.text} 
                    type={msg.type} 
                    onClose={() => setMsg({ ...msg, show: false })} 
                />
            )}
            <Sidebar />
            <div className="business_container">
                <div className="business-card business-reveal">
                    <h2>Edit Business Details</h2>
                    <p>Update your store information at Core2Cover</p>

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
                            {saving ? "Saving Changes..." : "Update Business Details"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditBusinessDetails;